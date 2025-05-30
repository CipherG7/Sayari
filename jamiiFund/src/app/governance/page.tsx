"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"
import { Alert, AlertDescription } from "../../components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Minus,
  UserCheck,
  Settings,
  Zap,
  DollarSign,
  UserX,
} from "lucide-react"

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState("proposals")
  const [showCreateProposal, setShowCreateProposal] = useState(false)
  const [, setSelectedProposal] = useState<unknown>(null)

  const [newProposal, setNewProposal] = useState({
    groupId: "",
    title: "",
    description: "",
    type: "",
    targetMember: "",
    amount: "",
    newValue: "",
    rationale: "",
  })

  // Mock data
  const userVotingPower = {
    basePower: 100,
    contributionBonus: 45,
    reputationBonus: 25,
    tenureBonus: 15,
    totalPower: 185,
    delegatedPower: 0,
    isDelegating: false,
    delegateTo: null,
  }

  const activeProposals = [
    {
      id: "prop_001",
      title: "Loan Request - Alice Johnson",
      description: "Request for $1,500 loan for business expansion",
      type: "loan",
      proposer: "0x123...abc",
      targetMember: "Alice Johnson",
      amount: 1500,
      votesFor: 850,
      votesAgainst: 320,
      votesAbstain: 45,
      totalVotes: 1215,
      requiredThreshold: 51,
      participationRate: 68,
      votingDeadline: "2024-01-20T18:00:00Z",
      executionDeadline: "2024-01-22T18:00:00Z",
      status: "active",
      groupName: "Tech Professionals Savings",
      hasVoted: false,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "prop_002",
      title: "Increase Minimum Contribution",
      description: "Proposal to increase minimum monthly contribution from $100 to $150",
      type: "rule_change",
      proposer: "0x456...def",
      newValue: 150,
      votesFor: 1200,
      votesAgainst: 800,
      votesAbstain: 100,
      totalVotes: 2100,
      requiredThreshold: 67,
      participationRate: 85,
      votingDeadline: "2024-01-18T12:00:00Z",
      executionDeadline: "2024-01-20T12:00:00Z",
      status: "active",
      groupName: "Small Business Fund",
      hasVoted: true,
      userVote: "for",
      createdAt: "2024-01-12T14:30:00Z",
    },
    {
      id: "prop_003",
      title: "Emergency Fund Allocation",
      description: "Allocate $5,000 from group funds for member emergency assistance",
      type: "emergency",
      proposer: "0x789...ghi",
      amount: 5000,
      votesFor: 1800,
      votesAgainst: 200,
      votesAbstain: 50,
      totalVotes: 2050,
      requiredThreshold: 67,
      participationRate: 92,
      votingDeadline: "2024-01-17T20:00:00Z",
      executionDeadline: "2024-01-19T20:00:00Z",
      status: "passing",
      groupName: "Community Development",
      hasVoted: false,
      createdAt: "2024-01-16T09:15:00Z",
    },
  ]

  const proposalHistory = [
    {
      id: "prop_h001",
      title: "Loan Request - Bob Smith",
      type: "loan",
      amount: 800,
      finalVotesFor: 1200,
      finalVotesAgainst: 300,
      participationRate: 75,
      status: "executed",
      success: true,
      executedAt: "2024-01-10T15:30:00Z",
      groupName: "Tech Professionals Savings",
    },
    {
      id: "prop_h002",
      title: "Remove Inactive Member",
      type: "member_removal",
      targetMember: "John Doe",
      finalVotesFor: 800,
      finalVotesAgainst: 1200,
      participationRate: 80,
      status: "executed",
      success: false,
      executedAt: "2024-01-08T11:00:00Z",
      groupName: "Small Business Fund",
    },
  ]

  const delegationInfo = {
    totalDelegatedToMe: 340,
    delegators: [
      { address: "0xabc...123", power: 120, delegatedAt: "2024-01-10" },
      { address: "0xdef...456", power: 220, delegatedAt: "2024-01-12" },
    ],
  }

  const proposalTypes = [
    { value: "loan", label: "Loan Request", icon: <DollarSign className="h-4 w-4" /> },
    { value: "rule_change", label: "Rule Change", icon: <Settings className="h-4 w-4" /> },
    { value: "emergency", label: "Emergency Action", icon: <Zap className="h-4 w-4" /> },
    { value: "member_removal", label: "Member Removal", icon: <UserX className="h-4 w-4" /> },
    { value: "exit", label: "Member Exit", icon: <UserCheck className="h-4 w-4" /> },
  ]

  const getProposalTypeIcon = (type: string) => {
    const typeMap = {
      loan: <DollarSign className="h-4 w-4" />,
      rule_change: <Settings className="h-4 w-4" />,
      emergency: <Zap className="h-4 w-4" />,
      member_removal: <UserX className="h-4 w-4" />,
      exit: <UserCheck className="h-4 w-4" />,
    }
    return typeMap[type as keyof typeof typeMap] || <Vote className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-blue-100 text-blue-800",
      passing: "bg-green-100 text-green-800",
      failing: "bg-red-100 text-red-800",
      executed: "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getVoteIcon = (vote: string) => {
    if (vote === "for") return <ThumbsUp className="h-4 w-4 text-green-600" />
    if (vote === "against") return <ThumbsDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const handleCreateProposal = () => {
    console.log("Creating proposal:", newProposal)
    setShowCreateProposal(false)
    setNewProposal({
      groupId: "",
      title: "",
      description: "",
      type: "",
      targetMember: "",
      amount: "",
      newValue: "",
      rationale: "",
    })
  }

  const handleVote = (proposalId: string, vote: string) => {
    console.log("Voting:", proposalId, vote)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Vote className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
                <p className="text-gray-600">Participate in democratic decision-making for your groups</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateProposal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Voting Power Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Your Voting Power</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{userVotingPower.totalPower}</div>
                  <div className="text-gray-600">Total Voting Power</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Power:</span>
                    <span className="font-medium">{userVotingPower.basePower}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contribution Bonus:</span>
                    <span className="font-medium text-green-600">+{userVotingPower.contributionBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reputation Bonus:</span>
                    <span className="font-medium text-blue-600">+{userVotingPower.reputationBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenure Bonus:</span>
                    <span className="font-medium text-purple-600">+{userVotingPower.tenureBonus}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delegation Status</h4>
                  {userVotingPower.isDelegating ? (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        You have delegated your voting power to{" "}
                        <span className="font-medium">{userVotingPower.delegateTo}</span>
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Revoke Delegation
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">You can delegate your voting power to another member</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Delegate Power
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delegate Voting Power</DialogTitle>
                            <DialogDescription>Choose a trusted member to vote on your behalf</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Delegate Address</Label>
                              <Input placeholder="0x..." />
                            </div>
                            <Button className="w-full">Delegate Power</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
                {delegationInfo.totalDelegatedToMe > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Delegated to You</h4>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        +{delegationInfo.totalDelegatedToMe} delegated power
                      </p>
                      <p className="text-xs text-green-600">From {delegationInfo.delegators.length} member(s)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
            <TabsTrigger value="history">Proposal History</TabsTrigger>
            <TabsTrigger value="delegation">Delegation</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-6">
            {activeProposals.length > 0 ? (
              <div className="space-y-6">
                {activeProposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">{getProposalTypeIcon(proposal.type)}</div>
                          <div>
                            <CardTitle className="text-lg">{proposal.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {proposal.groupName} • Proposed by {proposal.proposer.slice(0, 10)}...
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                          {proposal.hasVoted && (
                            <Badge variant="outline" className="flex items-center space-x-1">
                              {getVoteIcon(proposal.userVote || "")}
                              <span>Voted</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{proposal.description}</p>

                      {proposal.amount && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Amount: ${proposal.amount.toLocaleString()}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Votes For: {proposal.votesFor}</span>
                          <span>Votes Against: {proposal.votesAgainst}</span>
                          <span>Abstain: {proposal.votesAbstain}</span>
                        </div>
                        <Progress
                          value={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>
                            {((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}% approval •{" "}
                            {proposal.participationRate}% participation
                          </span>
                          <span>Requires {proposal.requiredThreshold}% to pass</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Voting ends: {new Date(proposal.votingDeadline).toLocaleDateString()} at{" "}
                            {new Date(proposal.votingDeadline).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedProposal(proposal)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{proposal.title}</DialogTitle>
                                <DialogDescription>Proposal Details</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-sm text-gray-700">{proposal.description}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Type:</span>
                                    <span className="ml-2 font-medium capitalize">
                                      {proposal.type.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Group:</span>
                                    <span className="ml-2 font-medium">{proposal.groupName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Created:</span>
                                    <span className="ml-2 font-medium">
                                      {new Date(proposal.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Proposer:</span>
                                    <span className="ml-2 font-medium">{proposal.proposer}</span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {!proposal.hasVoted && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleVote(proposal.id, "for")}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                For
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVote(proposal.id, "against")}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Against
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleVote(proposal.id, "abstain")}>
                                <Minus className="h-4 w-4 mr-1" />
                                Abstain
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Proposals</h3>
                  <p className="text-gray-600 mb-4">There are currently no proposals to vote on</p>
                  <Button onClick={() => setShowCreateProposal(true)}>Create First Proposal</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposal History</CardTitle>
                <CardDescription>Past proposals and their outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposalHistory.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {proposal.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{proposal.title}</p>
                          <p className="text-sm text-gray-600">
                            {proposal.groupName} • {new Date(proposal.executedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={proposal.success ? "default" : "secondary"}>
                          {proposal.success ? "Passed" : "Failed"}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {proposal.finalVotesFor} for, {proposal.finalVotesAgainst} against
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delegation" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delegated to You</CardTitle>
                  <CardDescription>Members who have delegated their voting power to you</CardDescription>
                </CardHeader>
                <CardContent>
                  {delegationInfo.delegators.length > 0 ? (
                    <div className="space-y-3">
                      {delegationInfo.delegators.map((delegator, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{delegator.address}</p>
                            <p className="text-sm text-gray-600">
                              Delegated: {new Date(delegator.delegatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-orange-600">{delegator.power}</p>
                            <p className="text-xs text-gray-600">voting power</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total Delegated Power:</span>
                          <span className="text-orange-600">{delegationInfo.totalDelegatedToMe}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No one has delegated voting power to you yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delegation Settings</CardTitle>
                  <CardDescription>Manage your voting power delegation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      When you delegate your voting power, the delegate can vote on your behalf for all proposals. You
                      can revoke delegation at any time.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Label>Delegate to Member</Label>
                    <Input placeholder="Enter member address (0x...)" />
                    <Button className="w-full">Delegate Voting Power</Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Delegation Benefits</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ensure your voice is heard even when you are unavailable</li>
                      <li>• Delegate to members with expertise in specific areas</li>
                      <li>• Maintain participation in governance decisions</li>
                      <li>• Can be revoked at any time</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Proposal Modal */}
        {showCreateProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Proposal</CardTitle>
                <CardDescription>Submit a proposal for group voting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Select
                      value={newProposal.groupId}
                      onValueChange={(value) => setNewProposal((prev) => ({ ...prev, groupId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group1">Tech Professionals Savings</SelectItem>
                        <SelectItem value="group2">Small Business Fund</SelectItem>
                        <SelectItem value="group3">Community Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Proposal Type</Label>
                    <Select
                      value={newProposal.type}
                      onValueChange={(value) => setNewProposal((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {proposalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Brief, descriptive title for your proposal"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Detailed description of your proposal..."
                    value={newProposal.description}
                    onChange={(e) => setNewProposal((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                {(newProposal.type === "loan" || newProposal.type === "emergency") && (
                  <div className="space-y-2">
                    <Label>Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={newProposal.amount}
                      onChange={(e) => setNewProposal((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                )}

                {newProposal.type === "member_removal" && (
                  <div className="space-y-2">
                    <Label>Target Member</Label>
                    <Input
                      placeholder="Member address to remove"
                      value={newProposal.targetMember}
                      onChange={(e) => setNewProposal((prev) => ({ ...prev, targetMember: e.target.value }))}
                    />
                  </div>
                )}

                {newProposal.type === "rule_change" && (
                  <div className="space-y-2">
                    <Label>New Value</Label>
                    <Input
                      placeholder="New value for the rule change"
                      value={newProposal.newValue}
                      onChange={(e) => setNewProposal((prev) => ({ ...prev, newValue: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Rationale</Label>
                  <Textarea
                    placeholder="Explain why this proposal should be approved..."
                    value={newProposal.rationale}
                    onChange={(e) => setNewProposal((prev) => ({ ...prev, rationale: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    A deposit of 10 SUI is required to create a proposal. This will be returned if the proposal receives
                    sufficient participation.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreateProposal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreateProposal}
                    disabled={!newProposal.title || !newProposal.description || !newProposal.type}
                  >
                    Create Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
