"use client"

import { useState, useCallback } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { BlockchainService } from "../lib/blockchain-utils"
import { SuiTransactionBuilder } from "../lib/sui-client"

export function useBlockchain() {
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeTransaction = useCallback(
    async (txb: SuiTransactionBuilder) => {
      if (!currentAccount || !signAndExecuteTransactionBlock) {
        throw new Error("Wallet not connected")
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await BlockchainService.executeTransaction(txb, currentAccount, signAndExecuteTransactionBlock)

        if (!result.success) {
          throw new Error(result.error)
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Transaction failed"
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentAccount, signAndExecuteTransactionBlock],
  )

  // Create a new group
  const createGroup = useCallback(
    async (params: {
      name: string
      description: string
      minContribution: number
      maxMembers: number
      loanRatio: number
      kycRequired: boolean
    }) => {
      const txb = new SuiTransactionBuilder().createGroup(params)
      return executeTransaction(txb)
    },
    [executeTransaction],
  )

  // Join a group
  const joinGroup = useCallback(
    async (groupId: string) => {
      const txb = new SuiTransactionBuilder().joinGroup(groupId)
      return executeTransaction(txb)
    },
    [executeTransaction],
  )

  // Make a contribution
  const makeContribution = useCallback(
    async (groupId: string, amount: number) => {
      if (!currentAccount) throw new Error("Wallet not connected")

      // Get user's coins
      const coins = await BlockchainService.getUserCoins(currentAccount.address)
      if (coins.length === 0) {
        throw new Error("No coins available")
      }

      // Use the first available coin
      const coinObjectId = coins[0].coinObjectId
      const txb = new SuiTransactionBuilder().makeContribution(groupId, amount, coinObjectId)
      return executeTransaction(txb)
    },
    [executeTransaction, currentAccount],
  )

  // Request a loan
  const requestLoan = useCallback(
    async (params: { groupId: string; amount: number; purpose: string; repaymentPlan: string }) => {
      const txb = new SuiTransactionBuilder().requestLoan(params)
      return executeTransaction(txb)
    },
    [executeTransaction],
  )

  // Vote on a proposal
  const voteOnProposal = useCallback(
    async (proposalId: string, vote: boolean) => {
      const txb = new SuiTransactionBuilder().voteOnProposal(proposalId, vote)
      return executeTransaction(txb)
    },
    [executeTransaction],
  )

  // Repay a loan
  const repayLoan = useCallback(
    async (loanId: string, amount: number) => {
      if (!currentAccount) throw new Error("Wallet not connected")

      const coins = await BlockchainService.getUserCoins(currentAccount.address)
      if (coins.length === 0) {
        throw new Error("No coins available")
      }

      const coinObjectId = coins[0].coinObjectId
      const txb = new SuiTransactionBuilder().repayLoan(loanId, amount, coinObjectId)
      return executeTransaction(txb)
    },
    [executeTransaction, currentAccount],
  )

  return {
    isLoading,
    error,
    createGroup,
    joinGroup,
    makeContribution,
    requestLoan,
    voteOnProposal,
    repayLoan,
  }
}
