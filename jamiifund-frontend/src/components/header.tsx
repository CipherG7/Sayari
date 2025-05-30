"use client"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Coins, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@mysten/dapp-kit"

export function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Groups", href: "/groups" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Loans", href: "/loans" },
    { name: "Governance", href: "/governance" },
    { name: "KYC", href: "/kyc" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <style jsx global>{`
        .connect-button-custom button {
          background-color: #de5a1f !important;
          border-color: #de5a1f !important;
          color: white !important;
        }
        .connect-button-custom button:hover {
          background-color: #c54c18 !important;
          border-color: #c54c18 !important;
        }
        .connect-button-custom button:focus {
          box-shadow: 0 0 0 2px rgba(222, 90, 31, 0.2) !important;
        }
      `}</style>
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Coins className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">Jamii Fund</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                    isActive(item.href) ? "text-orange-600" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="connect-button-custom">
              <ConnectButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <nav className="flex flex-col space-y-4 pt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                      isActive(item.href) ? "text-orange-600" : "text-gray-600"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  {isConnected && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 mb-3">
                      Connected
                    </Badge>
                  )}
                  <Button
                    onClick={() => {
                      setIsConnected(!isConnected)
                      setIsMobileMenuOpen(false)
                    }}
                    variant={isConnected ? "outline" : "default"}
                    className={`w-full ${
                      isConnected
                        ? "border-orange-600 text-orange-600 hover:bg-orange-50"
                        : "bg-orange-600 hover:bg-orange-700"
                    }`}
                  >
                    {isConnected ? "Wallet Connected" : "Connect Wallet"}
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}