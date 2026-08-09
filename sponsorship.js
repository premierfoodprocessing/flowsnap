const ALLOWED_LABELS = new Set([
  'Sponsored',
  'Advertisement',
]);


function cleanText(value) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}


function parseOptionalDate(value) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp)
    ? timestamp
    : Number.NaN;
}


function validateDestinationUrl(value) {
  try {
    const url = new URL(cleanText(value));
    return url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}


function validateImagePath(value) {
  const path = cleanText(value);

  if (!path) {
    return '';
  }

  if (
    !/^assets\/sponsors\/[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(path)
    || path.includes('..')
  ) {
    return null;
  }

  return path;
}


export function getActiveSponsorship(
  config,
  now = Date.now(),
) {
  if (
    config?.placementsEnabled !== true
    || config?.sponsorship?.enabled !== true
  ) {
    return null;
  }

  const sponsorship = config.sponsorship;
  const label = cleanText(sponsorship.label);
  const headline = cleanText(sponsorship.headline);
  const description = cleanText(sponsorship.description);
  const imageSrc = validateImagePath(sponsorship.imageSrc);
  const imageAlt = cleanText(sponsorship.imageAlt);
  const destinationUrl = validateDestinationUrl(
    sponsorship.destinationUrl,
  );
  const linkLabel = cleanText(sponsorship.linkLabel);
  const startsAt = parseOptionalDate(sponsorship.startsAt);
  const endsAt = parseOptionalDate(sponsorship.endsAt);

  if (
    !ALLOWED_LABELS.has(label)
    || !headline
    || !description
    || !destinationUrl
    || !linkLabel
    || imageSrc === null
    || (imageSrc && !imageAlt)
    || Number.isNaN(startsAt)
    || Number.isNaN(endsAt)
    || (startsAt !== null && now < startsAt)
    || (endsAt !== null && now >= endsAt)
    || (
      startsAt !== null
      && endsAt !== null
      && endsAt <= startsAt
    )
  ) {
    return null;
  }

  return {
    label,
    headline,
    description,
    imageSrc,
    imageAlt,
    destinationUrl,
    linkLabel,
  };
}


export function getLocalSponsorshipPreview(locationObject) {
  const hostname = String(
    locationObject?.hostname ?? '',
  ).toLowerCase();
  const search = String(locationObject?.search ?? '');

  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(hostname)
    || new URLSearchParams(search).get('sponsor-preview') !== '1'
  ) {
    return null;
  }

  const preview = getActiveSponsorship({
    placementsEnabled: true,
    sponsorship: {
      enabled: true,
      label: 'Sponsored',
      headline: 'Example partner headline',
      description: (
        'Sample sponsorship copy for local layout review only.'
      ),
      imageSrc: '',
      imageAlt: '',
      destinationUrl: 'https://example.com/',
      linkLabel: 'Example partner link',
      startsAt: '',
      endsAt: '',
    },
  });

  return preview
    ? { ...preview, isPreview: true }
    : null;
}
