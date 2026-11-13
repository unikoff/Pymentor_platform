"""Test-only solve bridge. Results from the student process are not trustworthy."""
import json
import math

# This source runs inside the existing broker's disposable job, never in Core.
WORKER = '''import json
from pymentor_restricted_worker import observe
print(json.dumps(observe(PAYLOAD), ensure_ascii=True, allow_nan=False, separators=(",", ":")))
'''


def encode(value):
    t = type(value)
    if t in (type(None), bool, int, float, str):
        if t is float and not math.isfinite(value): raise ValueError('nonfinite')
        return [t.__name__, value]
    if t in (list, tuple, set, frozenset): return [t.__name__, [encode(x) for x in value]]
    if t is dict: return ['dict', [[encode(k), encode(v)] for k, v in value.items()]]
    raise ValueError('unsupported value')


def valid_json(value, depth=0, budget=None):
    if budget is None: budget = [4096]
    budget[0] -= 1
    if budget[0] < 0 or depth > 32: raise ValueError('too complex')
    t = type(value)
    if t is dict:
        for k,v in value.items():
            if type(k) is not str: raise ValueError('non-string key')
            valid_json(v, depth+1, budget)
    elif t is list:
        for v in value: valid_json(v, depth+1, budget)
    elif t not in (str, int, float, bool, type(None)): raise ValueError('unsupported')
    elif t is float and not math.isfinite(value): raise ValueError('nonfinite')


def unpack(value, depth=0, budget=None):
    if budget is None: budget = [4096]
    budget[0] -= 1
    if budget[0] < 0 or depth > 32 or type(value) is not list or len(value) != 2: raise ValueError('bad typed value')
    tag, v = value
    types = {'NoneType':type(None), 'bool':bool, 'int':int, 'float':float, 'str':str}
    if tag in types:
        if type(v) is not types[tag] or (tag == 'float' and not math.isfinite(v)): raise ValueError('bad scalar')
        return v
    if tag in ('list','tuple','set','frozenset') and type(v) is list:
        items = [unpack(x, depth+1, budget) for x in v]
        return {'list':list,'tuple':tuple,'set':set,'frozenset':frozenset}[tag](items)
    if tag == 'dict' and type(v) is list:
        result = {}
        for pair in v:
            if type(pair) is not list or len(pair) != 2: raise ValueError('bad dict')
            k = unpack(pair[0], depth+1, budget); item = unpack(pair[1], depth+1, budget)
            if k in result: raise ValueError('duplicate key')
            result[k] = item
        return result
    raise ValueError('bad tag')


def equal(a,b,tolerance=None):
    if type(a) is not type(b): return False
    if type(a) is dict:
        return len(a)==len(b) and all(any(equal(k, j) and equal(v, w) for j,w in b.items()) for k,v in a.items())
    if type(a) in (list,tuple): return len(a)==len(b) and all(equal(x,y) for x,y in zip(a,b))
    if type(a) in (set,frozenset): return len(a)==len(b) and all(any(equal(x,y) for y in b) for x in a)
    if type(a) is float and tolerance is not None: return math.isclose(a,b,rel_tol=0,abs_tol=tolerance)
    return a == b


