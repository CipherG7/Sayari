"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Users, PiggyBank, Search, Filter, MapPin, Calendar, Shield, Coins } from "lucide-react"
import Link from "next/link"
import { useBlockchainData } from "../../hooks/use-blockchain-data"
import { useBlockchain } from "../../hooks/use-blockchain"
import { TransactionStatus } from "../../components/transaction-status"

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const { groups, isLoading: isLoadingGroups, refreshData } = useBlockchainData()
  const { joinGroup, isLoading: isJoining, error: joinError } = useBlockchain()
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null)
  const [joinSuccess, setJoinSuccess] = useState<{ digest: string } | null>(null)

  // Filter groups based on search and category
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterBy === "all" || group.category === filterBy
    return matchesSearch && matchesFilter
  })

  const handleJoinGroup = async (groupId: string) => {
    setJoiningGroupId(groupId)
    try {
      const result = await joinGroup(groupId)
      setJoinSuccess({
        digest: result.digest,
      })
      // Refresh data after joining
      setTimeout(() => {
        refreshData()
      }, 2000)
    } catch (err) {
      console.error("Failed to join group:", err)
    } finally {
      setJoiningGroupId(null)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      professional: "bg-orange-100 text-orange-800",
      business: "bg-green-100 text-green-800",
      community: "bg-purple-100 text-purple-800",
      creative: "bg-red-100 text-red-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Coins className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Savings Groups</h1>
                <p className="text-gray-600">Discover and join community-driven savings circles</p>
              </div>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700" asChild>
              <Link href="/groups/create">Create New Group</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Transaction Status */}
        {(isJoining || joinError || joinSuccess) && (
          <div className="mb-6">
            <TransactionStatus
              isLoading={isJoining}
              error={joinError}
              success={joinSuccess ?? undefined}
              onClose={() => setJoinSuccess(null)}
            />
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search groups by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoadingGroups && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading groups...</p>
          </div>
        )}

        {/* Groups Grid */}
        {!isLoadingGroups && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(group.category)}>{group.category}</Badge>
                    {group.kycRequired && (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>KYC</span>
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        {group.memberCount}/{group.maxMembers} members
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PiggyBank className="h-4 w-4 text-gray-500" />
                      <span>{(group.totalBalance / 1_000_000_000).toFixed(2)} SUI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{group.location || "Global"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min. Contribution:</span>
                      <span className="font-semibold">{(group.minContribution / 1_000_000_000).toFixed(2)} SUI</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Loan Ratio:</span>
                      <span className="font-semibold">{group.loanRatio}%</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700" asChild>
                      <Link href={`/groups/${group.id}`}>View Details</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={isJoining && joiningGroupId === group.id}
                    >
                      {isJoining && joiningGroupId === group.id ? "Joining..." : "Join Group"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingGroups && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or create a new group</p>
            <Button className="bg-orange-600 hover:bg-orange-700" asChild>
              <Link href="/groups/create">Create New Group</Link>
            </Button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{groups.length}</div>
              <div className="text-gray-600">Active Groups</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {groups.reduce((sum, group) => sum + group.memberCount, 0)}
              </div>
              <div className="text-gray-600">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(groups.reduce((sum, group) => sum + group.totalBalance, 0) / 1_000_000_000).toFixed(2)} SUI
              </div>
              <div className="text-gray-600">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
