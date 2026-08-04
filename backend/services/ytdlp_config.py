import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIRECTORY = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIRECTORY / ".env")


def build_ytdlp_options() -> dict:
    """Return shared, environment-aware yt-dlp options."""
    options = {}

    deno_path = os.getenv("FLOWSNAP_DENO_PATH")
    if deno_path:
        options["js_runtimes"] = {
            "deno": {
                "path": deno_path,
            }
        }

    if os.getenv("FLOWSNAP_ENABLE_REMOTE_EJS", "").lower() == "true":
        options["remote_components"] = ["ejs:npm"]

    cookie_browser = os.getenv("FLOWSNAP_COOKIE_BROWSER")
    cookie_profile = os.getenv("FLOWSNAP_COOKIE_PROFILE")

    if cookie_browser:
        cookie_configuration = [cookie_browser]

        if cookie_profile:
            cookie_configuration.append(cookie_profile)

        options["cookiesfrombrowser"] = tuple(cookie_configuration)

    return options
