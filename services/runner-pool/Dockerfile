FROM rancher/k3s@sha256:21ea6e0fac4e3930c2ce8aa40ddd41a8b18cb3e9a0222c030dc005e7e88c4332 AS kubectl
FROM python@sha256:8523d6abeb48ceae0b7240d30c5808fc26cb79c1a635bacdf19cf3baecfbec07
USER root
RUN python -m pip uninstall -y pip
COPY --from=kubectl /bin/k3s /usr/local/bin/kubectl
COPY pool_manager.py pool_manager_parallel.py pool_supervisor.py pool_service.py /opt/preview-pool/
ENV HOME=/tmp
USER 10001:10001
WORKDIR /opt/preview-pool
CMD ["python", "/opt/preview-pool/pool_service.py"]
