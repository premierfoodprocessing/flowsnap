import os
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass


def _positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)

    if raw_value is None:
        return default

    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ValueError(f"{name} must be a positive integer") from exc

    if value < 1:
        raise ValueError(f"{name} must be a positive integer")

    return value


def _boolean(name: str, default: bool) -> bool:
    raw_value = os.getenv(name)

    if raw_value is None:
        return default

    normalized = raw_value.strip().lower()
    if normalized in {"true", "1", "yes", "on"}:
        return True
    if normalized in {"false", "0", "no", "off"}:
        return False

    raise ValueError(f"{name} must be true or false")


@dataclass(frozen=True)
class HostingLimits:
    delivery_enabled: bool
    max_file_size_bytes: int
    max_concurrent_downloads: int
    api_requests_per_window: int
    expensive_requests_per_window: int
    rate_window_seconds: int


def load_hosting_limits() -> HostingLimits:
    return HostingLimits(
        delivery_enabled=_boolean("FLOWSNAP_DELIVERY_ENABLED", True),
        max_file_size_bytes=(
            _positive_int("FLOWSNAP_MAX_FILE_SIZE_MB", 100)
            * 1024
            * 1024
        ),
        max_concurrent_downloads=_positive_int(
            "FLOWSNAP_MAX_CONCURRENT_DOWNLOADS", 1
        ),
        api_requests_per_window=_positive_int(
            "FLOWSNAP_API_RATE_LIMIT", 60
        ),
        expensive_requests_per_window=_positive_int(
            "FLOWSNAP_EXPENSIVE_RATE_LIMIT", 12
        ),
        rate_window_seconds=_positive_int(
            "FLOWSNAP_RATE_WINDOW_SECONDS", 60
        ),
    )


class SlidingWindowRateLimiter:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window_seconds = window_seconds
        self._requests = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str, now: float | None = None) -> bool:
        current_time = time.monotonic() if now is None else now
        cutoff = current_time - self.window_seconds

        with self._lock:
            timestamps = self._requests[key]

            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            if len(timestamps) >= self.limit:
                return False

            timestamps.append(current_time)
            return True

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()
