import { suiClient, type SuiTransactionBuilder } from "./sui-client"
import type { WalletAccount } from '@mysten/wallet-standard';


// Remove the problematic import and define the type locally
interface SuiSignAndExecuteTransactionBlockInput {
  transactionBlock: any
  account: WalletAccount
  chain: string
}

// Types for our application
export interface Group {
  category: string;
  location: string;
  id: string
  name: string
  description: string
  creator: string
  memberCount: number
  maxMembers: number
  totalBalance: number
  minContribution: number
  loanRatio: number
  kycRequired: boolean
  isActive: boolean
  createdAt: number
}

export interface Contribution {
  id: string
  groupId: string
  contributor: string
  amount: number
  timestamp: number
}

export interface Loan {
  id: string
  groupId: string
  borrower: string
  amount: number
  purpose: string
  status: "pending" | "approved" | "active" | "repaid" | "defaulted"
  createdAt: number
  dueDate?: number
}

export interface Proposal {
  id: string
  groupId: string
  proposer: string
  proposalType: "loan" | "rule_change" | "member_removal" | "emergency"
  description: string
  votesFor: number
  votesAgainst: number
  status: "active" | "passed" | "failed" | "executed"
  deadline: number
}

// Utility functions for blockchain interactions
export class BlockchainService {
  // Execute a transaction with proper error handling
  static async executeTransaction(
    txb: SuiTransactionBuilder,
    account: WalletAccount,
    signAndExecuteTransactionBlock: (input: SuiSignAndExecuteTransactionBlockInput) => Promise<any>,
  ) {
    try {
      const transactionBlock = txb.getTransactionBlock()

      // Set gas budget
      transactionBlock.setGasBudget(10000000) // 0.01 SUI

      const result = await signAndExecuteTransactionBlock({
        transactionBlock,
        account,
        chain: "sui:testnet",
      })

      // Wait for transaction to be confirmed
      const confirmedTx = await suiClient.waitForTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      })

      return {
        success: true,
        digest: result.digest,
        effects: confirmedTx.effects,
        events: confirmedTx.events,
        objectChanges: confirmedTx.objectChanges,
      }
    } catch (error) {
      console.error("Transaction failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Get user's coin objects for transactions
  static async getUserCoins(address: string, coinType = "0x2::sui::SUI") {
    try {
      const coins = await suiClient.getCoins({
        owner: address,
        coinType,
      })
      return coins.data
    } catch (error) {
      console.error("Failed to fetch coins:", error)
      return []
    }
  }

  // Get user's balance
  static async getUserBalance(address: string, coinType = "0x2::sui::SUI") {
    try {
      const balance = await suiClient.getBalance({
        owner: address,
        coinType,
      })
      return Number(balance.totalBalance)
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      return 0
    }
  }

  // Fetch all groups
  static async getAllGroups(): Promise<Group[]> {
    try {
      // This would query your smart contract for all groups
      // Implementation depends on your contract structure
      const response = await suiClient.getOwnedObjects({
        owner: "0x...", // Registry or shared object address
        filter: {
          StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::${process.env.NEXT_PUBLIC_MODULE_NAME}::Group`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      })

      // Parse and return groups
      return response.data.map((obj: any) => ({
        id: obj.data.objectId,
        name: obj.data.content.fields.name,
        description: obj.data.content.fields.description,
        creator: obj.data.content.fields.creator,
        memberCount: Number(obj.data.content.fields.member_count),
        maxMembers: Number(obj.data.content.fields.max_members),
        totalBalance: Number(obj.data.content.fields.total_balance),
        minContribution: Number(obj.data.content.fields.min_contribution),
        loanRatio: Number(obj.data.content.fields.loan_ratio),
        kycRequired: obj.data.content.fields.kyc_required,
        isActive: obj.data.content.fields.is_active,
        createdAt: Number(obj.data.content.fields.created_at),
        category: obj.data.content.fields.category ?? "",
        location: obj.data.content.fields.location ?? "",
      }))
    } catch (error) {
      console.error("Failed to fetch groups:", error)
      return []
    }
  }

  // Get user's groups
  static async getUserGroups(userAddress: string): Promise<Group[]> {
    try {
      // Query for groups where user is a member
      // Implementation depends on your contract structure
      const allGroups = await this.getAllGroups()
      // Filter groups where user is a member (you'd need to check membership in contract)
      return allGroups.filter((group) => {
        // This is a placeholder - you'd need to check actual membership
        return true
      })
    } catch (error) {
      console.error("Failed to fetch user groups:", error)
      return []
    }
  }

  // Get user's loans
  static async getUserLoans(userAddress: string): Promise<Loan[]> {
    try {
      const response = await suiClient.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::${process.env.NEXT_PUBLIC_MODULE_NAME}::Loan`,
        },
        options: {
          showContent: true,
        },
      })

      return response.data.map((obj: any) => ({
        id: obj.data.objectId,
        groupId: obj.data.content.fields.group_id,
        borrower: obj.data.content.fields.borrower,
        amount: Number(obj.data.content.fields.amount),
        purpose: obj.data.content.fields.purpose,
        status: obj.data.content.fields.status,
        createdAt: Number(obj.data.content.fields.created_at),
        dueDate: obj.data.content.fields.due_date ? Number(obj.data.content.fields.due_date) : undefined,
      }))
    } catch (error) {
      console.error("Failed to fetch user loans:", error)
      return []
    }
  }

  // Get active proposals for a group
  static async getGroupProposals(groupId: string): Promise<Proposal[]> {
    try {
      // Query proposals for the specific group
      // Implementation depends on your contract structure
      return []
    } catch (error) {
      console.error("Failed to fetch group proposals:", error)
      return []
    }
  }
}
