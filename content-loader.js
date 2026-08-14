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
  const { texts = {}, features = [], participants = [] } = content || {};
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
    img.loading = 'lazy';
    img.alt = item.name || 'Участник выставки';
    logoWrap.append(img);

    const body = el('div', 'exhibitor-body');
    body.append(el('h4', '', item.name));
    if (item.stand) body.append(el('span', 'stand-number', item.stand));
    body.append(el('p', '', item.description));
    card.append(logoWrap, body);
    grid.append(card);
  });
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
