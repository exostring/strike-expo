(async () => {
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    if (!response.ok) return;
    applyContent(await response.json());
  } catch {
    // Static fallback stays visible when the API is not available.
  }
})();

function applyContent(content) {
  const { seo = {}, texts = {}, features = [], participants = [] } = content || {};
  if (document.body.classList.contains('exhibitor-page')) {
    applyExhibitorsPage(texts.exhibitorsPage || {});
    renderParticipants(participants);
    renderSchemaParticipants(participants);
    return;
  }
  applySeo(seo);
  applyHero(texts.hero || {});
  applyAbout(texts.about || {});
  setText('[data-content="featuresTitle"]', texts.featuresTitle);
  renderFeatures(features);
  applyLocation(texts.location || {});
  applyExhibitors(texts.exhibitors || {});
  applyRoute(texts.route || {});
  renderParticipants(participants);
  renderSchemaParticipants(participants);
}

function applySeo(seo) {
  if (seo.title) document.title = seo.title;
  setMeta('name', 'description', seo.description);
  setMeta('name', 'robots', seo.robots);
  setMeta('property', 'og:title', seo.ogTitle || seo.title);
  setMeta('property', 'og:description', seo.ogDescription || seo.description);
  setMeta('property', 'og:url', seo.canonical);
  setMeta('property', 'og:image', seo.ogImage || seo.twitterImage);
  setMeta('name', 'twitter:title', seo.twitterTitle || seo.ogTitle || seo.title);
  setMeta('name', 'twitter:description', seo.twitterDescription || seo.ogDescription || seo.description);
  setMeta('name', 'twitter:image', seo.twitterImage || seo.ogImage);
  setCanonical(seo.canonical);
}

function applyHero(hero) {
  setText('[data-content="heroKicker"]', hero.kicker);
  const title = document.querySelector('[data-content="heroTitle"]');
  if (title) {
    title.textContent = '';
    title.append(text(hero.titleBefore || ''));
    const accent = document.createElement('span');
    accent.className = 'gold-text';
    accent.textContent = hero.titleAccent || '';
    title.append(accent, text(hero.titleAfter || ''));
  }
  setText('[data-content="heroSubtitle"]', hero.subtitle);
  setText('[data-content="heroCity"]', hero.city);
  setText('[data-content="heroDate"]', hero.date);
  setText('[data-content="heroVenue"]', hero.venue);
  setText('[data-content="heroAddress"]', hero.address);
}

function applyAbout(about) {
  setText('[data-content="aboutTitle"]', about.title);
  setText('[data-content="aboutP1"]', about.paragraphs?.[0]);
  setText('[data-content="aboutHighlight"]', about.highlight);
  setText('[data-content="aboutP2"]', about.paragraphs?.[1]);
  document.querySelectorAll('[data-about-stat]').forEach((node, index) => {
    const item = about.stats?.[index];
    if (!item) return;
    setChildText(node, '.stat-number', item.number);
    setMultiline(node.querySelector('.stat-label'), item.label);
  });
}

function renderFeatures(features) {
  const grid = document.querySelector('[data-content="featuresGrid"]');
  if (!grid || !features.length) return;
  grid.textContent = '';
  features.forEach(item => {
    const card = el('div', 'feature-card glass-panel');
    card.append(el('h4', '', item.title), el('p', '', item.text));
    grid.append(card);
  });
}

function applyLocation(location) {
  setText('[data-content="locationTitle"]', location.title);
  setText('[data-content="locationP1"]', location.paragraphs?.[0]);
  setText('[data-content="locationP2"]', location.paragraphs?.[1]);
  setText('[data-content="locationAddress"]', location.address);
  setText('[data-content="schemaTitle"]', location.schemaTitle);
  setImage('[data-content="schemaImage"]', location.schemaImage);
  document.querySelectorAll('[data-location-stat]').forEach((node, index) => {
    const item = location.stats?.[index];
    if (!item) return;
    setChildText(node, 'h5', item.title);
    setMultiline(node.querySelector('p'), item.text);
  });
}

