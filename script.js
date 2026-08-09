
import {
  buildDownloadUrl,
  buildPreparePayload,
  chooseDefaultFormat,
  describeAudioNotice,
  describeFormat,
  downloadPreparedFile,
  resolveApiBaseUrl,
} from './format-utils.mjs?v=2';
import { revenueConfig } from './revenue-config.js';
import { getActiveSponsorship } from './sponsorship.js';
const API_BASE_URL = resolveApiBaseUrl(window.location);

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
const formatAudioNotice = document.getElementById('format-audio-notice');
const prepareActions = document.getElementById('prepare-actions');
const prepareButton = document.getElementById('prepare-button');
const prepareStatus = document.getElementById('prepare-status');
const resultRevenuePlacement = document.getElementById(
  'result-revenue-placement',
);

if (resultRevenuePlacement) {
  const activeSponsorship = getActiveSponsorship(
    revenueConfig,
  );

  if (activeSponsorship) {
    const label = resultRevenuePlacement.querySelector(
      '.revenue-placement-label',
    );
    const headline = resultRevenuePlacement.querySelector(
      '.revenue-placement-headline',
    );
    const description = resultRevenuePlacement.querySelector(
      '.revenue-placement-description',
    );
    const link = resultRevenuePlacement.querySelector(
      '.revenue-placement-link',
    );
    const image = resultRevenuePlacement.querySelector(
      '.revenue-placement-image',
    );

    label.textContent = activeSponsorship.label;
    headline.textContent = activeSponsorship.headline;
    description.textContent = activeSponsorship.description;
    link.textContent = activeSponsorship.linkLabel;
    link.href = activeSponsorship.destinationUrl;

    if (activeSponsorship.imageSrc) {
      image.src = activeSponsorship.imageSrc;
      image.alt = activeSponsorship.imageAlt;
      image.hidden = false;
    }

    resultRevenuePlacement.hidden = false;
  }
}

let currentAnalysisId = '';

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
  formatList.removeAttribute('data-selected-format-id');
  formatAudioNotice.textContent = '';
  formatAudioNotice.hidden = true;

  if (!Array.isArray(formats) || formats.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'format-empty';
    emptyMessage.textContent =
      'No downloadable format options were identified.';

    formatList.append(emptyMessage);
    formatOptions.hidden = false;
    return;
  }

  const defaultFormatId = chooseDefaultFormat(formats);
  const optionButtons = [];

  function updateSelection(formatId) {
    formatList.dataset.selectedFormatId = formatId;
    const selectedFormat = formats.find(
      (format) => String(format.format_id) === formatId,
    );
    const audioNotice =
      describeAudioNotice(selectedFormat);

    formatAudioNotice.textContent = audioNotice;
    formatAudioNotice.hidden = !audioNotice;

    for (const button of optionButtons) {
      const selected =
        button.dataset.formatId === formatId;

      button.classList.toggle('is-selected', selected);
      button.setAttribute(
        'aria-pressed',
        String(selected),
      );

      const status = button.querySelector(
        '.format-status',
      );

      const recommended =
        button.dataset.formatId === String(defaultFormatId);

      status.textContent = selected
        ? recommended
          ? 'Recommended · Selected'
          : 'Selected'
        : recommended
          ? 'Recommended'
          : 'Select';
    }
  }

  for (const format of formats) {
    const formatId = String(format.format_id);

    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'format-option';
    option.dataset.formatId = formatId;
    option.setAttribute('aria-pressed', 'false');

    const description = document.createElement('span');
    description.className = 'format-description';
    description.textContent = describeFormat(format);

    const status = document.createElement('span');
    status.className = 'format-status';
    status.textContent = 'Select';

    option.append(description, status);

    option.addEventListener('click', () => {
      updateSelection(formatId);
    });

    optionButtons.push(option);
    formatList.append(option);
  }

  if (defaultFormatId !== null) {
    updateSelection(String(defaultFormatId));
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

  currentAnalysisId = '';
  prepareActions.hidden = true;
  prepareButton.disabled = false;
  prepareStatus.textContent = '';

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


    currentAnalysisId =
      String(data.analysis_id ?? '').trim();

    prepareActions.hidden =
      !currentAnalysisId ||
      !formatList.dataset.selectedFormatId;


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

prepareButton?.addEventListener(
  'click',
  async () => {
    const payload = buildPreparePayload(
      currentAnalysisId,
      formatList.dataset.selectedFormatId,
    );

    if (!payload) {
      prepareStatus.textContent =
        'Select an available format first.';
      return;
    }

    prepareButton.disabled = true;
    prepareStatus.textContent =
      'Preparing your selected format…';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/media/prepare`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const apiMessage =
          data.detail?.message ||
          data.detail?.[0]?.msg ||
          'FlowSnap could not prepare this format.';

        throw new Error(apiMessage);
      }

      const downloadUrl = buildDownloadUrl(
        API_BASE_URL,
        data.download_url,
      );

      if (!downloadUrl) {
        throw new Error(
          'FlowSnap received an invalid download link.',
        );
      }

      prepareStatus.textContent =
        'Downloading your selected format…';

      await downloadPreparedFile(
        document,
        downloadUrl,
        data.filename,
      );

      prepareStatus.textContent =
        `${data.filename || 'Your file'} is ready. ` +
        'Your download has started.';
    } catch (error) {
      if (error instanceof TypeError) {
        prepareStatus.textContent =
          'FlowSnap could not reach the processing service.';
      } else {
        prepareStatus.textContent =
          error.message ||
          'FlowSnap could not prepare this format.';
      }
    } finally {
      prepareButton.disabled = false;
    }
  },
);

document.getElementById('year').textContent =
  new Date().getFullYear();
