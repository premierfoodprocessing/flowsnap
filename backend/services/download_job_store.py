from copy import deepcopy
from threading import Lock
from time import monotonic
from typing import Callable
from uuid import uuid4


class DownloadJobStore:
    def __init__(
        self,
        ttl_seconds: float = 300,
        now: Callable[[], float] = monotonic,
        id_factory: Callable[[], str] = lambda: uuid4().hex,
    ):
        self.ttl_seconds = ttl_seconds
        self.now = now
        self.id_factory = id_factory
        self._items: dict[str, tuple[float, dict]] = {}
        self._lock = Lock()

    def save(self, job: dict) -> str:
        job_id = self.id_factory()
        expires_at = self.now() + self.ttl_seconds

        with self._lock:
            self._remove_expired()
            self._items[job_id] = (
                expires_at,
                deepcopy(job),
            )

        return job_id

    def get(self, job_id: str) -> dict | None:
        with self._lock:
            self._remove_expired()
            item = self._items.get(job_id)

            if item is None:
                return None

            return deepcopy(item[1])

    def consume(self, job_id: str) -> dict | None:
        with self._lock:
            self._remove_expired()
            item = self._items.pop(job_id, None)

            if item is None:
                return None

            return deepcopy(item[1])

    def _remove_expired(self) -> None:
        current_time = self.now()

        expired_ids = [
            job_id
            for job_id, (expires_at, _) in self._items.items()
            if expires_at <= current_time
        ]

        for job_id in expired_ids:
            self._items.pop(job_id, None)
