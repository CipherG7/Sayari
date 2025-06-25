#[allow(unused_field)]
module jamiifund::core {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EMemberNotFound: u64 = 2;
    const EInsufficientBalance: u64 = 3;
    const ELoanAlreadyExists: u64 = 4;
    const ELoanNotFound: u64 = 5;
    const ENotEligibleForLoan: u64 = 6;
    const EProposalNotFound: u64 = 7;
    const EAlreadyVoted: u64 = 8;
    const EVotingPeriodEnded: u64 = 9;
    const EMemberHasActiveLoan: u64 = 10;
    const EInvalidAmount: u64 = 11;
    const EGroupNotFound: u64 = 12;

    // Constants
    const MIN_CONTRIBUTION_MONTHS: u64 = 3;
    const LOAN_DURATION_MS: u64 = 2592000000; // 30 days in milliseconds
    const PROPOSAL_VOTING_PERIOD_MS: u64 = 604800000; // 7 days in milliseconds
    const INTEREST_RATE_BASIS_POINTS: u64 = 500; // 5% interest rate

    // Structs
    public struct JamiiFund has key {
        id: UID,
        admin: address,
        groups: Table<ID, Group>,
        next_group_id: u64,
    }

    public struct Group has key, store {
        id: UID,
        name: String,
        admin: address,
        members: Table<address, Member>,
        total_balance: Balance<SUI>,
        member_count: u64,
        loans: Table<ID, Loan>,
        proposals: Table<ID, Proposal>,
        next_loan_id: u64,
        next_proposal_id: u64,
        min_contribution_amount: u64,
        loan_to_contribution_ratio: u64, // Basis points (e.g., 5000 = 50%)
        created_at: u64,
        is_active: bool,
    }

    public struct Member has store {
        address: address,
        total_contributions: u64,
        contribution_history: vector<Contribution>,
        first_contribution_time: u64,
        active_loan_id: Option<ID>,
        kyc_verified: bool,
        reputation_score: u64,
        is_active: bool,
        joined_at: u64,
    }

    public struct Contribution has store, copy, drop {
        amount: u64,
        timestamp: u64,
    }

    public struct Loan has key, store {
        id: UID,
        borrower: address,
        principal_amount: u64,
        interest_amount: u64,
        total_amount: u64,
        disbursed_at: u64,
        due_date: u64,
        is_repaid: bool,
        is_defaulted: bool,
        collateral_held: u64,
    }

    public struct Proposal has key, store {
        id: UID,
        proposer: address,
        proposal_type: u8, // 1: Loan, 2: Exit, 3: Rule Change, 4: Emergency
        target_member: Option<address>,
        amount: Option<u64>,
        description: String,
        votes_for: u64,
        votes_against: u64,
        voters: Table<address, bool>,
        created_at: u64,
        voting_deadline: u64,
        is_executed: bool,
        is_active: bool,
    }

    public struct GroupCap has key, store {
        id: UID,
        group_id: ID,
    }

    public struct MemberCap has key, store {
        id: UID,
        group_id: ID,
        member_address: address,
    }

    // Events
    public struct GroupCreated has copy, drop {
        group_id: ID,
        name: String,
        admin: address,
        timestamp: u64,
    }

    public struct MemberJoined has copy, drop {
        group_id: ID,
        member: address,
        timestamp: u64,
    }

    public struct ContributionMade has copy, drop {
        group_id: ID,
        member: address,
        amount: u64,
        timestamp: u64,
    }

    public struct LoanRequested has copy, drop {
        group_id: ID,
        loan_id: ID,
        borrower: address,
        amount: u64,
        timestamp: u64,
    }

    public struct LoanApproved has copy, drop {
        group_id: ID,
        loan_id: ID,
        borrower: address,
        amount: u64,
        timestamp: u64,
    }

    public struct LoanRepaid has copy, drop {
        group_id: ID,
        loan_id: ID,
        borrower: address,
        amount: u64,
        timestamp: u64,
    }

    public struct ProposalCreated has copy, drop {
        group_id: ID,
        proposal_id: ID,
        proposer: address,
        proposal_type: u8,
        timestamp: u64,
    }

    public struct VoteCast has copy, drop {
        group_id: ID,
        proposal_id: ID,
        voter: address,
        vote: bool,
        timestamp: u64,
    }

