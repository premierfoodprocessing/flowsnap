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

  const protocol = String(
    locationObject?.protocol ?? '',
  ).trim().toLowerCase();

  const isNativeApp = (
    protocol === 'capacitor:' ||
    protocol === 'file:' ||
    (typeof window !== 'undefined' && window.Capacitor !== undefined)
  );

  const isLocalDevHost = (
    hostname === '127.0.0.1' ||
    hostname === 'localhost' ||
    hostname === '[::1]'
  );

  // Capacitor Android can serve the bundled app from https://localhost.
  const isCapacitorAppOrigin = (
    protocol === 'https:' && hostname === 'localhost'
  );

  if (!isNativeApp && !isCapacitorAppOrigin && isLocalDevHost) {
    return 'http://127.0.0.1:8001';
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

  const technicalDetails = [];

  if (format.video_codec && format.video_codec !== 'Unknown') {
    technicalDetails.push(format.video_codec);
  }

  if (
    format.audio_language
    && format.audio_language !== 'und'
    && format.audio_language !== 'multiple'
  ) {
    technicalDetails.push(
      `Audio (${format.audio_language})`,
    );
  }

  if (Number.isFinite(format.bitrate_kbps) && format.bitrate_kbps > 0) {
    const bitrateMbps = format.bitrate_kbps / 1_000;
    technicalDetails.push(
      `${bitrateMbps.toFixed(1).replace(/\.0$/, '')} Mbps`,
    );
  }

  return [
    quality,
    extension,
    formatFileSize(format.filesize),
    ...technicalDetails,
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


function getFormatBitrate(format) {
  return Number.isFinite(format?.bitrate_kbps)
    ? format.bitrate_kbps
    : 0;
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

  const recommendedFormats = videoFormats.filter((format) => {
    const height = getFormatHeight(format);
    return height > 0 && height <= 720;
  });

  const qualityCandidates = recommendedFormats.length > 0
    ? recommendedFormats
    : videoFormats;

  const formatsWithAudio = qualityCandidates.filter(
    (format) => format.has_audio,
  );

  const candidates = formatsWithAudio.length > 0
    ? formatsWithAudio
    : qualityCandidates;

  const compatibleCandidates = candidates.filter(
    (format) => format.is_compatible === true,
  );

  const preferredCandidates = compatibleCandidates.length > 0
    ? compatibleCandidates
    : candidates;

  const selected = preferredCandidates.reduce(
    (best, current) => {
      const currentHeight = getFormatHeight(current);
      const bestHeight = getFormatHeight(best);

      if (currentHeight !== bestHeight) {
        return currentHeight > bestHeight
          ? current
          : best;
      }

      return getFormatBitrate(current) > getFormatBitrate(best)
        ? current
        : best;
    },
  );

  return selected.format_id ?? null;
}

export function buildPreparePayload(
  analysisId,
  formatId,
  preferEnglishAudio = true,
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
    prefer_english_audio: Boolean(preferEnglishAudio),
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


export function isNativePlatform(capacitor = globalThis.Capacitor) {
  return Boolean(capacitor?.isNativePlatform?.());
}

export function sanitizeDownloadFilename(filename, fallback = 'flowsnap-download') {
  const base = String(filename ?? '').trim() || fallback;
  const cleaned = base
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}

export function buildNativeDownloadPath(filename) {
  const safeName = sanitizeDownloadFilename(filename);
  const stamp = Date.now();
  return `FlowSnap/${stamp}-${safeName}`;
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

async function readDownloadErrorMessage(response) {
  let apiMessage = '';
  try {
    const data = await response.json();
    apiMessage = data.detail?.message || data.detail?.[0]?.msg || '';
  } catch {
    // The backend may return a non-JSON proxy or server error.
  }
  return apiMessage || 'FlowSnap could not download this media.';
}

async function downloadPreparedFileWeb(
  documentObject,
  downloadUrl,
  filename,
  fetchFunction = globalThis.fetch,
  urlObject = globalThis.URL,
) {
  const response = await fetchFunction(downloadUrl);

  if (!response.ok) {
    throw new Error(await readDownloadErrorMessage(response));
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

  return {
    mode: 'web',
    filename: sanitizeDownloadFilename(filename),
  };
}

async function downloadPreparedFileNative(
  downloadUrl,
  filename,
  {
    capacitor = globalThis.Capacitor,
    filesystem = globalThis.Capacitor?.Plugins?.Filesystem,
    directory = 'DOCUMENTS',
    onProgress,
  } = {},
) {
  if (!isNativePlatform(capacitor)) {
    throw new Error('Native download is not available on this platform.');
  }

  if (!filesystem || typeof filesystem.downloadFile !== 'function') {
    throw new Error(
      'File download is not available on this device. Missing Filesystem plugin.',
    );
  }

  const safeName = sanitizeDownloadFilename(filename);
  const path = buildNativeDownloadPath(safeName);

  if (typeof filesystem.mkdir === 'function') {
    try {
      await filesystem.mkdir({
        path: 'FlowSnap',
        directory,
        recursive: true,
      });
    } catch {
      // Directory may already exist.
    }
  }

  let progressHandle = null;
  if (
    typeof onProgress === 'function' &&
    typeof filesystem.addListener === 'function'
  ) {
    try {
      progressHandle = await filesystem.addListener('progress', (status) => {
        if (status && status.url === downloadUrl) {
          onProgress({
            bytes: Number(status.bytes) || 0,
            contentLength: Number(status.contentLength) || 0,
          });
        }
      });
    } catch {
      progressHandle = null;
    }
  }

  let result;
  try {
    result = await filesystem.downloadFile({
      url: downloadUrl,
      path,
      directory,
      progress: Boolean(progressHandle),
    });
  } finally {
    if (progressHandle && typeof progressHandle.remove === 'function') {
      try {
        await progressHandle.remove();
      } catch {
        // Ignore listener cleanup errors.
      }
    }
  }

  if (result && typeof result === 'object' && 'error' in result && result.error) {
    throw new Error(
      String(result.error?.message || result.error) ||
        'FlowSnap could not save the downloaded file.',
    );
  }

  let size = null;
  if (typeof filesystem.stat === 'function') {
    try {
      const stat = await filesystem.stat({ path, directory });
      size = typeof stat?.size === 'number' ? stat.size : null;
    } catch {
      size = null;
    }
  }

  if (size !== null && size <= 0) {
    throw new Error('FlowSnap saved an empty file. Please try again.');
  }

  let uri = result?.path || path;
  if (typeof filesystem.getUri === 'function') {
    try {
      const info = await filesystem.getUri({ path, directory });
      if (info?.uri) {
        uri = info.uri;
      }
    } catch {
      // Keep file path.
    }
  }

  return {
    mode: 'native',
    filename: safeName,
    path,
    uri,
    size,
    directory,
  };
}

export async function downloadPreparedFile(
  documentObject,
  downloadUrl,
  filename,
  fetchFunctionOrOptions = globalThis.fetch,
  urlObjectArg = globalThis.URL,
) {
  let options = {};
  if (typeof fetchFunctionOrOptions === 'function') {
    options = {
      fetchFunction: fetchFunctionOrOptions,
      urlObject: urlObjectArg,
    };
  } else if (fetchFunctionOrOptions && typeof fetchFunctionOrOptions === 'object') {
    options = fetchFunctionOrOptions;
  }

  const {
    fetchFunction = globalThis.fetch,
    urlObject = globalThis.URL,
    capacitor = globalThis.Capacitor,
    filesystem = globalThis.Capacitor?.Plugins?.Filesystem,
    onProgress,
  } = options;

  if (isNativePlatform(capacitor)) {
    return downloadPreparedFileNative(downloadUrl, filename, {
      capacitor,
      filesystem,
      onProgress,
    });
  }

  return downloadPreparedFileWeb(
    documentObject,
    downloadUrl,
    filename,
    fetchFunction,
    urlObject,
  );
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
