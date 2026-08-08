import uvloop
from fastapi import FastAPI
from fastapi.testclient import TestClient


def create_test_client(app: FastAPI) -> TestClient:
    return TestClient(
        app,
        backend_options={"loop_factory": uvloop.new_event_loop},
    )
