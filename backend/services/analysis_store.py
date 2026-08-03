from copy import deepcopy
from threading import Lock
from time import monotonic
from typing import Callable
from uuid import uuid4


class AnalysisStore:
    def __init__(
        self,
        ttl_seconds: float = 600,
        now: Callable[[], float] = monotonic,
        id_factory: Callable[[], str] = lambda: uuid4().hex,
    ):
        self.ttl_seconds = ttl_seconds
        self.now = now
        self.id_factory = id_factory
        self._items: dict[str, tuple[float, dict]] = {}
        self._lock = Lock()

    def save(self, analysis: dict) -> str:
        analysis_id = self.id_factory()
        expires_at = self.now() + self.ttl_seconds

        with self._lock:
            self._remove_expired()
            self._items[analysis_id] = (
                expires_at,
                deepcopy(analysis),
            )

        return analysis_id

    def get(self, analysis_id: str) -> dict | None:
        with self._lock:
            self._remove_expired()
            item = self._items.get(analysis_id)

            if item is None:
                return None

            return deepcopy(item[1])

    def _remove_expired(self) -> None:
        current_time = self.now()

        expired_ids = [
            analysis_id
            for analysis_id, (expires_at, _) in self._items.items()
            if expires_at <= current_time
        ]

        for analysis_id in expired_ids:
            self._items.pop(analysis_id, None)
