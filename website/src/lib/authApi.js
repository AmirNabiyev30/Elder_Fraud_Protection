const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function resolveToken(tokenOrGetter) {
  if (!tokenOrGetter) {
    return null
  }

  if (typeof tokenOrGetter === 'function') {
    return tokenOrGetter()
  }

  return tokenOrGetter
}

export async function fetchWithClerkToken(path, tokenOrGetter, options = {}) {
  const token = await resolveToken(tokenOrGetter)
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  })

  return response
}

export async function fetchAuthContext(tokenOrGetter) {
  return fetchWithClerkToken('/api/auth/context', tokenOrGetter, {
    method: 'GET',
  })
}

export async function syncUserProfile(tokenOrGetter, userDetails) {
  return fetchWithClerkToken('/api/users/sync', tokenOrGetter, {
    method: 'POST',
    body: JSON.stringify(userDetails),
  })
}

export async function scanEmail(tokenOrGetter, text) {
  return fetchWithClerkToken('/api/scan', tokenOrGetter, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export async function fetchCurrentUserProfile(tokenOrGetter) {
  return fetchWithClerkToken('/api/users/me', tokenOrGetter, {
    method: 'GET',
  })
}

export async function fetchRecentScans(tokenOrGetter, limit = 10) {
  return fetchWithClerkToken(`/api/scans/recent?limit=${limit}`, tokenOrGetter, {
    method: 'GET',
  })
}
