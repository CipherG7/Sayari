"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"

interface TransactionStatusProps {
  isLoading: boolean
  error: string | null
  success?: {
    digest: string
    message?: string
  }
  onRetry?: () => void
  onClose?: () => void
}

export function TransactionStatus({ isLoading, error, success, onRetry, onClose }: TransactionStatusProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openExplorer = (digest: string) => {
    window.open(`https://suiexplorer.com/txblock/${digest}?network=testnet`, "_blank")
  }

  if (isLoading) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            <span>Processing transaction...</span>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>{error}</p>
            <div className="flex space-x-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Retry
                </Button>
              )}
              {onClose && (
                <Button size="sm" variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="text-green-800">{success.message || "Transaction completed successfully!"}</p>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-green-100 px-2 py-1 rounded">{success.digest.slice(0, 20)}...</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(success.digest)} className="h-6 px-2">
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => openExplorer(success.digest)} className="h-6 px-2">
                <ExternalLink className="h-3 w-3" />
                Explorer
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}