from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_customer():
    response = client.post(
        "/api/v1/customers/",
        json={"name": "Test Customer", "status": "Active", "total_spent": 0, "total_transactions": 0},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Customer"

def test_read_customers():
    response = client.get("/api/v1/customers/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)