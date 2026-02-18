import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('refactor_ai_token'))
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const isAuthenticated = !!token

    const login = async (email, password) => {
        setLoading(true)
        try {
            const response = await api.post('/auth/login', { email, password })
            const { access_token } = response.data
            localStorage.setItem('refactor_ai_token', access_token)
            setToken(access_token)
            setUser({ email })
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed'
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const signup = async (email, password) => {
        setLoading(true)
        try {
            const response = await api.post('/auth/signup', { email, password })
            const { access_token } = response.data
            localStorage.setItem('refactor_ai_token', access_token)
            setToken(access_token)
            setUser({ email })
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.detail || 'Signup failed'
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('refactor_ai_token')
        setToken(null)
        setUser(null)
    }

    const forgotPassword = async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email })
            return { success: true, message: response.data.message }
        } catch (error) {
            const message = error.response?.data?.detail || 'Email not found'
            return { success: false, message }
        }
    }

    const resetPassword = async (email, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', {
                email,
                new_password: newPassword,
            })
            return { success: true, message: response.data.message }
        } catch (error) {
            const message = error.response?.data?.detail || 'Reset failed'
            return { success: false, message }
        }
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                isAuthenticated,
                login,
                signup,
                logout,
                forgotPassword,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
