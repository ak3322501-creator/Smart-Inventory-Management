const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || (import.meta.env.DEV ? 'http://localhost:4000' : '');
const BASE_URL = `${API_ORIGIN}/api`;

function authHeaders() {
  const stored = localStorage.getItem('inventoryUser');
  if (!stored) return {};

  try {
    const user = JSON.parse(stored);
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
  } catch {
    return {};
  }
}

async function readJson(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  throw new Error(`Expected JSON from API but received ${response.status} ${response.statusText}. Check that the backend is running.`);
}

export async function apiGet(path) {
  try {
    return await apiGetStrict(path);
  } catch (error) {
    console.error('API GET failed', error);
    return [];
  }
}

export async function apiGetStrict(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders()
  });
  const result = await readJson(response);
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

export async function apiPost(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  const result = await readJson(response);
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

export async function apiPut(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  const result = await readJson(response);
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

export async function apiDelete(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const result = await readJson(response);
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

export async function apiUpload(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData
  });
  const result = await readJson(response);
  if (!response.ok) {
    throw new Error(result.error || 'Image upload failed');
  }

  return {
    ...result,
    imageUrl: result.imageUrl?.startsWith('http') || result.imageUrl?.startsWith('data:')
      ? result.imageUrl
      : `${API_ORIGIN}${result.imageUrl}`
  };
}
