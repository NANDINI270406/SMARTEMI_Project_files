import { createContext, useContext, useEffect, useState } from 'react'

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/authService'


const AuthContext = createContext(null)


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    checkAuthentication()
  }, [])


  const checkAuthentication = async () => {
    try {
      const data = await getCurrentUser()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }


  const register = async (userData) => {
    const data = await registerUser(userData)

    return data
  }


  const login = async (credentials) => {
    const data = await loginUser(credentials)

    setUser(data.user)

    return data
  }


  const logout = async () => {
    await logoutUser()
    setUser(null)
  }


  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    checkAuthentication,
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider',
    )
  }

  return context
}
