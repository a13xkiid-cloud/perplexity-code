const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function gatewayUrl(path) {
  const configured = process.env.PXC_GATEWAY_URL;
  if (!configured) {
    throw new Error('Set PXC_GATEWAY_URL to your local gateway API base URL.');
  }

  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('PXC_GATEWAY_URL must be a valid local HTTP or HTTPS URL.');
  }

  if (
    !['http:', 'https:'].includes(url.protocol)
    || !LOCAL_HOSTS.has(url.hostname)
    || url.username
    || url.password
    || url.search
    || url.hash
  ) {
    throw new Error('PXC_GATEWAY_URL must be a local URL without credentials, a query, or a fragment.');
  }

  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${path}`;
  return url;
}

async function requestGateway(path, body) {
  const url = gatewayUrl(path);
  const headers = { Accept: 'application/json' };
  const key = process.env.PXC_GATEWAY_API_KEY;
  if (key) headers.Authorization = `Bearer ${key}`;
  if (body) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(300_000),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('The local gateway request timed out.');
    }
    throw new Error('Could not reach the local gateway. Check that it is running and accessible.');
  }

  if (!response.ok) {
    throw new Error(`The local gateway returned HTTP ${response.status}. Check its configuration and authorization.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('The local gateway returned an invalid JSON response.');
  }
}

export async function askGateway(prompt, model) {
  if (!model) {
    throw new Error('A gateway model is required. Use --model with an available model ID.');
  }

  const result = await requestGateway('chat/completions', {
    model,
    messages: [{ role: 'user', content: prompt }],
  });
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('The local gateway returned no text response.');
  }
  return content.trim();
}

export async function listGatewayModels() {
  const result = await requestGateway('models');
  if (
    !Array.isArray(result?.data)
    || result.data.some((model) => typeof model?.id !== 'string' || !model.id)
  ) {
    throw new Error('The local gateway returned an invalid model list.');
  }
  return result.data.map((model) => model.id);
}
