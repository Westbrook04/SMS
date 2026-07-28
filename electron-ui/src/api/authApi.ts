import client from './client'

export interface LoginResponse {
    success: boolean
    data: {
        token: string
        username: string
    } | null
    error: string | null
}

export interface SendCodeResponse {
    success: boolean
    data: {
        message: string
    } | null
    error: string | null
}

export const login = (username: string, password: string) => {
    return client.post<LoginResponse>('/api/auth/login', { username, password })
}

export const sendCode = (phone: string) => {
    return client.post<SendCodeResponse>('/api/auth/code/send', { phone })
}

export const loginByCode = (phone: string, code: string) => {
    return client.post<LoginResponse>('/api/auth/login-by-code', { phone, code })
}