function renderSchemaParticipants(participants) {
  const list = document.querySelector('[data-content="schemaParticipants"]');
  if (!list || !participants.length) return;
  list.textContent = '';
  participants
    .filter(item => item.visible !== false && (item.stand || item.name))
    .forEach(item => {
      const row = el('div', 'schema-participant');
      row.append(el('span', 'schema-stand', item.stand || 'Стенд'), el('span', 'schema-name', item.name || 'Участник'));
      list.append(row);
    });
}

function applyExhibitors(exhibitors) {
  setText('[data-content="exhibitorsTitle"]', exhibitors.title);
  setText('[data-content="exhibitorsDesc"]', exhibitors.description);
}

function applyRoute(route) {
  setText('[data-content="routeTitle"]', route.title);
  setText('[data-content="routeDesc"]', route.description);
}

function renderParticipants(participants) {
  const grid = document.querySelector('[data-content="participantsGrid"]');
  if (!grid || !participants.length) return;
  grid.textContent = '';
  participants.filter(item => item.visible !== false).forEach(item => {
    const card = el('article', 'exhibitor-card');
    const logoWrap = el('div', 'exhibitor-logo-wrap');
    const img = el('img', 'company-logo');
    img.src = item.logo || 'img/logo.png';
    img.loading = 'eager';
    img.alt = item.name || 'Участник выставки';
    logoWrap.append(img);

    const body = el('div', 'exhibitor-body');
    body.append(el('h4', '', item.name));
    if (item.stand) body.append(el('span', 'stand-number', item.stand));
    body.append(el('p', '', item.description));
    const links = participantLinks(item.links);
    if (links) body.append(links);
    card.append(logoWrap, body);
    grid.append(card);
  });
}

function participantLinks(links = {}) {
  const items = [
    ['website', 'Сайт', links.website],
    ['vk', 'ВК', links.vk],
    ['max', 'MAX', links.max],
    ['telegram', 'Telegram', links.telegram]
  ].filter(([, , href]) => href);
  if (!items.length) return null;

  const box = el('div', 'participant-socials');
  items.forEach(([type, label, href]) => {
    const link = el('a', `participant-social-link participant-social-link--${type}`);
    link.href = normalizeUrl(href);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.ariaLabel = label;
    link.title = label;
    link.innerHTML = socialIcon(type, label);
    box.append(link);
  });
  return box;
}

function socialIcon(type, label) {
  if (type === 'website') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.02a15.7 15.7 0 0 0-1.07-5.13A8.03 8.03 0 0 1 18.93 11ZM12 4.04c.83 1.2 1.7 3.31 1.9 6.96h-3.8c.2-3.65 1.07-5.76 1.9-6.96ZM4.07 13h3.02c.14 1.97.53 3.73 1.07 5.13A8.03 8.03 0 0 1 4.07 13Zm3.02-2H4.07a8.03 8.03 0 0 1 4.09-5.13A15.7 15.7 0 0 0 7.09 11ZM12 19.96c-.83-1.2-1.7-3.31-1.9-6.96h3.8c-.2 3.65-1.07 5.76-1.9 6.96Zm3.84-1.83c.54-1.4.93-3.16 1.07-5.13h3.02a8.03 8.03 0 0 1-4.09 5.13Z"/></svg>';
  }
  if (type === 'max') {
    return `<img src="img/icons/max.svg" alt="" loading="lazy"><span>${label}</span>`;
  }
  const slug = type === 'telegram' ? 'telegram' : type;
  return `<img src="https://cdn.simpleicons.org/${slug}/dcb96a" alt="" loading="lazy"><span>${label}</span>`;
}

function normalizeUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '#';
  return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node && value !== undefined) node.textContent = value;
}

function setChildText(parent, selector, value) {
  const node = parent?.querySelector(selector);
  if (node && value !== undefined) node.textContent = value;
}

