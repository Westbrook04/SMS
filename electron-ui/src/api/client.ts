import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 每次发请求前，自动带上 token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('sms_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default client
