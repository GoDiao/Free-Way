const state = {
  providers: [],
  models: [],
  healthSummary: null,
  syncMetas: {},
  usageRecords: [],
};

const healthLabels = {
  missing_key: 'Missing key',
  configured: 'Configured (untested)',
  healthy: 'Healthy',
  unhealthy: 'Unhealthy',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function fetchJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error?.message ?? `Request failed: ${response.status}`);
  }
  return response.json();
}

function maskPlaceholder(isAvailable) {
  return isAvailable ? 'Configured' : 'Paste API key';
}

function getProviderHealthState(provider) {
  return provider.health?.state ?? (provider.available ? 'configured' : 'missing_key');
}

function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

function formatLatency(ms) {
  if (ms === null || ms === undefined) return '—';
  return `${ms} ms`;
}

function getRouteMeta(stateKey) {
  const meta = {
    healthy: {
      role: 'Active route',
      tone: 'healthy',
      headline: 'Ready for traffic',
      description: 'This provider can receive routed requests.',
      laneStatus: '200 OK',
    },
    configured: {
      role: 'Pending check',
      tone: 'configured',
      headline: 'Key configured',
      description: 'Run a health check before using this route.',
      laneStatus: 'untested',
    },
    unhealthy: {
      role: 'Unavailable',
      tone: 'unhealthy',
      headline: 'Route failing',
      description: 'Free-Way should avoid this route until it recovers.',
      laneStatus: 'failed',
    },
    missing_key: {
      role: 'Key required',
      tone: 'missing_key',
      headline: 'Not configured',
      description: 'Add a provider key to enable this route.',
      laneStatus: 'no key',
    },
  };

  return meta[stateKey] ?? {
    role: 'Unknown',
    tone: 'missing_key',
    headline: 'Unknown state',
    description: 'Provider state is not available.',
    laneStatus: 'unknown',
  };
}

function getLatencyTone(ms) {
  if (ms === null || ms === undefined) return 'muted';
  if (ms < 800) return 'good';
  if (ms < 2500) return 'warn';
  return 'bad';
}

function getProviderInitials(name) {
  return String(name ?? '')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'P';
}

function renderHealthSummary() {
  const root = document.getElementById('health-summary');
  const summary = state.healthSummary;
  if (!summary) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = `
    <div class="summary-card healthy">
      <div class="summary-title">Healthy</div>
      <div class="summary-value">${summary.healthy}</div>
    </div>
    <div class="summary-card unhealthy">
      <div class="summary-title">Unhealthy</div>
      <div class="summary-value">${summary.unhealthy}</div>
    </div>
    <div class="summary-card configured">
      <div class="summary-title">Configured</div>
      <div class="summary-value">${summary.configured}</div>
    </div>
    <div class="summary-card missing_key">
      <div class="summary-title">Missing key</div>
      <div class="summary-value">${summary.missing_key}</div>
    </div>
    <div class="summary-meta">Total: ${summary.total} · last check: ${formatTime(summary.lastCheckedAt)}</div>
  `;
}

