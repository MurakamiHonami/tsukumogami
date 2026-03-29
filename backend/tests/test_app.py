import io
from collections import namedtuple
from datetime import date
from unittest.mock import patch

import pytest

from app import app, db, estimate_expiration_date, guess_category, get_category_id


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.app_context():
        db.session.remove()
        db.drop_all()
        db.create_all()

    with app.test_client() as test_client:
        yield test_client

    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.mark.parametrize("category_name, expected_id", [
    ("火災警報器", 1),
    ("冷蔵庫", 2),
    ("食品", 19),

    ("存在しないアイテム", 99),
    ("", 99),
    (None, 99),
])

def test_get_category_if(category_name, expected_id):
    assert get_category_id(category_name) == expected_id

def build_task_payload():
    return {
        "barcode": "4901234567890",
        "purchase_date": "2026-03-26",
        "product_name": "Emergency Battery Pack",
        "category": "battery",
        "suggested_expiration": "2027-03-26",
        "reason": "Replace once a year to keep it ready.",
        "product_image": "https://example.com/product.png",
        "yokai": "tanuki",
    }


def test_guess_category():
    assert guess_category("smoke detector", "") != ""
    assert guess_category("battery pack", "") != ""


def test_estimate_expiration_date():
    base_date = date(2026, 3, 22)
    assert estimate_expiration_date("食品", base_date) == date(2026, 9, 18)


def test_get_tasks_empty(client):
    response = client.get("/api/tasks")

    assert response.status_code == 200
    assert response.get_json() == []


def test_register_and_login_success(client):
    register_response = client.post(
        "/api/auth/register",
        json={"username": "alice", "password": "pass12345"},
    )
    assert register_response.status_code == 201
    registered_user = register_response.get_json()
    assert registered_user["username"] == "alice"
    assert registered_user["id"] > 0

    login_response = client.post(
        "/api/auth/login",
        json={"username": "alice", "password": "pass12345"},
    )
    assert login_response.status_code == 200
    logged_in_user = login_response.get_json()
    assert logged_in_user["id"] == registered_user["id"]
    assert logged_in_user["username"] == "alice"


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={"username": "alice", "password": "pass12345"})
    response = client.post("/api/auth/register", json={"username": "alice", "password": "pass12345"})

    assert response.status_code == 409


def test_create_task_success(client):
    response = client.post("/api/tasks", json=build_task_payload())

    assert response.status_code == 201
    data = response.get_json()
    assert data["id"] > 0
    assert data["barcode"] == "4901234567890"
    assert data["product_name"] == "Emergency Battery Pack"
    assert data["suggested_expiration"] == "2027-03-26"
    assert data["task_is_done"] is False


def test_create_task_invalid(client):
    response = client.post("/api/tasks", json={"product_name": "Missing fields"})

    assert response.status_code == 400
    assert "Missing required fields" in response.get_json()["detail"]


def test_get_tasks_returns_created_task(client):
    client.post("/api/tasks", json=build_task_payload())

    response = client.get("/api/tasks")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["product_name"] == "Emergency Battery Pack"


def test_tasks_are_scoped_by_user(client):
    user1 = client.post("/api/auth/register", json={"username": "alice", "password": "pass12345"}).get_json()
    user2 = client.post("/api/auth/register", json={"username": "bob", "password": "pass12345"}).get_json()

    client.post("/api/tasks", json=build_task_payload(), headers={"X-User-Id": str(user1["id"])})
    client.post(
        "/api/tasks",
        json={**build_task_payload(), "product_name": "Another Product"},
        headers={"X-User-Id": str(user2["id"])},
    )

    response_user1 = client.get("/api/tasks", headers={"X-User-Id": str(user1["id"])})
    response_user2 = client.get("/api/tasks", headers={"X-User-Id": str(user2["id"])})
    response_guest = client.get("/api/tasks")

    assert response_user1.status_code == 200
    assert response_user2.status_code == 200
    assert response_guest.status_code == 200
    assert len(response_user1.get_json()) == 1
    assert len(response_user2.get_json()) == 1
    assert response_guest.get_json() == []


