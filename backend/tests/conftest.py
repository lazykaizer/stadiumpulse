import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import Settings

@pytest.fixture
def client():
    # We use TestClient with the main app
    with TestClient(app) as test_client:
        yield test_client
