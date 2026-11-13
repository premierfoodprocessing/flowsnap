# FlowSnap Android Debug Build Procedure (Standard)

## Traceability requirements
Every Debug APK must be date-identifiable and traceable to the exact code state.

- **Build time:** record actual build completion timestamp in `Africa/Lagos`, format `YYYY-MM-DD HH:mm:ss (Africa/Lagos)` (never invented in advance).
- **Versioning:** date-based `versionName` (e.g. `YYYY.MM.DD-HHMMSS-debug`) and monotonically increasing `versionCode` (epoch seconds) set in `android/build-info.properties`/generated at build time and consumed by `android/app/build.gradle`.
- **APK filename:** date-identifiable (e.g. `flowsnap-debug-YYYYMMDD-HHMMSS.apk`).
- **Visible in app:** Build information panel (footer) shows Product name, Version name, Build number (`versionCode`), Build date/time, Build type (Debug), Git commit SHA/branch; reflects the installed APK and warns if built from a dirty worktree.
- **Embedded metadata:** Android `applicationId`, `versionCode`, `versionName` must match the reported identity (`aapt dump badging` / `output-metadata.json`).

## Build record (required per APK)
Capture: APK filename + absolute path, applicationId, versionName/versionCode, actual build completion timestamp (Africa/Lagos), git branch/commit SHA, worktree clean/dirty + uncommitted changes if any, file size, SHA-256, build/test results, and embedded-metadata verification. If uncommitted changes are included, state explicitly that the APK does not represent HEAD alone.

## Standard build steps (Debug only)
1. Inspect `git status`/diff; note worktree state (do not discard/preserve existing work).
2. Generate build identity and run build:
   - `FLOWSNAP_GRADLE_BIN=<gradle-8.14.x> AAPT_BIN=<aapt> node scripts/build-android-debug.mjs`
   - (or set `FLOWSNAP_BUILD_*` env vars to override; script generates `build-info.js`, `www/build-info.js`, `android/build-info.properties`, runs `npx --no-install cap sync android`, `gradle assembleDebug`, computes hashes/record.)
3. Verify packaged APK contains correct build-info/assets/plugin registration and embedded version metadata matches report.
4. Run relevant tests/checks (`node --test frontend-tests/format-utils.test.mjs`, `node --check` on modified JS/scripts, `git diff --check`) and record results.
5. Install/test on device when available (`adb install -r <dated-apk>`); verify visible build info and functionality as applicable. Do not claim device verification if not performed.

## Boundaries
- Debug APK only; no Release APK, no release signing/keystore changes, no Render/website deployment.
- No destructive Git operations; do not overwrite accepted releases; preserve existing worktree changes.
