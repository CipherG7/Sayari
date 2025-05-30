"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Textarea } from "../../components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Shield, Users, AlertTriangle, CheckCircle, Flag, Search, MoreHorizontal, Ban, UserX } from "lucide-react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [flagReason, setFlagReason] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Mock data
  const stats = {
    totalUsers: 1234,
    verifiedUsers: 987,
    flaggedUsers: 23,
    pendingVerifications: 45,
  }

  const verifiedUsers = [
    {
      address: "0x123...abc",
      contact: "+1 (555) 123-4567",
      contactType: 1,
      verifiedAt: "2024-01-15",
      reputation: 85,
      isFlagged: false,
      badgeId: "badge_001",
    },
    {
      address: "0x456...def",
      contact: "user@example.com",
      contactType: 2,
      verifiedAt: "2024-01-14",
      reputation: 92,
      isFlagged: false,
      badgeId: "badge_002",
    },
    {
      address: "0x789...ghi",
      contact: "+1 (555) 987-6543",
      contactType: 1,
      verifiedAt: "2024-01-13",
      reputation: 45,
      isFlagged: true,
      badgeId: "badge_003",
    },
  ]

  const flaggedUsers = [
    {
      address: "0x789...ghi",
      reason: "Multiple loan defaults",
      flaggedAt: "2024-01-12",
      flaggedBy: "0xadmin...123",
      loanDefaults: 3,
      reputation: 45,
    },
    {
      address: "0xabc...123",
      reason: "Suspicious activity",
      flaggedAt: "2024-01-10",
      flaggedBy: "0xadmin...123",
      loanDefaults: 1,
      reputation: 30,
    },
  ]

  const pendingVerifications = [
    {
      contact: "+1 (555) 111-2222",
      contactType: 1,
      userAddress: "0xnew...user1",
      requestedAt: "2024-01-16",
      expiresAt: "2024-01-16",
    },
    {
      contact: "newuser@example.com",
      contactType: 2,
      userAddress: "0xnew...user2",
      requestedAt: "2024-01-16",
      expiresAt: "2024-01-16",
    },
  ]

  const handleFlagUser = async (userAddress: string) => {
    // Simulate flagging user
    console.log("Flagging user:", userAddress, "Reason:", flagReason)
    setFlagReason("")
    setSelectedUser(null)
  }

  const handleRevokeBadge = async (userAddress: string) => {
    // Simulate badge revocation
    console.log("Revoking badge for:", userAddress)
    setSelectedUser(null)
  }

  const getContactTypeLabel = (type: number) => {
    return type === 1 ? "Phone" : "Email"
  }

  const getReputationColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Administration</h1>
              <p className="text-gray-600">Manage user verification and compliance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1)}% verification rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Users</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.flaggedUsers}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="verified">Verified Users</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Users</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">User verified</p>
                        <p className="text-sm text-gray-600">0x456...def completed KYC</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Flag className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">User flagged</p>
                        <p className="text-sm text-gray-600">0x789...ghi flagged for defaults</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Verification requested</p>
                        <p className="text-sm text-gray-600">0xnew...user1 requested phone verification</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Flag className="h-4 w-4 mr-2" />
                    Review Flagged Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Process Pending Verifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verified" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Verified Users</CardTitle>
                    <CardDescription>Users with active KYC badges</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Address</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Reputation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifiedUsers.map((user) => (
                      <TableRow key={user.address}>
                        <TableCell className="font-mono">{formatAddress(user.address)}</TableCell>
                        <TableCell>{user.contact}</TableCell>
                        <TableCell>{getContactTypeLabel(user.contactType)}</TableCell>
                        <TableCell>{new Date(user.verifiedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={getReputationColor(user.reputation)}>{user.reputation}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isFlagged ? "destructive" : "secondary"}>
                            {user.isFlagged ? "Flagged" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>User Actions</DialogTitle>
                                <DialogDescription>Manage user {formatAddress(user.address)}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {!user.isFlagged && (
                                  <div className="space-y-2">
                                    <Label>Flag User</Label>
                                    <Textarea
                                      placeholder="Reason for flagging..."
                                      value={flagReason}
                                      onChange={(e) => setFlagReason(e.target.value)}
                                    />
                                    <Button
                                      variant="destructive"
                                      className="w-full"
                                      onClick={() => handleFlagUser(user.address)}
                                      disabled={!flagReason}
                                    >
                                      <Flag className="h-4 w-4 mr-2" />
                                      Flag User
                                    </Button>
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleRevokeBadge(user.address)}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Revoke Badge
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Users</CardTitle>
                <CardDescription>Users requiring administrative attention</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Address</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Flagged Date</TableHead>
                      <TableHead>Defaults</TableHead>
                      <TableHead>Reputation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedUsers.map((user) => (
                      <TableRow key={user.address}>
                        <TableCell className="font-mono">{formatAddress(user.address)}</TableCell>
                        <TableCell>{user.reason}</TableCell>
                        <TableCell>{new Date(user.flaggedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{user.loanDefaults}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getReputationColor(user.reputation)}>{user.reputation}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                            <Button variant="destructive" size="sm">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>Users awaiting verification completion</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Address</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVerifications.map((verification, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{formatAddress(verification.userAddress)}</TableCell>
                        <TableCell>{verification.contact}</TableCell>
                        <TableCell>{getContactTypeLabel(verification.contactType)}</TableCell>
                        <TableCell>{new Date(verification.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(verification.expiresAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
