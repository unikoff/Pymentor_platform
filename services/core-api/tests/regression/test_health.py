"""Liveness from canonical ASGI without storage or lifespan."""
from test_factory import child

def test_health_endpoint_reports_service_health(tmp_path):
    child('''from fastapi.testclient import TestClient
from pymentor_core.app.asgi import create_app
client = TestClient(create_app())
response = client.get('/health')
assert response.status_code == 200
assert response.json() == {'status': 'ok'}
client.close()
''', tmp_path)
