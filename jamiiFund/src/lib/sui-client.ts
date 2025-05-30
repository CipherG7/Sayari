import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client"
import { TransactionBlock } from "@mysten/sui.js/transactions"

// Initialize Sui client
export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"), // Change to 'mainnet' for production
})

// Package and module constants (replace with your actual deployed contract addresses)
export const PACKAGE_ID = "0xfd47f4a88ed7a1ca7c82e72986ba1637da889d1330351ba8832f311284c4cb4c" // Your deployed package ID
export const MODULE_NAME = "jamiifund"

// Object IDs for shared objects
export const SHARED_OBJECTS = {
  REGISTRY: "0x4947d5d6d7c6cd338491732b163a55fb29f099ba69b819a99f99e3b76e37cab3", // Registry object ID
  ADMIN_CAP: "0x5c65ed84ec5ad2fcce9560cbe350c1fdfb37c40c9ca07a87646cd2749a2d2b34", // Admin capability object ID
}

// Transaction builder helper
export class SuiTransactionBuilder {
  private txb: TransactionBlock

  constructor() {
    this.txb = new TransactionBlock()
  }

  // Create a new savings group
  createGroup(params: {
    name: string
    description: string
    minContribution: number
    maxMembers: number
    loanRatio: number
    kycRequired: boolean
  }) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_group`,
      arguments: [
        this.txb.pure(params.name),
        this.txb.pure(params.description),
        this.txb.pure(params.minContribution),
        this.txb.pure(params.maxMembers),
        this.txb.pure(params.loanRatio),
        this.txb.pure(params.kycRequired),
        this.txb.object(SHARED_OBJECTS.REGISTRY),
      ],
    })
    return this
  }

  // Join an existing group
  joinGroup(groupId: string) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::join_group`,
      arguments: [this.txb.object(groupId), this.txb.object(SHARED_OBJECTS.REGISTRY)],
    })
    return this
  }

  // Make a contribution to a group
  makeContribution(groupId: string, amount: number, coinObjectId: string) {
    const coin = this.txb.object(coinObjectId)
    const splitCoin = this.txb.splitCoins(coin, [this.txb.pure(amount)])

    this.txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::make_contribution`,
      arguments: [this.txb.object(groupId), splitCoin],
    })
    return this
  }

  // Request a loan
  requestLoan(params: { groupId: string; amount: number; purpose: string; repaymentPlan: string }) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::request_loan`,
      arguments: [
        this.txb.object(params.groupId),
        this.txb.pure(params.amount),
        this.txb.pure(params.purpose),
        this.txb.pure(params.repaymentPlan),
      ],
    })
    return this
  }

  // Vote on a proposal
  voteOnProposal(proposalId: string, vote: boolean) {
    this.txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::vote_on_proposal`,
      arguments: [this.txb.object(proposalId), this.txb.pure(vote)],
    })
    return this
  }

  // Repay a loan
  repayLoan(loanId: string, amount: number, coinObjectId: string) {
    const coin = this.txb.object(coinObjectId)
    const splitCoin = this.txb.splitCoins(coin, [this.txb.pure(amount)])

    this.txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::repay_loan`,
      arguments: [this.txb.object(loanId), splitCoin],
    })
    return this
  }

  // Get the transaction block
  getTransactionBlock() {
    return this.txb
  }
}