    public struct MemberExited has copy, drop {
        group_id: ID,
        member: address,
        refund_amount: u64,
        timestamp: u64,
    }

    // Initialize the JamiiFund platform
    public fun initialize(ctx: &mut TxContext) {
        let jamiifund = JamiiFund {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            groups: table::new(ctx),
            next_group_id: 1,
        };
        transfer::share_object(jamiifund);
    }

    // Create a new savings group
    public entry fun create_group(
        jamiifund: &mut JamiiFund,
        name: String,
        min_contribution_amount: u64,
        loan_to_contribution_ratio: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let group_uid = object::new(ctx);
        let group_id = object::uid_to_inner(&group_uid);
        
        let group = Group {
            id: group_uid,
            name,
            admin: sender,
            members: table::new(ctx),
            total_balance: balance::zero(),
            member_count: 0,
            loans: table::new(ctx),
            proposals: table::new(ctx),
            next_loan_id: 1,
            next_proposal_id: 1,
            min_contribution_amount,
            loan_to_contribution_ratio,
            created_at: clock::timestamp_ms(clock),
            is_active: true,
        };

        table::add(&mut jamiifund.groups, group_id, group);
        jamiifund.next_group_id = jamiifund.next_group_id + 1;

        // Issue group admin capability
        let group_cap = GroupCap {
            id: object::new(ctx),
            group_id,
        };

        transfer::public_transfer(group_cap, sender);

        event::emit(GroupCreated {
            group_id,
            name,
            admin: sender,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Join a savings group
    public entry fun join_group(
        jamiifund: &mut JamiiFund,
        group_id: ID,
        kyc_verified: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&jamiifund.groups, group_id), EGroupNotFound);
        
        let group = table::borrow_mut(&mut jamiifund.groups, group_id);
        let sender = tx_context::sender(ctx);
        
        assert!(!table::contains(&group.members, sender), EMemberNotFound);

        let member = Member {
            address: sender,
            total_contributions: 0,
            contribution_history: vector::empty(),
            first_contribution_time: 0,
            active_loan_id: option::none(),
            kyc_verified,
            reputation_score: 100, // Starting reputation
            is_active: true,
            joined_at: clock::timestamp_ms(clock),
        };

        table::add(&mut group.members, sender, member);
        group.member_count = group.member_count + 1;

        // Issue member capability
        let member_cap = MemberCap {
            id: object::new(ctx),
            group_id,
            member_address: sender,
        };

        transfer::public_transfer(member_cap, sender);

        event::emit(MemberJoined {
            group_id,
            member: sender,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Make a contribution to the group
    public entry fun contribute(
        jamiifund: &mut JamiiFund,
        group_id: ID,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&jamiifund.groups, group_id), EGroupNotFound);
        
        let group = table::borrow_mut(&mut jamiifund.groups, group_id);
        let sender = tx_context::sender(ctx);
        let amount = coin::value(&payment);
        
        assert!(table::contains(&group.members, sender), EMemberNotFound);
        assert!(amount >= group.min_contribution_amount, EInvalidAmount);

        let member = table::borrow_mut(&mut group.members, sender);
        let timestamp = clock::timestamp_ms(clock);

        // Update member's contribution history
        if (member.first_contribution_time == 0) {
            member.first_contribution_time = timestamp;
        };

        let contribution = Contribution {
            amount,
            timestamp,
        };

        vector::push_back(&mut member.contribution_history, contribution);
        member.total_contributions = member.total_contributions + amount;

        // Add to group balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut group.total_balance, payment_balance);

        event::emit(ContributionMade {
            group_id,
            member: sender,
            amount,
            timestamp,
        });
    }

    // Request a loan from the group
    public entry fun request_loan(
        jamiifund: &mut JamiiFund,
        group_id: ID,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&jamiifund.groups, group_id), EGroupNotFound);
        
        let group = table::borrow_mut(&mut jamiifund.groups, group_id);
        let sender = tx_context::sender(ctx);
        
        assert!(table::contains(&group.members, sender), EMemberNotFound);
        
        let member = table::borrow(&group.members, sender);
        assert!(option::is_none(&member.active_loan_id), ELoanAlreadyExists);
        
        // Check eligibility
        let current_time = clock::timestamp_ms(clock);
        let months_since_first_contribution = 
            (current_time - member.first_contribution_time) / (30 * 24 * 60 * 60 * 1000);
        
        assert!(months_since_first_contribution >= MIN_CONTRIBUTION_MONTHS, ENotEligibleForLoan);
        
        let max_loan_amount = (member.total_contributions * group.loan_to_contribution_ratio) / 10000;
        assert!(amount <= max_loan_amount, ENotEligibleForLoan);
        assert!(amount <= balance::value(&group.total_balance), EInsufficientBalance);

        // Create loan proposal
        let proposal_uid = object::new(ctx);
        let proposal_id = object::uid_to_inner(&proposal_uid);
        
        let proposal = Proposal {
            id: proposal_uid,
            proposer: sender,
            proposal_type: 1, // Loan proposal
            target_member: option::some(sender),
            amount: option::some(amount),
            description: string::utf8(b"Loan request"),
            votes_for: 0,
            votes_against: 0,
            voters: table::new(ctx),
            created_at: current_time,
            voting_deadline: current_time + PROPOSAL_VOTING_PERIOD_MS,
            is_executed: false,
            is_active: true,
        };

        table::add(&mut group.proposals, proposal_id, proposal);

        event::emit(LoanRequested {
            group_id,
            loan_id: proposal_id,
            borrower: sender,
            amount,
            timestamp: current_time,
        });
    }