function renderProviders() {
  const grid = document.getElementById('providers-grid');
  const search = document.getElementById('provider-search').value.trim().toLowerCase();
  const stateFilter = document.getElementById('provider-state-filter').value;

  const filteredProviders = state.providers.filter(provider => {
    const stateKey = getProviderHealthState(provider);
    const matchesSearch = !search ||
      provider.name.toLowerCase().includes(search) ||
      provider.baseURL.toLowerCase().includes(search) ||
      provider.apiKeyEnvVar.toLowerCase().includes(search);
    const matchesState = stateFilter === 'all' || stateKey === stateFilter;
    return matchesSearch && matchesState;
  });

  if (filteredProviders.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon">⌁</div>
        <div class="empty-state-title">No providers found</div>
        <div class="empty-state-desc">Try changing the search query or provider state filter.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredProviders.map(provider => {
    const stateKey = getProviderHealthState(provider);
    const statusText = healthLabels[stateKey] ?? stateKey;
    const routeMeta = getRouteMeta(stateKey);
    const message = provider.health?.message ?? routeMeta.description;

    const providerModels = state.models
      .filter(model => model.providers.some(p => p.name === provider.name))
      .map(model => {
        const providerRoute = model.providers.find(x => x.name === provider.name);
        return {
          id: model.id,
          actualId: providerRoute?.providerModelId ?? model.id,
        };
      });

    const modelCount = provider.modelCount ?? providerModels.length;
    const visibleModels = providerModels.slice(0, 36);
    const hiddenModelCount = Math.max(0, providerModels.length - visibleModels.length);

    const modelListHtml = providerModels.length > 0
      ? `
        <div class="model-list route-model-list">
          ${visibleModels.map(model => `
            <div class="model-tag route-model-tag" title="Provider model: ${escapeHtml(model.actualId)}">
              ${escapeHtml(model.id)}
            </div>
          `).join('')}
          ${hiddenModelCount > 0 ? `<div class="model-tag route-model-tag muted">+${hiddenModelCount} more</div>` : ''}
        </div>
      `
      : '<div class="model-list-empty">No models found for this provider.</div>';

    const websiteLink = provider.website
      ? `
        <a class="route-link" href="${escapeHtml(provider.website)}" target="_blank" rel="noopener noreferrer">
          Provider site ↗
        </a>
      `
      : '';

    const latency = provider.health?.latencyMs ?? null;
    const latencyTone = getLatencyTone(latency);
    const lastStatus = provider.health?.lastStatusCode ?? '—';
    const lastSuccess = provider.health?.lastSuccessAt ?? null;
    const checkedAt = provider.health?.checkedAt ?? null;

    return `
      <article class="provider-card route-health-card ${stateKey}">
        <div class="route-card-topline"></div>

        <div class="route-card-header">
          <div class="route-provider-main">
            <div class="route-provider-icon ${stateKey}">
              ${escapeHtml(getProviderInitials(provider.name))}
            </div>

            <div class="route-provider-title">
              <div class="route-provider-name">${escapeHtml(provider.name)}</div>
              <div class="route-provider-role">${escapeHtml(routeMeta.role)}</div>
            </div>
          </div>

          <span class="provider-status route-status ${stateKey}">
            ${escapeHtml(statusText)}
          </span>
        </div>

        <div class="route-lane ${stateKey}">
          <div class="route-lane-node source">
            <span>Free-Way</span>
            <strong>localhost</strong>
          </div>

          <div class="route-lane-line">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div class="route-lane-node target">
            <span>Provider</span>
            <strong>${escapeHtml(provider.name)}</strong>
          </div>

          <div class="route-lane-result ${stateKey}">
            ${escapeHtml(routeMeta.laneStatus)}
          </div>
        </div>

        <div class="route-health-copy route-detail-block">
          <div class="route-health-headline">${escapeHtml(routeMeta.headline)}</div>
          <div class="route-health-message">${escapeHtml(message)}</div>
        </div>

        <div class="route-metrics">
          <div class="route-metric">
            <span>Latency</span>
            <strong class="latency-${latencyTone}">${formatLatency(latency)}</strong>
          </div>

          <div class="route-metric">
            <span>Status</span>
            <strong>${escapeHtml(lastStatus)}</strong>
          </div>

          <div class="route-metric">
            <span>Models</span>
            <strong>${escapeHtml(modelCount)}</strong>
          </div>

          <div class="route-metric wide">
            <span>Last success</span>
            <strong>${escapeHtml(formatTime(lastSuccess))}</strong>
          </div>
        </div>

        <div class="route-detail-block route-config">
          <div class="route-config-row">
            <span>Base URL</span>
            <code title="${escapeHtml(provider.baseURL)}">${escapeHtml(provider.baseURL)}</code>
          </div>

          <div class="route-config-row">
            <span>Env</span>
            <code>${escapeHtml(provider.apiKeyEnvVar)}</code>
          </div>

          ${websiteLink ? `
            <div class="route-config-row route-config-link">
              <span>Docs</span>
              ${websiteLink}
            </div>
          ` : ''}
        </div>

        <div class="provider-models route-models">
          <div class="provider-models-header route-models-header">
            <button class="provider-model-toggle route-model-toggle" type="button" data-toggle-models aria-expanded="false">
              <span>${escapeHtml(modelCount)} models available</span>
              <span class="provider-model-toggle-icon">▾</span>
            </button>

            <button class="btn-secondary route-details-btn" type="button" data-toggle-details aria-expanded="false">
              Details
            </button>

            <button class="btn-secondary route-test-btn" data-check-provider="${escapeHtml(provider.name)}">
              Test route
            </button>
          </div>

          <div class="route-check-meta route-detail-block">
            Last checked: ${escapeHtml(formatTime(checkedAt))}
          </div>

          <div class="provider-model-list-wrapper route-model-list-wrapper route-detail-block">
            ${modelListHtml}
          </div>
        </div>
      </article>
    `;
  }).join('');

  setTimeout(() => {
    grid.querySelectorAll('[data-toggle-models]').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.provider-card');
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        const nextOpen = !isOpen;
        button.setAttribute('aria-expanded', String(nextOpen));
        card.classList.toggle('models-open', nextOpen);
      });
    });

    grid.querySelectorAll('[data-toggle-details]').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.provider-card');
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        const nextOpen = !isOpen;
        button.setAttribute('aria-expanded', String(nextOpen));
        button.textContent = nextOpen ? 'Hide details' : 'Details';
        card.classList.toggle('details-open', nextOpen);
      });
    });

    grid.querySelectorAll('[data-check-provider]').forEach(button => {
      button.addEventListener('click', async () => {
        const provider = button.getAttribute('data-check-provider');

        try {
          button.disabled = true;
          button.textContent = 'Testing...';
          await fetchJSON(`/api/health/check/${encodeURIComponent(provider)}`, { method: 'POST' });
          await loadCatalog();
        } catch (error) {
          alert(error.message);
        } finally {
          button.disabled = false;
          button.textContent = 'Test route';
        }
      });
    });
  }, 0);
}

