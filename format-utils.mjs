export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 'Size unknown';
  }

  if (bytes < 1_000) {
    return `${Math.round(bytes)} B`;
  }

  const units = [
    ['GB', 1_000_000_000],
    ['MB', 1_000_000],
    ['KB', 1_000],
  ];

  for (const [unit, divisor] of units) {
    if (bytes >= divisor) {
      const value = bytes / divisor;
      const formatted = Number.isInteger(value)
        ? String(value)
        : value.toFixed(1).replace(/\.0$/, '');

      return `${formatted} ${unit}`;
    }
  }

  return `${Math.round(bytes)} B`;
}


export function resolveApiBaseUrl(locationObject) {
  const hostname = String(
    locationObject?.hostname ?? '',
  ).trim().toLowerCase();

  if (
    hostname === '127.0.0.1' ||
    hostname === 'localhost' ||
    hostname === '[::1]'
  ) {
    return 'http://127.0.0.1:8000';
  }

  return 'https://flowsnap-api.onrender.com';
}


export function describeFormat(format) {
  const quality =
    format.quality && format.quality !== 'unknown'
      ? format.quality
      : format.resolution && format.resolution !== 'unknown'
        ? format.resolution
        : 'Original';

  const extension = (
    format.extension || 'file'
  ).toUpperCase();

  const audioDescription = format.has_audio
    ? 'Video + audio'
    : 'Video stream · Audio added when available';

  return [
    quality,
    extension,
    formatFileSize(format.filesize),
    audioDescription,
  ].join(' · ');
}

function getFormatHeight(format) {
  const qualityMatch = String(
    format?.quality || '',
  ).match(/(\d+)p/i);

  if (qualityMatch) {
    return Number(qualityMatch[1]);
  }

  const resolutionMatch = String(
    format?.resolution || '',
  ).match(/x(\d+)$/i);

  if (resolutionMatch) {
    return Number(resolutionMatch[1]);
  }

  return 0;
}


export function chooseDefaultFormat(formats) {
  if (!Array.isArray(formats) || formats.length === 0) {
    return null;
  }

  const videoFormats = formats.filter(
    (format) => format?.has_video,
  );

  if (videoFormats.length === 0) {
    return null;
  }

  const formatsWithAudio = videoFormats.filter(
    (format) => format.has_audio,
  );

  const candidates = formatsWithAudio.length > 0
    ? formatsWithAudio
    : videoFormats;

  const selected = candidates.reduce(
    (best, current) => (
      getFormatHeight(current) > getFormatHeight(best)
        ? current
        : best
    ),
  );

  return selected.format_id ?? null;
}

export function buildPreparePayload(
  analysisId,
  formatId,
) {
  const normalizedAnalysisId =
    String(analysisId ?? '').trim();

  const normalizedFormatId =
    String(formatId ?? '').trim();

  if (
    !normalizedAnalysisId ||
    !normalizedFormatId
  ) {
    return null;
  }

  return {
    analysis_id: normalizedAnalysisId,
    format_id: normalizedFormatId,
  };
}


export function buildDownloadUrl(
  apiBaseUrl,
  downloadUrl,
) {
  const normalizedBase = String(apiBaseUrl ?? '').trim();
  const normalizedDownloadUrl = String(downloadUrl ?? '').trim();

  if (!normalizedBase || !normalizedDownloadUrl) {
    return null;
  }

  try {
    const apiUrl = new URL(normalizedBase);
    const resolvedUrl = new URL(
      normalizedDownloadUrl,
      `${apiUrl.origin}/`,
    );

    if (
      !['http:', 'https:'].includes(apiUrl.protocol) ||
      resolvedUrl.origin !== apiUrl.origin ||
      !resolvedUrl.pathname.startsWith('/api/media/download/')
    ) {
      return null;
    }

    return resolvedUrl.href;
  } catch {
    return null;
  }
}


export function startBrowserDownload(
  documentObject,
  downloadUrl,
  filename = '',
) {
  if (!documentObject?.body || !downloadUrl) {
    return false;
  }

  const link = documentObject.createElement('a');
  link.href = downloadUrl;
  link.download = String(filename ?? '').trim();
  link.hidden = true;

  documentObject.body.append(link);
  link.click();
  link.remove();

  return true;
}


export async function downloadPreparedFile(
  documentObject,
  downloadUrl,
  filename,
  fetchFunction = globalThis.fetch,
  urlObject = globalThis.URL,
) {
  const response = await fetchFunction(downloadUrl);

  if (!response.ok) {
    let apiMessage = '';

    try {
      const data = await response.json();
      apiMessage = data.detail?.message || data.detail?.[0]?.msg || '';
    } catch {
      // The backend may return a non-JSON proxy or server error.
    }

    throw new Error(
      apiMessage || 'FlowSnap could not download this media.',
    );
  }

  const fileBlob = await response.blob();
  const objectUrl = urlObject.createObjectURL(fileBlob);

  try {
    if (!startBrowserDownload(documentObject, objectUrl, filename)) {
      throw new Error('FlowSnap could not start the browser download.');
    }
  } finally {
    urlObject.revokeObjectURL(objectUrl);
  }
}


export function describeAudioNotice(format) {
  if (
    format?.has_video === true
    && format?.has_audio === false
  ) {
    return (
      'The source provides this as a video-only stream. '
      + 'FlowSnap will combine it with separate audio during '
      + 'preparation when audio is available.'
    );
  }

  return '';
}
