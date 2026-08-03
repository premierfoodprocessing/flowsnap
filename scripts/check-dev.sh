#!/usr/bin/env bash

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
RUN_TESTS=false
RUN_LIVE=false
FAILURES=0


pass() {
  printf "PASS  %s\n" "$1"
}


fail() {
  printf "FAIL  %s\n" "$1"
  FAILURES=$((FAILURES + 1))
}


usage() {
  echo "Usage:"
  echo "  ./scripts/check-dev.sh"
  echo "  ./scripts/check-dev.sh --tests"
  echo "  ./scripts/check-dev.sh --live"
}


case "${1:-}" in
  "")
    ;;
  --tests)
    RUN_TESTS=true
    ;;
  --live)
    RUN_TESTS=true
    RUN_LIVE=true
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    echo "Unknown option: $1"
    usage
    exit 2
    ;;
esac


echo
echo "FlowSnap development checks"
echo "==========================="


if backend_response="$(
  curl -fsS http://127.0.0.1:8000/health 2>/dev/null
)"; then
  if [[ "$backend_response" == '{"status":"healthy"}' ]]; then
    pass "Backend health endpoint"
  else
    fail "Backend returned an unexpected health response"
  fi
else
  fail "Backend is not reachable on port 8000"
fi


if curl -fsSI http://127.0.0.1:5500 >/dev/null 2>&1; then
  pass "Frontend server"
else
  fail "Frontend is not reachable on port 5500"
fi


if bash -n "$PROJECT_DIR/scripts/start-dev.sh"; then
  pass "Start launcher syntax"
else
  fail "Start launcher syntax"
fi


if bash -n "$PROJECT_DIR/scripts/check-dev.sh"; then
  pass "Check script syntax"
else
  fail "Check script syntax"
fi


if bash -n "$PROJECT_DIR/scripts/stop-dev.sh"; then
  pass "Stop launcher syntax"
else
  fail "Stop launcher syntax"
fi


if git -C "$PROJECT_DIR" diff --check; then
  pass "Git whitespace check"
else
  fail "Git whitespace check"
fi


if node --input-type=module --check < "$PROJECT_DIR/script.js"; then
  pass "Frontend module syntax"
else
  fail "Frontend module syntax"
fi


if [[ "$RUN_TESTS" == true ]]; then
  echo
  echo "Frontend tests"
  echo "--------------"

  if (
    cd "$PROJECT_DIR"
    node --test frontend-tests/*.test.mjs
  ); then
    pass "Frontend automated tests"
  else
    fail "Frontend automated tests"
  fi

  echo
  echo "Backend tests"
  echo "-------------"

  if [[ "$RUN_LIVE" == true ]]; then
    if (
      cd "$BACKEND_DIR"
      source .venv/bin/activate
      python -m pytest --run-live
    ); then
      pass "Stable and live automated tests"
    else
      fail "Stable and live automated tests"
    fi
  else
    if (
      cd "$BACKEND_DIR"
      source .venv/bin/activate
      python -m pytest
    ); then
      pass "Stable automated tests"
    else
      fail "Stable automated tests"
    fi
  fi
fi


echo
echo "Git status"
echo "----------"
git -C "$PROJECT_DIR" status --short


echo
if [[ "$FAILURES" -eq 0 ]]; then
  echo "All requested FlowSnap checks passed."
  exit 0
fi

echo "$FAILURES FlowSnap check(s) failed."
exit 1