function renderModels() {
  const search = document.getElementById('model-search').value.trim().toLowerCase();
  const sortKey = document.getElementById('model-sort')?.value || 'name';
  const list = document.getElementById('models-list');

  const filtered = state.models.filter(model => {
    const matchesSearch = !search || [
      model.id,
      model.modality || '',
      ...model.providers.map(p => p.name),
    ].some(value => value.toLowerCase().includes(search));
    return matchesSearch;
  });

  const sorted = filtered.slice().sort((a, b) => {
    if (sortKey === 'context') {
      return (b.context ?? 0) - (a.context ?? 0) || a.id.localeCompare(b.id);
    }
    if (sortKey === 'providers') {
      return b.providers.length - a.providers.length || a.id.localeCompare(b.id);
    }
    return a.id.localeCompare(b.id);
  });

  list.innerHTML = sorted.map(model => `
    <div class="model-item">
      <div class="model-info">
        <div>
          <div class="model-id">${model.id}</div>
          <div class="provider-model-id">${model.providers.map(p => `${p.name}: ${p.providerModelId}`).join(' · ')}</div>
        </div>
        <div class="model-provider">${model.providers.length} providers</div>
      </div>
      <div class="model-specs">
        <div class="model-spec">Context <span>${model.context ? formatNumber(model.context) : '—'}</span></div>
        <div class="model-spec">Output <span>${model.maxOutput ? formatNumber(model.maxOutput) : '—'}</span></div>
        <div class="model-spec">Mode <span>${model.modality || '—'}</span></div>
      </div>
    </div>
  `).join('');
}

function renderKeys() {
  const container = document.getElementById('keys-form');
  container.innerHTML = state.providers.map(provider => {
    const websiteLink = provider.website
      ? ` <a href="${provider.website}" target="_blank" rel="noopener noreferrer" class="provider-website-link" title="Get API key">🔗</a>`
      : '';

    return `
    <div class="key-input-group">
      <label for="key-${provider.name}">${provider.name}${websiteLink} <span class="env-hint">(${provider.apiKeyEnvVar})</span></label>
      <input
        id="key-${provider.name}"
        type="password"
        data-env-var="${provider.apiKeyEnvVar}"
        class="${provider.available ? 'set' : ''}"
        placeholder="${maskPlaceholder(provider.available)}"
        autocomplete="off"
      >
    </div>`;
  }).join('');
}

function renderTestModelOptions() {
  const select = document.getElementById('test-model');
  select.innerHTML = state.models
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(model => `<option value="${model.id}">${model.id}</option>`)
    .join('');
}

