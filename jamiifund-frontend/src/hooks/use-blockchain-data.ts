"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { BlockchainService, type Group, type Loan } from "../lib/blockchain-utils"

export function useBlockchainData() {
  const currentAccount = useCurrentAccount()
  const [groups, setGroups] = useState<Group[]>([])
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [userLoans, setUserLoans] = useState<Loan[]>([])
  const [userBalance, setUserBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    try {
      const allGroups = await BlockchainService.getAllGroups()
      setGroups(allGroups)
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    }
  }, [])

  // Fetch user-specific data
  const fetchUserData = useCallback(async () => {
    if (!currentAccount?.address) return

    setIsLoading(true)
    try {
      const [balance, userGroupsData, userLoansData] = await Promise.all([
        BlockchainService.getUserBalance(currentAccount.address),
        BlockchainService.getUserGroups(currentAccount.address),
        BlockchainService.getUserLoans(currentAccount.address),
      ])

      setUserBalance(balance)
      setUserGroups(userGroupsData)
      setUserLoans(userLoansData)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentAccount?.address])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchGroups(), fetchUserData()])
  }, [fetchGroups, fetchUserData])

  // Initial data fetch
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  return {
    groups,
    userGroups,
    userLoans,
    userBalance,
    isLoading,
    refreshData,
    fetchGroups,
    fetchUserData,
  }
}
