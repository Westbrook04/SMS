import client from './client'

export interface LoginResponse {
    success: boolean
    data: {
        token: string
        username: string
    } | null
    error: string | null
}

export const login = (username: string, password: string) => {
    return client.post<LoginResponse>('/api/auth/login', { username, password })
}
