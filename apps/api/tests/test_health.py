from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_model_catalog() -> None:
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    payload = response.json()
    assert any(item["key"] == "sd15-ddim" for item in payload)