def test_change_task_done_success(client):
    post_response = client.post("/api/tasks", json=build_task_payload())
    task_id = post_response.get_json()["id"]

    put_response = client.put(f"/api/tasks/{task_id}/done")

    assert put_response.status_code == 200
    data = put_response.get_json()
    assert data["task_is_done"] is True
    assert data["completed_at"] is not None


def test_change_task_done_not_found(client):
    response = client.put("/api/tasks/999/done")

    assert response.status_code == 404


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_estimate_missing_barcode(client):
    response = client.post("/api/estimate", json={"purchase_date": "2026-03-22"})

    assert response.status_code == 400
    assert "barcode" in response.get_json()["detail"].lower()

def test_estimate_returns_category_id(client, mocker):
    mocker.patch('app.get_yahoo_item', return_value={
        "name": "パナソニック 冷蔵庫",
        "description": "大容量の冷蔵庫です",
        "parentGenreCategories": [{"name": "家電"}]
    })

    response = client.post("/api/estimate", json={
        "barcode": "4901234567890",
        "purchase_date": "2026-03-28"
    })

    assert response.status_code == 200

    data = response.get_json()

    assert "category_id" in data
    assert data["category_id"] == 2
    assert data["category"] == "冷蔵庫"

@patch("app.requests.get")
@patch("app.requests.post")
def test_estimate_success_with_mock(mock_post, mock_get, client):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {
        "hits": [
            {
                "name": "Emergency Food Kit",
                "image": {"medium": "https://dummy.com/image.jpg"},
                "description": "Long-life emergency food pack",
                "parentGenreCategories": [{"name": "food"}],
            }
        ]
    }

    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Keep this kit fresh for emergency use."}]
                }
            }
        ]
    }

    response = client.post(
        "/api/estimate",
        json={"barcode": "4901234567890", "purchase_date": "2026-03-22"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["product_name"] == "Emergency Food Kit"
    assert data["product_image"] == "https://dummy.com/image.jpg"
    assert data["reason"] == "Keep this kit fresh for emergency use."


@patch("app.decode")
@patch("app.cv2.imdecode")
def test_scan_barcode_success(mock_imdecode, mock_decode, client):
    mock_imdecode.return_value = "dummy_image_array"

    decoded = namedtuple("Decoded", ["data", "type"])
    mock_decode.return_value = [decoded(data=b"4901234567890", type="EAN13")]

    data = {
        "image": (io.BytesIO(b"fake_image_bytes"), "test.jpg")
    }
    response = client.post("/api/scan-barcode", data=data)

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["barcode"] == "4901234567890"
    assert json_data["type"] == "EAN13"


def test_scan_barcode_no_file(client):
    response = client.post("/api/scan-barcode", data={})

    assert response.status_code == 400
    assert "image" in response.get_json()["detail"]


@patch("app.cv2.imdecode")
def test_scan_barcode_invalid_image(mock_imdecode, client):
    mock_imdecode.return_value = None

    data = {
        "image": (io.BytesIO(b"bad_data"), "test.txt")
    }
    response = client.post("/api/scan-barcode", data=data)

    assert response.status_code == 400
    assert "could not be loaded correctly" in response.get_json()["detail"]


@patch("app.decode")
@patch("app.cv2.imdecode")
def test_scan_barcode_no_barcode_found(mock_imdecode, mock_decode, client):
    mock_imdecode.return_value = "dummy_image_array"
    mock_decode.return_value = []

    data = {
        "image": (io.BytesIO(b"fake_image_bytes"), "test.jpg")
    }
    response = client.post("/api/scan-barcode", data=data)

    assert response.status_code == 404
    assert "not detected" in response.get_json()["detail"]
