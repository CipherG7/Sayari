"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Badge } from "../../../components/ui/badge"
import { Users, PiggyBank, Shield, Info, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useBlockchain } from "../../../hooks/use-blockchain"
import { TransactionStatus } from "../../../components/transaction-status"

export default function CreateGroupPage() {
  const [step, setStep] = useState(1)
  const { createGroup, isLoading, error } = useBlockchain()
  const [transactionSuccess, setTransactionSuccess] = useState<{ digest: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    maxMembers: 20,
    minContribution: 100,
    loanRatio: 50,
    kycRequired: true,
    isPrivate: false,
  })

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateGroup = async () => {
    try {
      // Convert minContribution to MIST (1 SUI = 1,000,000,000 MIST)
      const minContributionMist = formData.minContribution * 1_000_000_000

      const result = await createGroup({
        name: formData.name,
        description: formData.description,
        minContribution: minContributionMist,
        maxMembers: formData.maxMembers,
        loanRatio: formData.loanRatio,
        kycRequired: formData.kycRequired,
      })

      setTransactionSuccess({
        digest: result.digest,
      })

      // Move to success step
      setStep(4)
    } catch (err) {
      console.error("Failed to create group:", err)
      // Error is already handled by the useBlockchain hook
    }
  }

  const categories = [
    { value: "professional", label: "Professional" },
    { value: "business", label: "Business" },
    { value: "community", label: "Community" },
    { value: "creative", label: "Creative" },
    { value: "education", label: "Education" },
    { value: "family", label: "Family & Friends" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/groups">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Groups
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Group</h1>
              <p className="text-gray-600">Set up your community savings circle</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Transaction Status */}
        {(isLoading || error || transactionSuccess) && (
          <div className="mb-6">
            <TransactionStatus
              isLoading={isLoading}
              error={error}
              success={transactionSuccess ?? undefined}
              onRetry={() => handleCreateGroup()}
            />
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-orange-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>Provide the basic details about your savings group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Professionals Savings Circle"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and goals of your savings group..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.description || !formData.category}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Next: Financial Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Financial Settings */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>Financial Settings</span>
              </CardTitle>
              <CardDescription>Configure the financial parameters for your group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min="5"
                    max="100"
                    value={formData.maxMembers}
                    onChange={(e) => handleInputChange("maxMembers", Number.parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-600">Recommended: 10-30 members</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minContribution">Minimum Contribution (SUI)</Label>
                  <Input
                    id="minContribution"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.minContribution}
                    onChange={(e) => handleInputChange("minContribution", Number.parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-gray-600">Monthly minimum contribution amount</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanRatio">Loan-to-Contribution Ratio (%)</Label>
                <Input
                  id="loanRatio"
                  type="number"
                  min="10"
                  max="100"
                  value={formData.loanRatio}
                  onChange={(e) => handleInputChange("loanRatio", Number.parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-600">
                  Maximum loan amount as percentage of members total contributions
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Financial Parameters</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      These settings determine how much members can borrow relative to their contributions. A 50% ratio
                      means members can borrow up to half of their total contributions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Previous
                </Button>
                <Button onClick={() => setStep(3)} className="bg-orange-600 hover:bg-orange-700">
                  Next: Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Security & Privacy */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>Configure security and privacy settings for your group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>KYC Verification Required</Label>
                    <p className="text-sm text-gray-600">Require members to complete identity verification</p>
                  </div>
                  <Switch
                    checked={formData.kycRequired}
                    onCheckedChange={(checked) => handleInputChange("kycRequired", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Private Group</Label>
                    <p className="text-sm text-gray-600">Group will not appear in public listings</p>
                  </div>
                  <Switch
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Group Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="secondary">{formData.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Members:</span>
                    <span className="font-medium">{formData.maxMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Contribution:</span>
                    <span className="font-medium">{formData.minContribution} SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Ratio:</span>
                    <span className="font-medium">{formData.loanRatio}%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Previous
                </Button>
                <Button onClick={handleCreateGroup} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
                  {isLoading ? "Creating Group..." : "Create Group"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Group Created Successfully!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your savings group &quot;{formData.name}&quot; has been created and deployed to the blockchain. You can now start
                inviting members and managing your group.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/groups">Browse Groups</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