def run(code, task, preview, call, legacy, unavailable):
    try:
        tests = task.get('tests')
        if type(tests) is not list or not 1 <= len(tests) <= 50: raise ValueError('tests')
        req = task.get('requirements')
        if req is not None and (type(req) is not dict or set(req)-{'items','nodes','names','calls','attributes'} or any(type(v) is not list or any(type(x) is not str for x in v) for v in req.values())): raise ValueError('requirements')
        inputs = []
        for t in tests:
            if type(t) is not dict or set(t)-{'name','args','kwargs','expected','assert','float_tolerance','no_stdout','preserve_inputs'} or 'expected' not in t: raise ValueError('test schema')
            if t.get('assert') not in (None,'stdout') or type(t.get('args',[])) is not list or type(t.get('kwargs',{})) is not dict: raise ValueError('input schema')
            if any(type(t.get(k,False)) is not bool for k in ('no_stdout','preserve_inputs')): raise ValueError('flags')
            if 'name' in t and type(t['name']) is not str: raise ValueError('name')
            tol=t.get('float_tolerance')
            if tol is not None and (type(tol) not in (int,float) or not math.isfinite(tol) or tol < 0): raise ValueError('tolerance')
            valid_json(t.get('args',[])); valid_json(t.get('kwargs',{})); encode(t['expected'])
            if t.get('assert') == 'stdout' and type(t['expected']) is not str: raise ValueError('stdout expected')
            inputs.append({'args':t.get('args',[]), 'kwargs':t.get('kwargs',{})})
        error = (f'Код слишком длинный. Лимит: {legacy.MAX_CODE_LENGTH} символов.' if len(code)>legacy.MAX_CODE_LENGTH else legacy._blocked_reason(code) or legacy._syntax_error_reason(code))
        if not error: error = legacy._requirements_error(code, req)
        if error: return {'ok':False,'score':0,'tests':[],'stdout':'','error':error}
        selected = tests[:1] if preview else tests
        payload = json.dumps({'code':code, 'inputs':inputs[:len(selected)]}, ensure_ascii=True, allow_nan=False, separators=(',',':'))
        source = 'PAYLOAD = '+repr(payload)+'\n'+WORKER
        if len(source)>8000 or len(source.encode())>32000: raise ValueError('payload limit')
        response = call(source)
        if not response['ok']: return {'ok':False,'score':0,'tests':[],'stdout':response['stdout'],'error':response['error'] or 'Ошибка выполнения.'}
        obj = json.loads(response['stdout'], object_pairs_hook=_unique)
        if type(obj) is not dict or set(obj)!={'setup','observations','error'} or type(obj['setup']) is not str or type(obj['observations']) is not list or (obj['error'] is not None and type(obj['error']) is not str): raise ValueError('response schema')
        if obj['error'] is not None:
            if obj['observations']: raise ValueError('partial result')
            return {'ok':False,'score':0,'tests':[],'stdout':obj['setup'],'error':obj['error']}
        if len(obj['observations']) != len(selected): raise ValueError('partial result')
        results=[]
        for index,(test,obs) in enumerate(zip(selected,obj['observations']),1):
            if type(obs) is not dict or set(obs)!={'actual','args','kwargs','stdout','error'} or type(obs['stdout']) is not str or (obs['error'] is not None and type(obs['error']) is not str): raise ValueError('observation')
            actual = None
            err=obs['error']
            if err is None:
                actual=unpack(obs['actual']); args=unpack(obs['args']); kwargs=unpack(obs['kwargs'])
                if type(args) is not list or type(kwargs) is not dict: raise ValueError('observed input')
                if test.get('preserve_inputs') and (not equal(args,inputs[index-1]['args']) or not equal(kwargs,inputs[index-1]['kwargs'])): err='Функция изменила входные данные.'
                if test.get('no_stdout') and (obj['setup'] or obs['stdout']): err='Функция не должна выводить результат через print().'
            elif any(obs[k] is not None for k in ('actual','args','kwargs')): raise ValueError('inconsistent observation')
            observed=obs['stdout'] if test.get('assert')=='stdout' and err is None else actual
            expected=test['expected']
            normal=lambda s: s.replace('\r\n','\n').replace('\r','\n').removesuffix('\n')
            passed=err is None and (equal(normal(expected),normal(observed)) if test.get('assert')=='stdout' else equal(expected,observed,test.get('float_tolerance')))
            item={'name':test.get('name') or f'test {index}','passed':passed,'expected':legacy._jsonable(expected),'actual':legacy._jsonable(observed)}
            if err: item['error']=err
            results.append(item)
        stdout=obj['observations'][-1]['stdout'][-1200:]
        if preview:
            if results[0].get('error'): return {'ok':False,'error':results[0]['error'],'stdout':stdout}
            actual=results[0]['actual']
            return {'ok':True,'stdout':stdout or (json.dumps(actual,ensure_ascii=False) if isinstance(actual,(dict,list,tuple)) else str(actual))}
        count=sum(x['passed'] for x in results)
        return {'ok':count==len(results),'score':round(count/len(results)*100),'tests':results,'stdout':stdout}
    except (ValueError,TypeError,KeyError,OverflowError,RecursionError,UnicodeError):
        raise unavailable() from None


def _unique(pairs):
    result={}
    for k,v in pairs:
        if k in result: raise ValueError('duplicate key')
        result[k]=v
    return result