function renderUsage() {
  const tbody = document.getElementById('usage-table-body');
  const records = state.usageRecords;
  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">No usage recorded yet.</td></tr>';
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td><code>${r.modelId}</code></td>
      <td><span class="provider-badge">${r.providerName}</span></td>
      <td class="numeric">${formatNumber(r.callCount)}</td>
      <td class="numeric">${formatNumber(r.promptTokens)}</td>
      <td class="numeric">${formatNumber(r.completionTokens)}</td>
      <td class="numeric"><strong>${formatNumber(r.totalTokens)}</strong></td>
      <td>${formatTime(r.lastUsedAt)}</td>
    </tr>
  `).join('');
}

function renderSyncMeta() {
  const root = document.getElementById('sync-meta');
  if (!root) return;
  const metas = state.syncMetas;
  const entries = Object.entries(metas);
  if (entries.length === 0) {
    root.textContent = 'Models: using built-in lists';
    return;
  }
  root.innerHTML = entries.map(([name, meta]) => {
    const sourceLabel = meta.source === 'api' ? 'live' : 'cached';
    return `<span>${name}: ${sourceLabel} @ ${formatTime(meta.updatedAt)}</span>`;
  }).join(' · ');
}

async function loadUsage() {
  try {
    const data = await fetchJSON('/api/usage');
    state.usageRecords = data.records ?? [];
    renderUsage();
  } catch {
    // ignore usage fetch errors
  }
}

async function clearUsage() {
  if (!state.usageRecords || state.usageRecords.length === 0) {
    alert('No usage records to clear.');
    return;
  }
  if (!confirm('Are you sure you want to clear all usage records? This action cannot be undone.'))
    return;
  try {
    const button = document.getElementById('clear-usage');
    button.disabled = true;
    button.textContent = 'Clearing...';
    await fetchJSON('/api/usage', { method: 'DELETE' });
    state.usageRecords = [];
    renderUsage();
  } catch (error) {
    alert(error.message);
  } finally {
    const button = document.getElementById('clear-usage');
    button.disabled = false;
    button.textContent = 'Clear Usage';
  }
}

async function loadCatalog() {
  const data = await fetchJSON('/api/catalog');
  state.providers = data.providers;
  state.models = data.models;
  state.healthSummary = data.healthSummary ?? null;
  state.syncMetas = data.syncMetas ?? {};
  renderHealthSummary();
  renderProviders();
  renderSyncMeta();
  renderUsage();
  renderModels();
  renderKeys();
  renderTestModelOptions();
}

async function saveKeys() {
  const inputs = Array.from(document.querySelectorAll('#keys-form input'));
  const keys = {};
  for (const input of inputs) {
    if (input.value.trim()) {
      keys[input.dataset.envVar] = input.value.trim();
    }
  }

  const gatewayInput = document.getElementById('gateway-key');
  const gatewayKey = gatewayInput ? gatewayInput.value.trim() : '';

  const result = await fetchJSON('/api/config/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys, gatewayKey }),
  });

  alert(`Saved ${result.updated.length} API key(s).`);
  await loadCatalog();
  inputs.forEach(input => {
    input.value = '';
  });
}

async function sendTestRequest() {
  const resultContent = document.getElementById('result-content');
  const routeInfo = document.getElementById('route-info');
  const model = document.getElementById('test-model').value;
  const message = document.getElementById('test-message').value.trim();
  const temperature = Number(document.getElementById('test-temp').value);
  const maxTokens = Number(document.getElementById('test-max-tokens').value);
  const stream = document.getElementById('test-stream').checked;

  if (!message) {
    alert('Please enter a message.');
    return;
  }

  resultContent.textContent = 'Loading...';
  routeInfo.textContent = '';

  try {
    if (stream) {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: message }],
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error?.message ?? `Request failed: ${response.status}`);
      }

      const provider = response.headers.get('X-Freeway-Provider') ?? 'unknown';
      routeInfo.textContent = `Provider: ${provider} · Request model: ${model}`;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      resultContent.textContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        resultContent.textContent = full;
      }
    } else {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: message }],
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error?.message ?? `Request failed: ${response.status}`);
      }

      const provider = response.headers.get('X-Freeway-Provider') ?? 'unknown';
      const payload = await response.json();
      const actualModel = payload.model ?? 'unknown';
      routeInfo.textContent = `Provider: ${provider} · Request model: ${model} · Actual model: ${actualModel}`;
      resultContent.textContent = JSON.stringify(payload, null, 2);
    }
  } catch (error) {
    resultContent.textContent = error.message;
    routeInfo.textContent = '';
  }
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const tabs = document.querySelectorAll('.tab-content');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(item => item.classList.remove('active'));
      tabs.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.tab).classList.add('active');
    });
  });
}

function bindEvents() {
  document.getElementById('model-search').addEventListener('input', renderModels);
  document.getElementById('model-sort').addEventListener('change', renderModels);
  document.getElementById('provider-search').addEventListener('input', renderProviders);
  document.getElementById('provider-state-filter').addEventListener('change', renderProviders);
  document.getElementById('save-keys').addEventListener('click', saveKeys);
  document.getElementById('send-test').addEventListener('click', sendTestRequest);
  document.getElementById('check-all-health').addEventListener('click', async event => {
    const button = event.currentTarget;
    try {
      button.disabled = true;
      button.textContent = 'Testing all...';
      await fetchJSON('/api/health/check-all', { method: 'POST' });
      await loadCatalog();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Test All Providers';
    }
  });

  document.getElementById('refresh-models').addEventListener('click', async event => {
    const button = event.currentTarget;
    try {
      button.disabled = true;
      button.textContent = 'Syncing...';
      await fetchJSON('/api/models/refresh', { method: 'POST' });
      await loadCatalog();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Refresh All Models';
    }
  });

  const clearUsageBtn = document.getElementById('clear-usage');
  if (clearUsageBtn) {
    clearUsageBtn.addEventListener('click', clearUsage);
  }
}

async function init() {
  setupTabs();
  bindEvents();
  await loadCatalog();
  await loadUsage();
}

init().catch(error => {
  document.getElementById('result-content').textContent = error.message;
});
