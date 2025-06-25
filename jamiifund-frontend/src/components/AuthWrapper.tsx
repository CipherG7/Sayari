"use client"

import { useEffect, useState } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Header } from "./header"
import LoginPage from "../app/login/page"

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const currentAccount = useCurrentAccount()

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") {
        setIsLoading(false)
        return
      }

      const zkLoginJWT = localStorage.getItem("zklogin_jwt")
      const zkLoginAddress = localStorage.getItem("zklogin_address")
      const walletConnected = localStorage.getItem("wallet_connected")

      const hasZkLogin = zkLoginJWT && zkLoginAddress
      const hasWalletConnection = currentAccount && walletConnected

      if (hasZkLogin || hasWalletConnection) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [currentAccount])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <>
      <Header />
      {children}
    </>
  )
}