"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useBlockchainData } from "../../hooks/use-blockchain-data"
import { useCurrentAccount } from '@mysten/dapp-kit';
import type { WalletAccount } from '@mysten/wallet-standard';
import { formatAddress } from "@mysten/sui.js/utils"
import { PiggyBank, Users } from "../../components/icons" // Import PiggyBank and Users components

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const currentAccount: WalletAccount | null = useCurrentAccount();
  const { userGroups, userLoans, userBalance, isLoading, refreshData } = useBlockchainData()

  // Format SUI balance (convert from MIST)
  const formattedBalance = (userBalance / 1_000_000_000).toFixed(4)

  // Calculate total contributions
  const totalContributions = userGroups.reduce((sum, group) => {
    // This is a placeholder - you'd need to get actual user contributions per group
    return sum + 0 // Replace with actual contribution calculation
  }, 0)

  // Refresh data when wallet changes
  useEffect(() => {
    if (currentAccount?.address) {
      refreshData()
    }
  }, [currentAccount?.address, refreshData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back{currentAccount ? `, ${formatAddress(currentAccount.address)}` : ""}!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Balance: {formattedBalance} SUI
              </Badge>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your data...</p>
          </div>
        )}

        {/* Stats Overview */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(totalContributions / 1_000_000_000).toFixed(2)} SUI</div>
                <p className="text-xs text-muted-foreground">Across all groups</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userGroups.length}</div>
                <p className="text-xs text-muted-foreground">Across different communities</p>
              </CardContent>
            </Card>

            {/* Other stats cards... */}
          </div>
        )}

        {/* Main Content Tabs */}
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="groups">My Groups</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="votes">Pending Votes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview content... */}
            </TabsContent>

            <TabsContent value="groups" className="space-y-6">
              <div className="grid gap-6">
                {userGroups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>
                            {group.memberCount} members • {(group.totalBalance / 1_000_000_000).toFixed(2)} SUI total
                            balance
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{group.isActive ? "active" : "inactive"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>{/* Group details... */}</CardContent>
                  </Card>
                ))}

                {userGroups.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Yet</h3>
                      <p className="text-gray-600 mb-4">You haven't joined any savings groups yet</p>
                      <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                        {/* Link component needs to be imported */}
                        <a href="/groups">Browse Groups</a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Other tab contents... */}
          </Tabs>
        )}
      </div>
    </div>
  )
}
