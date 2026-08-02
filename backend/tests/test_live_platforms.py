import pytest

from services.extractor import get_metadata


MDN_VIDEO_URL = (
    "https://developer.mozilla.org/shared-assets/videos/flower.mp4"
)


@pytest.mark.live
def test_live_public_media_metadata():
    metadata = get_metadata(MDN_VIDEO_URL)

    assert metadata["title"] == "flower"
    assert metadata["webpage_url"] == MDN_VIDEO_URL
    assert metadata["extractor"] == "generic"
