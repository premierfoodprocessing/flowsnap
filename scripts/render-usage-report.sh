#!/usr/bin/env bash

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_BASE="https://api.render.com/v1"

RENDER_SERVICE_NAME="${RENDER_SERVICE_NAME:-flowsnap-api}"
RESOLUTION_SECONDS="${RESOLUTION_SECONDS:-3600}"
START_DATE=""
END_DATE=""


usage() {
  cat <<'EOF'
Usage:
  ./scripts/render-usage-report.sh [--start YYYY-MM-DD] [--end YYYY-MM-DD]

Pulls CPU, memory, disk and bandwidth usage plus HTTP request counts for the
FlowSnap Render service from Render's metrics API, and prints a day-by-day
summary suitable for pasting into the worksheet in docs/operating-private.md.

Render's public API does not expose billing or cost data. This script never
prints money figures - cost still has to come from the Billing and Usage
dashboard and be recorded only in docs/operating-private.md.

Default window: the 7 days ending today (UTC).

Requires RENDER_API_KEY, either exported in the environment or placed in a
gitignored scripts/.render.env file as:
  RENDER_API_KEY=rnd_xxx

Optional environment overrides:
  RENDER_SERVICE_NAME   Service name to look up (default: flowsnap-api)
  RENDER_SERVICE_ID     Skip the name lookup and use this service id directly
  RESOLUTION_SECONDS    Metric bucket size in seconds (default: 3600)
EOF
}


while [[ $# -gt 0 ]]; do
  case "$1" in
    --start)
      START_DATE="${2:-}"
      shift 2
      ;;
    --end)
      END_DATE="${2:-}"
      shift 2
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
done


if [[ -z "$END_DATE" ]]; then
  END_DATE="$(date -u +%F)"
fi
if [[ -z "$START_DATE" ]]; then
  START_DATE="$(date -u -d "$END_DATE -7 days" +%F)"
fi


if [[ -z "${RENDER_API_KEY:-}" && -f "$PROJECT_DIR/scripts/.render.env" ]]; then
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/scripts/.render.env"
fi

if [[ -z "${RENDER_API_KEY:-}" ]]; then
  echo "RENDER_API_KEY is not set." >&2
  echo "Export it, or create scripts/.render.env (gitignored) with:" >&2
  echo "  RENDER_API_KEY=rnd_xxx" >&2
  exit 1
fi


AUTH_HEADER="Authorization: Bearer ${RENDER_API_KEY}"
START_ISO="${START_DATE}T00:00:00Z"
END_ISO="${END_DATE}T00:00:00Z"


echo "FlowSnap Render usage report"
echo "============================="
echo "Window: $START_DATE (inclusive) through $END_DATE (exclusive), UTC"
echo "Cost and billing figures are not available from this API - record those"
echo "manually from the Billing and Usage dashboard into docs/operating-private.md."
echo


if [[ -n "${RENDER_SERVICE_ID:-}" ]]; then
  SERVICE_ID="$RENDER_SERVICE_ID"
else
  if ! lookup="$(curl -fsS -H "$AUTH_HEADER" \
    "$API_BASE/services?name=$RENDER_SERVICE_NAME&limit=1")"; then
    echo "Could not look up the service on the Render API." >&2
    echo "Check that RENDER_API_KEY is valid and has not expired." >&2
    exit 1
  fi
  SERVICE_ID="$(echo "$lookup" | jq -r '.[0].service.id // empty' 2>/dev/null)"
  if [[ -z "$SERVICE_ID" ]]; then
    echo "Could not find a service named '$RENDER_SERVICE_NAME'." >&2
    echo "Set RENDER_SERVICE_ID to skip the name lookup." >&2
    exit 1
  fi
fi

echo "Service: $RENDER_SERVICE_NAME ($SERVICE_ID)"
echo


fetch_metric() {
  local path="$1"
  curl -fsS -H "$AUTH_HEADER" \
    "$API_BASE/metrics/$path?resource=$SERVICE_ID&startTime=$START_ISO&endTime=$END_ISO&resolutionSeconds=$RESOLUTION_SECONDS"
}


summarize() {
  local mode="$1" data="$2"
  local filter
  if [[ "$mode" == "gauge" ]]; then
    filter='"  \(.[0].timestamp[0:10])  peak=\((map(.value) | max))  avg=\(((map(.value) | add) / length))  unit=\(.[0].unit // "n/a")"'
  else
    filter='"  \(.[0].timestamp[0:10])  total=\((map(.value) | add))  unit=\(.[0].unit // "n/a")"'
  fi

  echo "$data" | jq -r "
    [.[] | .values[]?] as \$vals |
    if (\$vals | length) == 0 then
      \"  no data points in this window\"
    else
      \$vals | group_by(.timestamp[0:10]) | .[] | $filter
    end
  " 2>/dev/null || echo "  could not parse the response for this metric"
}


report() {
  local title="$1" path="$2" mode="$3"
  echo "-- $title --"
  local data
  if ! data="$(fetch_metric "$path")"; then
    echo "  not available (endpoint error, or not applicable to this service)"
    echo
    return
  fi
  summarize "$mode" "$data"
  echo
}


report "CPU usage (daily peak / average, fraction of 1 vCPU)" "cpu" "gauge"
report "Memory usage (daily peak / average)" "memory" "gauge"
report "Disk usage (daily peak / average - only if a persistent disk is attached)" "disk-usage" "gauge"
report "Bandwidth (daily total)" "bandwidth" "counter"
report "HTTP requests (daily total)" "http-requests" "counter"


echo "Reminder: the first time you use this, sanity-check the counter totals"
echo "(bandwidth, HTTP requests) against the Render dashboard for the same"
echo "window, since the API docs do not state whether values are already"
echo "cumulative per bucket. Paste the figures you trust into the worksheet"
echo "in docs/operating-private.md - do not paste them into chat or commit"
echo "them to the repository."
