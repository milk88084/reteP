import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  // Clerk stores session token in various keys; adjust if needed after Clerk setup
  const token = localStorage.getItem('__clerk_db_jwt')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default httpClient
