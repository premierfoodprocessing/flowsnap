import pytest

from services.extractor import get_metadata


MDN_VIDEO_URL = (
    "https://developer.mozilla.org/shared-assets/videos/flower.mp4"
)
YOUTUBE_VIDEO_URL = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
#YOUTUBE_VIDEO_URL = "https://www.youtube.com/shorts/rUjlFRok3qk"

@pytest.mark.live
def test_live_public_media_metadata():
    metadata = get_metadata(MDN_VIDEO_URL)

    assert metadata["title"] == "flower"
    assert metadata["webpage_url"] == MDN_VIDEO_URL
    assert metadata["extractor"] == "generic"

@pytest.mark.live
def test_live_youtube_metadata():
    metadata = get_metadata(YOUTUBE_VIDEO_URL)

    assert metadata["title"]
    assert metadata["webpage_url"]
    assert metadata["extractor"].lower() == "youtube"
