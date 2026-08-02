const API_BASE_URL = 'http://127.0.0.1:8000';

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const input = document.getElementById('video-url');
const message = document.getElementById('form-message');
const form = document.getElementById('download-form');
const submitButton = form?.querySelector('button[type="submit"]');

const resultCard = document.getElementById('media-result');
const resultThumbnail = document.getElementById('result-thumbnail');
const resultPlatform = document.getElementById('result-platform');
const resultTitle = document.getElementById('result-title');
const resultUploader = document.getElementById('result-uploader');
const resultDuration = document.getElementById('result-duration');
const resultSource = document.getElementById('result-source');

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return '';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('paste-btn')?.addEventListener('click', async () => {
  try {
    input.value = await navigator.clipboard.readText();

    message.textContent = input.value
      ? 'Link pasted.'
      : 'Clipboard was empty.';
  } catch {
    message.textContent =
      'Your browser blocked clipboard access. Paste the link manually.';
  }
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submittedUrl = input.value.trim();

  resultCard.hidden = true;

  try {
    const url = new URL(submittedUrl);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    message.textContent = 'Please enter a complete public web link.';
    return;
  }

  message.textContent = 'FlowSnap is checking the link…';

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/media/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: submittedUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const apiMessage =
        data.detail?.message ||
        data.detail?.[0]?.msg ||
        'FlowSnap could not process this link.';

      throw new Error(apiMessage);
    }

	const hasThumbnail = Boolean(data.thumbnail);

	resultCard.classList.toggle('no-thumbnail', !hasThumbnail);

	if (hasThumbnail) {
	  resultThumbnail.src = data.thumbnail;
	  resultThumbnail.alt = `Preview for ${data.title || 'media'}`;
	} else {
	  resultThumbnail.removeAttribute('src');
	  resultThumbnail.alt = '';
	}

	resultPlatform.textContent =
	  `${data.extractor || 'Media'} found`.toUpperCase();

	resultTitle.textContent = data.title || 'Untitled media';

	resultUploader.textContent = data.uploader
	  ? `Creator: ${data.uploader}`
	  : '';

	resultDuration.textContent = data.duration
	  ? `Duration: ${formatDuration(data.duration)}`
	  : '';

	resultSource.href = data.webpage_url || submittedUrl;

	resultCard.hidden = false;
	message.textContent = 'Media information ready.';

  } catch (error) {
    if (error instanceof TypeError) {
      message.textContent =
        'FlowSnap could not reach the processing service. Make sure the backend is running.';
    } else {
      message.textContent =
        error.message || 'FlowSnap could not process this link.';
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

document.getElementById('year').textContent =
  new Date().getFullYear();
