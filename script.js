import { describeFormat } from './format-utils.mjs';

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
const formatOptions = document.getElementById('format-options');
const formatList = document.getElementById('format-list');


function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return '';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}


function renderFormats(formats) {
  formatList.replaceChildren();

  if (!Array.isArray(formats) || formats.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'format-empty';
    emptyMessage.textContent =
      'No downloadable format options were identified.';

    formatList.append(emptyMessage);
    formatOptions.hidden = false;
    return;
  }

  for (const format of formats) {
    const option = document.createElement('div');
    option.className = 'format-option';
    option.dataset.formatId = format.format_id;

    const description = document.createElement('span');
    description.textContent = describeFormat(format);

    const status = document.createElement('span');
    status.className = 'format-status';
    status.textContent = 'Detected';

    option.append(description, status);
    formatList.append(option);
  }

  formatOptions.hidden = false;
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
  formatOptions.hidden = true;
  formatList.replaceChildren();

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
    const response = await fetch(
      `${API_BASE_URL}/api/media/formats`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: submittedUrl,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const apiMessage =
        data.detail?.message ||
        data.detail?.[0]?.msg ||
        'FlowSnap could not process this link.';

      throw new Error(apiMessage);
    }

    const hasThumbnail = Boolean(data.thumbnail);

    resultCard.classList.toggle(
      'no-thumbnail',
      !hasThumbnail,
    );

    if (hasThumbnail) {
      resultThumbnail.src = data.thumbnail;
      resultThumbnail.alt =
        `Preview for ${data.title || 'media'}`;
    } else {
      resultThumbnail.removeAttribute('src');
      resultThumbnail.alt = '';
    }

    resultPlatform.textContent =
      `${data.extractor || 'Media'} found`.toUpperCase();

    resultTitle.textContent =
      data.title || 'Untitled media';

    resultUploader.textContent = data.uploader
      ? `Creator: ${data.uploader}`
      : '';

    resultDuration.textContent = data.duration
      ? `Duration: ${formatDuration(data.duration)}`
      : '';

    resultSource.href =
      data.webpage_url || submittedUrl;

    renderFormats(data.formats);

    resultCard.hidden = false;
    message.textContent = 'Media information ready.';
  } catch (error) {
    if (error instanceof TypeError) {
      message.textContent =
        'FlowSnap could not reach the processing service. Make sure the backend is running.';
    } else {
      message.textContent =
        error.message ||
        'FlowSnap could not process this link.';
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});


document.getElementById('year').textContent =
  new Date().getFullYear();