function setImage(selector, value) {
  const node = document.querySelector(selector);
  if (node && value) node.src = value;
}

function setMeta(attr, key, value) {
  if (!value) return;
  let node = document.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, key);
    document.head.append(node);
  }
  node.setAttribute('content', value);
}

function setCanonical(value) {
  if (!value) return;
  let node = document.querySelector('link[rel="canonical"]');
  if (!node) {
    node = document.createElement('link');
    node.rel = 'canonical';
    document.head.append(node);
  }
  node.href = value;
}

function setMultiline(node, value) {
  if (!node || value === undefined) return;
  node.textContent = '';
  String(value).split('\n').forEach((line, index) => {
    if (index) node.append(document.createElement('br'));
    node.append(text(line));
  });
}

function el(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function text(value) {
  return document.createTextNode(value);
}

function applyExhibitorsPage(t) {
  applySeo(t.seo || {});
  applyExpHero(t.hero || {});
  applyExpAbout(t.about || {});
  applyExpValue(t.value || {});
  applyExpAudience(t.audience || {});
  applyExpFormats(t.formats || {});
  applyExpBusiness(t.business || {});
  applyExpLocation(t.location || {});
  applyExpExhibitorsList(t.exhibitorsList || {});
  applyExpFaq(t.faq || {});
  applyExpLead(t.lead || {});
  applyExpFooter(t.footer || {});
}

function applyExpHero(hero) {
  setText('[data-content="expHeroKicker"]', hero.kicker);
  const title = document.querySelector('[data-content="expHeroTitle"]');
  if (title && (hero.titleBefore !== undefined || hero.titleAccent !== undefined)) {
    title.textContent = '';
    title.append(text(hero.titleBefore || ''));
    const accent = document.createElement('span');
    accent.className = 'gold-text';
    accent.textContent = hero.titleAccent || '';
    title.append(accent);
  }
  setText('[data-content="expHeroSubtitle"]', hero.subtitle);
  document.querySelectorAll('[data-exp-metric]').forEach((node, index) => {
    const item = hero.metrics?.[index];
    if (!item) return;
    setChildText(node, '[data-exp-metric-value]', item.value);
    setChildText(node, '[data-exp-metric-label]', item.label);
  });
  setText('[data-content="expHeroCity"]', hero.city);
  setText('[data-content="expHeroDate"]', hero.date);
  setText('[data-content="expHeroVenueTitle"]', hero.venueTitle);
  setText('[data-content="expHeroVenueAddress"]', hero.venueAddress);
  setText('[data-content="expHeroDeadline"]', hero.deadline);
}

function applyExpAbout(about) {
  setText('[data-content="expAboutTitle"]', about.title);
  setText('[data-content="expAboutP1"]', about.p1);
  setText('[data-content="expAboutHighlight"]', about.highlight);
  setText('[data-content="expAboutP2"]', about.p2);
  document.querySelectorAll('[data-exp-about-stat]').forEach((node, index) => {
    const item = about.stats?.[index];
    if (!item) return;
    setChildText(node, '.stat-number', item.number);
    setMultiline(node.querySelector('.stat-label'), item.label);
  });
}

function applyExpValue(value) {
  setText('[data-content="expValueTitle"]', value.title);
  setText('[data-content="expValueSubtitle"]', value.subtitle);
  document.querySelectorAll('[data-exp-value-item]').forEach((node, index) => {
    const item = value.items?.[index];
    if (!item) return;
    setChildText(node, 'h3', item.title);
    setChildText(node, 'p', item.text);
  });
}

function applyExpAudience(audience) {
  setText('[data-content="expAudienceTitle"]', audience.title);
  document.querySelectorAll('[data-exp-audience-item]').forEach((node, index) => {
    const item = audience.items?.[index];
    if (!item) return;
    setChildText(node, 'h4', item.title);
    setChildText(node, 'p', item.text);
  });
}

function applyExpFormats(formats) {
  setText('[data-content="expFormatsTitle"]', formats.title);
  setText('[data-content="expFormatsDescription"]', formats.description);
  document.querySelectorAll('[data-exp-pricing-card]').forEach((card, index) => {
    const item = formats.cards?.[index];
    if (!item) return;
    setChildText(card, '.price-label', item.label);
    setChildText(card, 'h3', item.price);
    setChildText(card, 'p', item.description);
    setChildText(card, '.price-meta', item.meta);
    setBulletList(card.querySelector(`[data-content="expPricingFeatures${index}"]`), item.features);
  });
  setText('[data-content="expTariffNote"]', formats.tariffNote);
  const build = formats.build || {};
  setText('[data-content="expBuildTitle"]', build.title);
  setText('[data-content="expBuildDescription"]', build.description);
  setText('[data-content="expBuildStandardTitle"]', build.standardTitle);
  setBulletList(document.querySelector('[data-content="expBuildStandardItems"]'), build.standardItems);
  setText('[data-content="expBuildIncludedTitle"]', build.includedTitle);
  setBulletList(document.querySelector('[data-content="expBuildIncludedItems"]'), build.includedItems);
  setText('[data-content="expBuildDeadline"]', build.deadline);
}

function applyExpBusiness(business) {
  document.querySelectorAll('[data-exp-business-card]').forEach((node, index) => {
    const item = business.cards?.[index];
    if (!item) return;
    setChildText(node, 'h2', item.title);
    setChildText(node, 'p', item.text);
  });
}

function applyExpLocation(location) {
  setText('[data-content="expLocationTitle"]', location.title);
  setText('[data-content="expLocationDescription"]', location.description);
  setText('[data-content="expLocationAddressBlock"]', location.addressBlock);
  document.querySelectorAll('[data-exp-location-stat]').forEach((node, index) => {
    const item = location.stats?.[index];
    if (!item) return;
    setChildText(node, 'h5', item.title);
    setMultiline(node.querySelector('p'), item.text);
  });
}

function applyExpExhibitorsList(list) {
  setText('[data-content="expExhibitorsTitle"]', list.title);
  setText('[data-content="expExhibitorsDescription"]', list.description);
}

function applyExpFaq(faq) {
  setText('[data-content="expFaqTitle"]', faq.title);
  document.querySelectorAll('[data-exp-faq-item]').forEach((node, index) => {
    const item = faq.items?.[index];
    if (!item) return;
    setChildText(node, 'summary', item.question);
    setChildText(node, 'p', item.answer);
  });
}

function applyExpLead(lead) {
  setText('[data-content="expLeadKicker"]', lead.kicker);
  setText('[data-content="expLeadTitle"]', lead.title);
  setText('[data-content="expLeadDescription"]', lead.description);
  const phoneLink = document.querySelector('[data-content="expLeadPhone"]');
  if (phoneLink && lead.phone) {
    phoneLink.textContent = lead.phone;
    phoneLink.href = `tel:${lead.phone.replace(/[^\d+]/g, '')}`;
  }
  const tgLink = document.querySelector('[data-content="expLeadTelegram"]');
  if (tgLink && lead.telegram) {
    tgLink.textContent = lead.telegram;
    tgLink.href = normalizeUrl(lead.telegram);
  }
}

function applyExpFooter(footer) {
  setText('[data-content="expFooterCopyright"]', footer.copyright);
  const emailLink = document.querySelector('[data-content="expFooterEmail"]');
  if (emailLink && footer.email) {
    emailLink.textContent = footer.email;
    emailLink.href = `mailto:${footer.email}`;
  }
}

function setBulletList(ul, value) {
  if (!ul || !value) return;
  const items = String(value).split('\n').map(line => line.trim()).filter(Boolean);
  if (!items.length) return;
  ul.textContent = '';
  items.forEach(item => ul.append(el('li', '', item)));
}
