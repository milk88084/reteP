import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL as string

// Clerk provides this; updated by ApiAuthSync on session change.
let _getToken: (() => Promise<string | null>) | null = null

export const setApiTokenGetter = (fn: (() => Promise<string | null>) | null) => {
  _getToken = fn
}

export const apiClient = axios.create({ baseURL })

// Inject a fresh Clerk JWT before every request.
apiClient.interceptors.request.use(async (config) => {
  const token = _getToken ? await _getToken() : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
