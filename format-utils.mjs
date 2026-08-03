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
    : 'Video only';

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
