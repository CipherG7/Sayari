import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import WalletProviderWrapper from "../components/wallet-provider"
import AuthWrapper from "../components/AuthWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sayari - Decentralized Savings & Credit Platform",
  description:
    "Join community-driven savings groups, contribute regularly, and access fair loans through democratic voting. Powered by Sui blockchain.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProviderWrapper>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </WalletProviderWrapper>
      </body>
    </html>
  )
}