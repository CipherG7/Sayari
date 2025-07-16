# SAYARI

**Sayari** is a decentralized community savings and micro-lending platform built on the Sui blockchain. Inspired by African traditions of communal support, Sayari enables members to contribute funds, access loans, and build wealth transparently and securely.

## Problem Statement
Many informal savings groups (popularly known as Chamas) in Africa face:

* Mismanagement of funds
* Lack of trust
* Loan defaults with no recourse
* No transparency in contributions or voting

Sayari solves these challenges using smart contracts, automated governance, and on-chain transparency.

## Our Solution
Sayari provides:

**On-chain Contribution Tracking** – no more paper records
**Trustless Loans** – governed by smart contract rules
**KYC for Accountability** – ensures members are traceable if they default
**Democratic Governance** – decisions via proposals and voting
**Exit Mechanism** – members can leave and reclaim their fair contributions


## SDLC: Software Development Life Cycle

### 1. **Requirement Analysis**

* Users: Community members, admins
* Features: Register, contribute, request loans, vote, exit
* Non-functional: Secure, low gas, scalable, KYC=enabled

### 2. **System Design**

* Smart Contracts (Move on Sui)
* Frontend (React + Tailwind)
* Backend/Storage (Optional IPFS for docs)
* Wallet Integration (Slush/Sui Wallet)

### 3. **Implementation Plan**

* Phase 1: Smart contract – member management, contributions
* Phase 2: Loan logic, voting, proposal system
* Phase 3: UI – onboarding, dashboards, loan requests, voting
* Phase 4: Integrate KYC and off-chain metadata

### 4. **Testing**

* Unit testing smart contracts
* Integration tests for frontend-backend
* Simulated testnet launch

### 5. **Deployment**

* Deploy on Sui mainnet/testnet
* Launch with test Chama groups

### 6. **Maintenance**

* Add analytics
* Enable governance upgrade system (e.g. via DAO module)


## Features

| Feature             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| Member Registration | With optional KYC for fraud prevention                 |
| Contributions       | Tracked on-chain by timestamp and amount               |
| Loans               | Only eligible after X months & contribution thresholds |
| Voting              | For group proposals: loans, exits, rule changes        |
| Member Exit         | Fair refund of funds, post-loan clearance              |
| Transparency        | View all transactions on-chain                         |


## Member Exit Policy

* Must have **no active loans**
* Gets refunded based on contributions (exact or % of pool)
* Once exited:
  * No more voting/borrowing
  * Marked inactive in the contract
* Optional: Governance vote for exits over a threshold

## Name Meaning

> **"Sayari"** = *Universe* in Swahili. It represents the power of people coming together to save, lend, and grow.


## Built With

* **Sui Blockchain** – fast and scalable Layer 1
* **Move** – secure smart contract language
* **React & Tailwind CSS** – modern frontend stack
* **Sui Wallet** – for secure interaction

## Future Features

* KYC integration with ID verification APIs
* Analytics dashboard
* Multi-language & multi-community support
* Mobile-first UI


Sayari – Built for Africa. Powered by community. Secured by Sui blockchain.
