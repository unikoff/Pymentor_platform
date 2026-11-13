"""Ephemeral lab coordinator; run only on the test VPS, never as a production service."""
import concurrent.futures,json,queue,subprocess,threading,time,uuid

NAMESPACE='runner-pool-lab-20261109'
IMAGE='docker.io/pymentor/code-runner@sha256:aab3c060428a33f1918d0edaddfafff3ccfd03f1e0403462710fa4dd89227834'
KUBECTL=['k3s','kubectl','--context','default','-n',NAMESPACE]

def kubectl(args,data=None,timeout=50):
    p=subprocess.run(KUBECTL+args,input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
    if p.returncode:raise RuntimeError('kubectl failed: '+p.stderr.decode(errors='replace')[-400:])
    return p.stdout.decode('utf-8','replace')

def manifest(name,supervisor):
    return {'apiVersion':'batch/v1','kind':'Job','metadata':{'name':name,'namespace':NAMESPACE,'labels':{'app':'pool-lab'}},'spec':{'backoffLimit':0,'activeDeadlineSeconds':240,'ttlSecondsAfterFinished':60,'template':{'metadata':{'labels':{'app':'pool-lab'}},'spec':{'runtimeClassName':'gvisor','automountServiceAccountToken':False,'restartPolicy':'Never','terminationGracePeriodSeconds':1,'securityContext':{'runAsNonRoot':True,'runAsUser':65532,'runAsGroup':65532,'seccompProfile':{'type':'RuntimeDefault'}},'containers':[{'name':'run','image':IMAGE,'imagePullPolicy':'IfNotPresent','stdin':True,'stdinOnce':True,'tty':False,'command':['python','-I','-c',supervisor],'securityContext':{'allowPrivilegeEscalation':False,'readOnlyRootFilesystem':True,'capabilities':{'drop':['ALL']}},'resources':{'requests':{'cpu':'100m','memory':'64Mi','ephemeral-storage':'16Mi'},'limits':{'cpu':'500m','memory':'128Mi','ephemeral-storage':'32Mi'}}}]}}}}

class Pool:
    def __init__(self,supervisor,size=3):
        self.supervisor=supervisor;self.size=size;self.ready=queue.Queue(maxsize=size)
        self.lock=threading.Lock();self.jobs=set();self.offered=set();self.used=set();self.closed=False
        self.executor=concurrent.futures.ThreadPoolExecutor(max_workers=size)
        self.failures=[];self.refills=[]

    def create(self):
        with self.lock:
            if self.closed:return
            name='warm-'+uuid.uuid4().hex
            self.jobs.add(name)
        try:
            kubectl(['create','-f','-'],json.dumps(manifest(name,self.supervisor)).encode(),timeout=20)
            deadline=time.monotonic()+60
            pod=None
            while time.monotonic()<deadline:
                items=json.loads(kubectl(['get','pods','-l','job-name='+name,'-o','json'],timeout=10))['items']
                if len(items)>1:raise RuntimeError('multiple pods for job')
                if items:
                    pod=items[0];break
                time.sleep(.2)
            if pod is None:raise TimeoutError('pod was not created')
            podname=pod['metadata']['name'];uid=pod['metadata']['uid']
            assert any(r.get('kind')=='Job' and r.get('name')==name and r.get('controller') for r in pod['metadata'].get('ownerReferences',[]))
            kubectl(['wait','--for=condition=Ready','pod/'+podname,'--timeout=45s'],timeout=50)
            guard_deadline=time.monotonic()+10
            while time.monotonic()<guard_deadline:
                logs=kubectl(['logs','pod/'+podname],timeout=10)
                if 'POOL_SUPERVISOR_READY' in logs:break
                time.sleep(.1)
            else:raise RuntimeError('supervisor guard not ready')
            with self.lock:
                if self.closed:raise RuntimeError('pool closed')
                if uid in self.offered:raise RuntimeError('duplicate pod UID')
                self.offered.add(uid)
            self.ready.put((name,podname,uid),timeout=2)
        except Exception as e:
            with self.lock:self.failures.append(type(e).__name__+': '+str(e)[:200])
            self.delete(name)
            raise

    def start(self):
        futures=[self.executor.submit(self.create) for _ in range(self.size)]
        for f in futures:f.result(timeout=90)

    def recover_orphans(self):
        # Lab namespace is exclusive to this experiment; never adopt an old UID.
        import re
        items=json.loads(kubectl(['get','jobs','-l','app=pool-lab','-o','json'],timeout=15))['items']
        names=[]
        for item in items:
            name=item['metadata']['name']
            if not re.fullmatch(r'warm-[a-f0-9]{32}',name):raise RuntimeError('unexpected job in lab namespace')
            names.append(name)
        for name in names:kubectl(['delete','job',name,'--ignore-not-found=true','--cascade=foreground','--wait=true','--timeout=45s'],timeout=50)
        return len(names)

    def delete(self,name):
        kubectl(['delete','job',name,'--ignore-not-found=true','--cascade=foreground','--wait=true','--timeout=45s'],timeout=50)
        with self.lock:self.jobs.discard(name)

    def refill(self,name):
        started=time.monotonic()
        try:
            self.delete(name)
            with self.lock:closed=self.closed
            if not closed:self.create()
        except Exception as e:
            with self.lock:self.failures.append('refill '+type(e).__name__+': '+str(e)[:150])
        finally:
            with self.lock:self.refills.append(time.monotonic()-started)

    def execute(self,code,timeout=20):
        begin=time.monotonic()
        try:item=self.ready.get(timeout=60)
        except queue.Empty:raise TimeoutError('no ready disposable sandbox')
        claimed=time.monotonic();name,pod,uid=item
        with self.lock:
            duplicate=uid in self.used
            if not duplicate:self.used.add(uid)
        if duplicate:
            self.executor.submit(self.refill,name)
            raise RuntimeError('sandbox reused')
        try:
            payload=(json.dumps({'code':code},ensure_ascii=True)+'\n').encode()
            out=kubectl(['attach','-i','pod/'+pod,'-c','run'],payload,timeout=timeout)
            result=json.loads(out)
            if type(result) is not dict or type(result.get('ok')) is not bool:raise ValueError('bad result')
            return {'result':result,'uid':uid,'latency':time.monotonic()-begin,'queue':claimed-begin}
        finally:
            self.executor.submit(self.refill,name)

    def shutdown(self):
        with self.lock:self.closed=True
        self.executor.shutdown(wait=True)
        with self.lock:names=list(self.jobs)
        for name in names:self.delete(name)
