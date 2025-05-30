"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Shield, Phone, Mail, CheckCircle, AlertTriangle, Clock, Star, User, FileText, Send } from "lucide-react"

export default function KYCPage() {
  const [activeTab, setActiveTab] = useState("verify")
  const [verificationStep, setVerificationStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [verificationData, setVerificationData] = useState({
    contact: "",
    contactType: "",
    verificationCode: "",
  })

  // Mock user KYC status
  const [userKYC, setUserKYC] = useState({
    isVerified: false,
    badge: null as any,
    reputation: 0,
    isFlagged: false,
  })

  // Mock pending verification
  const [pendingVerification, setPendingVerification] = useState(null as any)

  const handleRequestVerification = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock verification code generation
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString()

    setPendingVerification({
      contact: verificationData.contact,
      contactType: verificationData.contactType,
      code: mockCode,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    })

    setVerificationStep(2)
    setIsLoading(false)
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (verificationData.verificationCode === pendingVerification?.code) {
      // Success - issue KYC badge
      setUserKYC({
        isVerified: true,
        badge: {
          id: "badge_123",
          contact: verificationData.contact,
          contactType: Number.parseInt(verificationData.contactType),
          issuedAt: Date.now(),
          expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
          isFlagged: false,
        },
        reputation: 100,
        isFlagged: false,
      })
      setVerificationStep(3)
      setPendingVerification(null)
    } else {
      alert("Invalid verification code")
    }

    setIsLoading(false)
  }

  const getContactTypeIcon = (type: string) => {
    return type === "1" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />
  }

  const getContactTypeLabel = (type: string) => {
    return type === "1" ? "Phone" : "Email"
  }

  const getReputationColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getReputationLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Poor"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
              <p className="text-gray-600">Verify your identity to access all platform features</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verify">Verification</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="reputation">Reputation</TabsTrigger>
          </TabsList>

          <TabsContent value="verify" className="space-y-6">
            {!userKYC.isVerified ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Identity Verification</span>
                  </CardTitle>
                  <CardDescription>Complete KYC verification to access loans and enhanced features</CardDescription>
                </CardHeader>
                <CardContent>
                  {verificationStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Contact Type</Label>
                          <Select
                            value={verificationData.contactType}
                            onValueChange={(value) => setVerificationData((prev) => ({ ...prev, contactType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select verification method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>Phone Number</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>Email Address</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{verificationData.contactType === "1" ? "Phone Number" : "Email Address"}</Label>
                          <Input
                            type={verificationData.contactType === "1" ? "tel" : "email"}
                            placeholder={verificationData.contactType === "1" ? "+1 (555) 123-4567" : "your@email.com"}
                            value={verificationData.contact}
                            onChange={(e) => setVerificationData((prev) => ({ ...prev, contact: e.target.value }))}
                          />
                        </div>
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          We'll send a verification code to your{" "}
                          {verificationData.contactType === "1" ? "phone" : "email"}. This information is encrypted and
                          used only for identity verification.
                        </AlertDescription>
                      </Alert>

                      <Button
                        className="w-full"
                        onClick={handleRequestVerification}
                        disabled={!verificationData.contact || !verificationData.contactType || isLoading}
                      >
                        {isLoading ? "Sending Code..." : "Send Verification Code"}
                      </Button>
                    </div>
                  )}

                  {verificationStep === 2 && pendingVerification && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="p-4 bg-blue-50 rounded-lg mb-4">
                          <Send className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="font-medium">Verification Code Sent</p>
                          <p className="text-sm text-gray-600">
                            Check your {verificationData.contactType === "1" ? "phone" : "email"} for the 6-digit code
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Verification Code</Label>
                          <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={verificationData.verificationCode}
                            onChange={(e) =>
                              setVerificationData((prev) => ({ ...prev, verificationCode: e.target.value }))
                            }
                          />
                        </div>

                        <div className="text-sm text-gray-600 text-center">Code expires in 5 minutes</div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1" onClick={() => setVerificationStep(1)}>
                          Back
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleVerifyCode}
                          disabled={verificationData.verificationCode.length !== 6 || isLoading}
                        >
                          {isLoading ? "Verifying..." : "Verify Code"}
                        </Button>
                      </div>

                      {/* Debug info - remove in production */}
                      <Alert>
                        <AlertDescription>
                          <strong>Debug:</strong> Verification code is {pendingVerification.code}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {verificationStep === 3 && (
                    <div className="text-center space-y-6">
                      <div className="p-8">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h3>
                        <p className="text-gray-600 mb-6">
                          Your KYC badge has been issued. You now have access to all platform features.
                        </p>
                        <Button onClick={() => setActiveTab("status")}>View KYC Status</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Already Verified</h3>
                  <p className="text-gray-600 mb-6">
                    Your identity has been verified. Check your status for more details.
                  </p>
                  <Button onClick={() => setActiveTab("status")}>View KYC Status</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>KYC Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {userKYC.isVerified ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Verified</p>
                          <p className="text-sm text-green-700">Identity verification complete</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>

                    {userKYC.badge && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Badge Details</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Contact Method</p>
                            <div className="flex items-center space-x-2">
                              {getContactTypeIcon(userKYC.badge.contactType.toString())}
                              <span className="font-medium">
                                {getContactTypeLabel(userKYC.badge.contactType.toString())}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600">Verified Contact</p>
                            <p className="font-medium">{userKYC.badge.contact}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Issued Date</p>
                            <p className="font-medium">{new Date(userKYC.badge.issuedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Expires</p>
                            <p className="font-medium">{new Date(userKYC.badge.expiresAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {userKYC.isFlagged && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Your account has been flagged. Please contact support for assistance.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Verified</h3>
                    <p className="text-gray-600 mb-4">Complete identity verification to access all features</p>
                    <Button onClick={() => setActiveTab("verify")}>Start Verification</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reputation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Reputation Score</span>
                </CardTitle>
                <CardDescription>
                  Your reputation is based on contribution history and loan repayment behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getReputationColor(userKYC.reputation)}`}>
                    {userKYC.reputation}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">{getReputationLabel(userKYC.reputation)}</div>
                  <Progress value={userKYC.reputation} className="max-w-xs mx-auto" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Contributions Made</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">2</div>
                    <div className="text-sm text-gray-600">Loans Repaid</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
                    <div className="text-sm text-gray-600">Defaults</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Reputation Factors</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Regular Contributions</span>
                      <span className="text-green-600">+40 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-time Loan Repayments</span>
                      <span className="text-green-600">+20 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KYC Verification</span>
                      <span className="text-green-600">+40 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Defaults</span>
                      <span className="text-gray-400">0 points</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Maintain a high reputation score to access better loan terms and higher borrowing limits.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
