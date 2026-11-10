from fastapi.testclient import TestClient
from main import app

def test_health_endpoint_reports_service_health():
    # Liveness has no storage dependency and does not enter lifespan.
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