    // Vote on a proposal
    public entry fun vote_on_proposal(
        jamiifund: &mut JamiiFund,
        group_id: ID,
        proposal_id: ID,
        vote: bool, // true for yes, false for no
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&jamiifund.groups, group_id), EGroupNotFound);
        
        let group = table::borrow_mut(&mut jamiifund.groups, group_id);
        let sender = tx_context::sender(ctx);
        
        assert!(table::contains(&group.members, sender), EMemberNotFound);
        assert!(table::contains(&group.proposals, proposal_id), EProposalNotFound);

        let proposal = table::borrow_mut(&mut group.proposals, proposal_id);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(current_time <= proposal.voting_deadline, EVotingPeriodEnded);
        assert!(!table::contains(&proposal.voters, sender), EAlreadyVoted);

        table::add(&mut proposal.voters, sender, vote);
        
        if (vote) {
            proposal.votes_for = proposal.votes_for + 1;
        } else {
            proposal.votes_against = proposal.votes_against + 1;
        };

        event::emit(VoteCast {
            group_id,
            proposal_id,
            voter: sender,
            vote,
            timestamp: current_time,
        });

        // Auto-execute if majority reached
        let total_members = group.member_count;
        let majority_threshold = (total_members / 2) + 1;
        
        if (proposal.votes_for >= majority_threshold) {
            execute_proposal(group, proposal_id, clock, ctx);
        };
    }

    // Execute an approved proposal
    fun execute_proposal(
        group: &mut Group,
        proposal_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let proposal = table::borrow_mut(&mut group.proposals, proposal_id);
        
        if (proposal.proposal_type == 1) { // Loan proposal
            let borrower = *option::borrow(&proposal.target_member);
            let amount = *option::borrow(&proposal.amount);
            
            // Create and disburse loan
            let loan_uid = object::new(ctx);
            let loan_id = object::uid_to_inner(&loan_uid);
            let current_time = clock::timestamp_ms(clock);
            
            let interest_amount = (amount * INTEREST_RATE_BASIS_POINTS) / 10000;
            let total_amount = amount + interest_amount;
            
            let loan = Loan {
                id: loan_uid,
                borrower,
                principal_amount: amount,
                interest_amount,
                total_amount,
                disbursed_at: current_time,
                due_date: current_time + LOAN_DURATION_MS,
                is_repaid: false,
                is_defaulted: false,
                collateral_held: 0,
            };

            table::add(&mut group.loans, loan_id, loan);
            
            // Update borrower's active loan
            let member = table::borrow_mut(&mut group.members, borrower);
            option::fill(&mut member.active_loan_id, loan_id);

            // Disburse loan amount
            let loan_balance = balance::split(&mut group.total_balance, amount);
            let loan_coin = coin::from_balance(loan_balance, ctx);
            transfer::public_transfer(loan_coin, borrower);

            event::emit(LoanApproved {
                group_id: object::uid_to_inner(&group.id),
                loan_id,
                borrower,
                amount,
                timestamp: current_time,
            });
        };

        proposal.is_executed = true;
        proposal.is_active = false;
    }

    // Repay a loan
    public entry fun repay_loan(
        jamiifund: &mut JamiiFund,
        group_id: ID,
        loan_id: ID,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&jamiifund.groups, group_id), EGroupNotFound);
        
        let group = table::borrow_mut(&mut jamiifund.groups, group_id);
        let sender = tx_context::sender(ctx);
        
        assert!(table::contains(&group.loans, loan_id), ELoanNotFound);
        
        let loan = table::borrow_mut(&mut group.loans, loan_id);
        assert!(loan.borrower == sender, ENotAuthorized);
        assert!(!loan.is_repaid, ELoanNotFound);
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= loan.total_amount, EInsufficientBalance);

        // Mark loan as repaid
        loan.is_repaid = true;
        
        // Update member status
        let member = table::borrow_mut(&mut group.members, sender);
        option::extract(&mut member.active_loan_id);
        member.reputation_score = member.reputation_score + 10; // Increase reputation

        // Add payment to group balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut group.total_balance, payment_balance);

        event::emit(LoanRepaid {
            group_id,
            loan_id,
            borrower: sender,
            amount: payment_amount,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Exit the group and claim refund
    public entry fun exit_group(
        jamiifund: &mut JamiiFund,
        group_id: ID,
        member_cap: MemberCap,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(table::contains(&jamiifund.groups, group_id), EGroupNotFound);
        
        let MemberCap { id: cap_id, group_id: cap_group_id, member_address } = member_cap;
        object::delete(cap_id);
        assert!(cap_group_id == group_id, ENotAuthorized);
        
        let group = table::borrow_mut(&mut jamiifund.groups, group_id);
        let sender = tx_context::sender(ctx);
        assert!(member_address == sender, ENotAuthorized);
        
        assert!(table::contains(&group.members, sender), EMemberNotFound);
        
        let member = table::borrow_mut(&mut group.members, sender);
        assert!(option::is_none(&member.active_loan_id), EMemberHasActiveLoan);

        // Calculate refund amount (proportional to contributions)
        let refund_amount = member.total_contributions;
        assert!(refund_amount <= balance::value(&group.total_balance), EInsufficientBalance);

        // Mark member as inactive
        member.is_active = false;
        group.member_count = group.member_count - 1;

        // Transfer refund
        if (refund_amount > 0) {
            let refund_balance = balance::split(&mut group.total_balance, refund_amount);
            let refund_coin = coin::from_balance(refund_balance, ctx);
            transfer::public_transfer(refund_coin, sender);
        };

        event::emit(MemberExited {
            group_id,
            member: sender,
            refund_amount,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // View functions
    public fun get_group_balance(jamiifund: &JamiiFund, group_id: ID): u64 {
        let group = table::borrow(&jamiifund.groups, group_id);
        balance::value(&group.total_balance)
    }

    public fun get_member_contributions(jamiifund: &JamiiFund, group_id: ID, member: address): u64 {
        let group = table::borrow(&jamiifund.groups, group_id);
        let member_data = table::borrow(&group.members, member);
        member_data.total_contributions
    }

    public fun is_member_eligible_for_loan(
        jamiifund: &JamiiFund, 
        group_id: ID, 
        member: address,
        clock: &Clock
    ): bool {
        let group = table::borrow(&jamiifund.groups, group_id);
        if (!table::contains(&group.members, member)) return false;
        
        let member_data = table::borrow(&group.members, member);
        if (!option::is_none(&member_data.active_loan_id)) return false;
        
        let current_time = clock::timestamp_ms(clock);
        let months_since_first_contribution = 
            (current_time - member_data.first_contribution_time) / (30 * 24 * 60 * 60 * 1000);
        
        months_since_first_contribution >= MIN_CONTRIBUTION_MONTHS
    }

    public fun get_max_loan_amount(jamiifund: &JamiiFund, group_id: ID, member: address): u64 {
        let group = table::borrow(&jamiifund.groups, group_id);
        let member_data = table::borrow(&group.members, member);
        (member_data.total_contributions * group.loan_to_contribution_ratio) / 10000
    }
}
