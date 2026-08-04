from services.ytdlp_config import build_ytdlp_options


ENVIRONMENT_VARIABLES = (
    "FLOWSNAP_DENO_PATH",
    "FLOWSNAP_ENABLE_REMOTE_EJS",
    "FLOWSNAP_COOKIE_BROWSER",
    "FLOWSNAP_COOKIE_PROFILE",
)


def test_ytdlp_options_are_safe_by_default(monkeypatch):
    for variable in ENVIRONMENT_VARIABLES:
        monkeypatch.delenv(variable, raising=False)

    assert build_ytdlp_options() == {}


def test_ytdlp_options_support_local_setup(monkeypatch):
    monkeypatch.setenv(
        "FLOWSNAP_DENO_PATH",
        "/home/test/.deno/bin/deno",
    )
    monkeypatch.setenv(
        "FLOWSNAP_ENABLE_REMOTE_EJS",
        "true",
    )
    monkeypatch.setenv(
        "FLOWSNAP_COOKIE_BROWSER",
        "chromium",
    )
    monkeypatch.setenv(
        "FLOWSNAP_COOKIE_PROFILE",
        "/home/test/chromium",
    )

    assert build_ytdlp_options() == {
        "js_runtimes": {
            "deno": {
                "path": "/home/test/.deno/bin/deno",
            }
        },
        "remote_components": ["ejs:npm"],
        "cookiesfrombrowser": (
            "chromium",
            "/home/test/chromium",
        ),
    }
