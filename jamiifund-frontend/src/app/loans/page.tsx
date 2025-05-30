"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { DollarSign, AlertCircle, Plus } from "lucide-react"
import { useBlockchain } from "../../hooks/use-blockchain"
import { useBlockchainData } from "../../hooks/use-blockchain-data"
import { TransactionStatus } from "../../components/transaction-status"

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [loanRequest, setLoanRequest] = useState({
    groupId: "",
    amount: "",
    purpose: "",
    repaymentPlan: "",
  })

  const { userGroups, userLoans, refreshData } = useBlockchainData()
  const { requestLoan, repayLoan, isLoading, error } = useBlockchain()
  const [transactionSuccess, setTransactionSuccess] = useState<{ digest: string; message?: string } | null>(null)

  // Handle loan request submission
  const handleLoanRequest = async () => {
    try {
      // Convert amount to MIST (1 SUI = 1,000,000,000 MIST)
      const amountMist = Number.parseFloat(loanRequest.amount) * 1_000_000_000

      const result = await requestLoan({
        groupId: loanRequest.groupId,
        amount: amountMist,
        purpose: loanRequest.purpose,
        repaymentPlan: loanRequest.repaymentPlan,
      })

      setTransactionSuccess({
        digest: result.digest,
        message: "Loan request submitted successfully!",
      })

      // Refresh data and close form
      setTimeout(() => {
        refreshData()
        setShowRequestForm(false)
        setLoanRequest({ groupId: "", amount: "", purpose: "", repaymentPlan: "" })
      }, 2000)
    } catch (err) {
      console.error("Failed to request loan:", err)
    }
  }

  // Handle loan repayment
  const handleRepayLoan = async (loanId: string, amount: number) => {
    try {
      const result = await repayLoan(loanId, amount)

      setTransactionSuccess({
        digest: result.digest,
        message: "Loan payment processed successfully!",
      })

      // Refresh data
      setTimeout(() => {
        refreshData()
      }, 2000)
    } catch (err) {
      console.error("Failed to repay loan:", err)
    }
  }

  // Get eligible groups for loans
  const eligibleGroups = userGroups.filter((group) => {
    // Check if user doesn't have an active loan in this group
    const hasActiveLoan = userLoans.some((loan) => loan.groupId === group.id && loan.status === "active")
    return !hasActiveLoan
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
              <p className="text-gray-600">Manage your loan requests and repayments</p>
            </div>
            <Button onClick={() => setShowRequestForm(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Request Loan
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Transaction Status */}
        {(isLoading || error || transactionSuccess) && (
          <div className="mb-6">
            <TransactionStatus
              isLoading={isLoading}
              error={error}
              success={transactionSuccess ?? undefined}
              onClose={() => setTransactionSuccess(null)}
            />
          </div>
        )}

        {/* Loan Request Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Request a Loan</CardTitle>
                <CardDescription>Submit a loan request to one of your groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Group</Label>
                  <Select
                    value={loanRequest.groupId}
                    onValueChange={(value) => setLoanRequest((prev) => ({ ...prev, groupId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} (Max:{" "}
                          {((group.minContribution * group.loanRatio) / 100 / 1_000_000_000).toFixed(2)} SUI)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Loan Amount (SUI)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={loanRequest.amount}
                    onChange={(e) => setLoanRequest((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Textarea
                    placeholder="Explain why you need this loan..."
                    value={loanRequest.purpose}
                    onChange={(e) => setLoanRequest((prev) => ({ ...prev, purpose: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Repayment Plan</Label>
                  <Textarea
                    placeholder="Describe how you plan to repay..."
                    value={loanRequest.repaymentPlan}
                    onChange={(e) => setLoanRequest((prev) => ({ ...prev, repaymentPlan: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={handleLoanRequest}
                    disabled={!loanRequest.groupId || !loanRequest.amount || !loanRequest.purpose || isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Loans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          </TabsList>

          {/* Tab content would be similar to your existing code, but using real data */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userLoans.filter((loan) => loan.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(
                      userLoans.filter((loan) => loan.status === "active").reduce((sum, loan) => sum + loan.amount, 0) /
                      1_000_000_000
                    ).toFixed(2)}{" "}
                    SUI remaining
                  </p>
                </CardContent>
              </Card>

              {/* Other stats cards... */}
            </div>

            {/* Active Loan Summary */}
            {userLoans.filter((loan) => loan.status === "active").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span>Current Loan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userLoans
                    .filter((loan) => loan.status === "active")
                    .map((loan) => (
                      <div key={loan.id} className="space-y-4">
                        {/* Loan details... */}
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleRepayLoan(loan.id, loan.amount)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Processing..." : "Make Payment"}
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Other tab contents... */}
        </Tabs>
      </div>
    </div>
  )
}
