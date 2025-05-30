#[allow(unused_variable,unused_field,unused_mut_parameter)]
module jamiifund::governance {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};

    // Import from core module
    use jamiifund::core::{JamiiFund, GroupCap};

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EVotingPeriodEnded: u64 = 2;
    const EVotingPeriodActive: u64 = 3;
    const EAlreadyExecuted: u64 = 4;
    const EInsufficientVotes: u64 = 5;

    // Proposal types
    const PROPOSAL_TYPE_LOAN: u8 = 1;
    const PROPOSAL_TYPE_EXIT: u8 = 2;
    const PROPOSAL_TYPE_RULE_CHANGE: u8 = 3;
    const PROPOSAL_TYPE_EMERGENCY: u8 = 4;
    const PROPOSAL_TYPE_MEMBER_REMOVAL: u8 = 5;

    // Voting thresholds (basis points)
    const SIMPLE_MAJORITY: u64 = 5100; // 51%
    const SUPERMAJORITY: u64 = 6700; // 67%

    // Structs
    public struct GovernanceConfig has key, store {
        id: UID,
        group_id: ID,
        voting_period_ms: u64,
        proposal_deposit: u64,
        quorum_threshold: u64, // Minimum participation rate
        simple_majority_threshold: u64,
        supermajority_threshold: u64,
        emergency_voting_period_ms: u64,
        max_active_proposals: u64,
        proposal_cooldown_ms: u64,
    }

    public struct ProposalRegistry has key {
        id: UID,
        group_id: ID,
        active_proposals: vector<ID>,
        proposal_history: Table<ID, ProposalMetadata>,
        member_last_proposal: Table<address, u64>,
        total_proposals: u64,
    }

    public struct ProposalMetadata has store {
        proposal_id: ID,
        proposer: address,
        proposal_type: u8,
        created_at: u64,
        executed_at: Option<u64>,
        success: bool,
        total_votes: u64,
        participation_rate: u64,
    }

    public struct DetailedProposal has key, store {
        id: UID,
        proposal_id: ID,
        title: String,
        description: String,
        proposal_type: u8,
        proposer: address,
        target_member: Option<address>,
        amount: Option<u64>,
        new_value: Option<u64>, // For rule changes
        rationale: String,
        votes_for: u64,
        votes_against: u64,
        votes_abstain: u64,
        voters: Table<address, VoteRecord>,
        created_at: u64,
        voting_deadline: u64,
        execution_deadline: u64,
        required_threshold: u64,
        deposit_held: u64,
        is_executed: bool,
        is_cancelled: bool,
        execution_result: Option<String>,
    }

    public struct VoteRecord has store, copy, drop {
        vote: u8, // 0: Against, 1: For, 2: Abstain
        timestamp: u64,
        voting_power: u64,
        rationale: Option<String>,
    }

    public struct VotingPower has key, store {
        id: UID,
        group_id: ID,
        member_powers: Table<address, MemberVotingPower>,
        total_voting_power: u64,
        last_updated: u64,
    }

    public struct MemberVotingPower has store, drop {
        base_power: u64,
        contribution_bonus: u64,
        reputation_bonus: u64,
        tenure_bonus: u64,
        total_power: u64,
        last_calculated: u64,
    }

    public struct DelegationRegistry has key, store {
        id: UID,
        group_id: ID,
        delegations: Table<address, address>, // delegator -> delegate
        delegate_powers: Table<address, u64>, // delegate -> total delegated power
        delegation_history: Table<address, vector<DelegationRecord>>,
    }

    public struct DelegationRecord has store, copy, drop {
        delegate: address,
        delegated_at: u64,
        revoked_at: Option<u64>,
        power_delegated: u64,
    }

    // Events
    public struct ProposalCreated has copy, drop {
        group_id: ID,
        proposal_id: ID,
        proposer: address,
        proposal_type: u8,
        title: String,
        voting_deadline: u64,
        required_threshold: u64,
        timestamp: u64,
    }

    public struct VoteCast has copy, drop {
        group_id: ID,
        proposal_id: ID,
        voter: address,
        vote: u8,
        voting_power: u64,
        timestamp: u64,
    }

    public struct ProposalExecuted has copy, drop {
        group_id: ID,
        proposal_id: ID,
        success: bool,
        final_votes_for: u64,
        final_votes_against: u64,
        participation_rate: u64,
        timestamp: u64,
    }

    public struct VotingPowerUpdated has copy, drop {
        group_id: ID,
        member: address,
        old_power: u64,
        new_power: u64,
        timestamp: u64,
    }

    public struct DelegationSet has copy, drop {
        group_id: ID,
        delegator: address,
        delegate: address,
        power_delegated: u64,
        timestamp: u64,
    }

    // Initialize governance for a group
    public entry fun initialize_governance(
        group_cap: &GroupCap,
        group_id: ID,
        voting_period_ms: u64,
        proposal_deposit: u64,
        quorum_threshold: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let config = GovernanceConfig {
            id: object::new(ctx),
            group_id,
            voting_period_ms,
            proposal_deposit,
            quorum_threshold,
            simple_majority_threshold: SIMPLE_MAJORITY,
            supermajority_threshold: SUPERMAJORITY,
            emergency_voting_period_ms: voting_period_ms / 3, // Faster for emergencies
            max_active_proposals: 5,
            proposal_cooldown_ms: 86400000, // 24 hours
        };

        let registry = ProposalRegistry {
            id: object::new(ctx),
            group_id,
            active_proposals: vector::empty(),
            proposal_history: table::new(ctx),
            member_last_proposal: table::new(ctx),
            total_proposals: 0,
        };

        let voting_power = VotingPower {
            id: object::new(ctx),
            group_id,
            member_powers: table::new(ctx),
            total_voting_power: 0,
            last_updated: clock::timestamp_ms(clock),
        };

        let delegation_registry = DelegationRegistry {
            id: object::new(ctx),
            group_id,
            delegations: table::new(ctx),
            delegate_powers: table::new(ctx),
            delegation_history: table::new(ctx),
        };

        transfer::share_object(config);
        transfer::share_object(registry);
        transfer::share_object(voting_power);
        transfer::share_object(delegation_registry);
    }

    // Create a detailed proposal
    public entry fun create_proposal(
        jamiifund: &JamiiFund,
        registry: &mut ProposalRegistry,
        config: &GovernanceConfig,
        group_id: ID,
        title: String,
        description: String,
        proposal_type: u8,
        target_member: Option<address>,
        amount: Option<u64>,
        new_value: Option<u64>,
        rationale: String,
        deposit: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Validate proposal deposit
        assert!(coin::value(&deposit) >= config.proposal_deposit, ENotAuthorized);
        
        // Check cooldown period
        if (table::contains(&registry.member_last_proposal, sender)) {
            let last_proposal_time = *table::borrow(&registry.member_last_proposal, sender);
            assert!(current_time - last_proposal_time >= config.proposal_cooldown_ms, ENotAuthorized);
        };

        // Check active proposal limit
        assert!(vector::length(&registry.active_proposals) < config.max_active_proposals, ENotAuthorized);

        // Determine voting period and threshold based on proposal type
        let (voting_period, required_threshold) = get_proposal_requirements(proposal_type, config);
        let voting_deadline = current_time + voting_period;
        let execution_deadline = voting_deadline + 172800000; // 48 hours to execute

        // Create detailed proposal
        let proposal_uid = object::new(ctx);
        let proposal_id = object::uid_to_inner(&proposal_uid);
        
        let proposal = DetailedProposal {
            id: proposal_uid,
            proposal_id,
            title,
            description,
            proposal_type,
            proposer: sender,
            target_member,
            amount,
            new_value,
            rationale,
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            voters: table::new(ctx),
            created_at: current_time,
            voting_deadline,
            execution_deadline,
            required_threshold,
            deposit_held: coin::value(&deposit),
            is_executed: false,
            is_cancelled: false,
            execution_result: option::none(),
        };

        // Store deposit
        transfer::public_transfer(deposit, @jamiifund); // Transfer to protocol treasury

        // Update registry
        vector::push_back(&mut registry.active_proposals, proposal_id);
        table::add(&mut registry.member_last_proposal, sender, current_time);
        registry.total_proposals = registry.total_proposals + 1;

        let metadata = ProposalMetadata {
            proposal_id,
            proposer: sender,
            proposal_type,
            created_at: current_time,
            executed_at: option::none(),
            success: false,
            total_votes: 0,
            participation_rate: 0,
        };
        table::add(&mut registry.proposal_history, proposal_id, metadata);

        transfer::share_object(proposal);

        event::emit(ProposalCreated {
            group_id,
            proposal_id,
            proposer: sender,
            proposal_type,
            title,
            voting_deadline,
            required_threshold,
            timestamp: current_time,
        });
    }

    // Cast a vote with delegation support
    public entry fun cast_vote(
        proposal: &mut DetailedProposal,
        voting_power: &VotingPower,
        delegation_registry: &DelegationRegistry,
        vote: u8, // 0: Against, 1: For, 2: Abstain
        rationale: Option<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(current_time <= proposal.voting_deadline, EVotingPeriodEnded);
        assert!(!table::contains(&proposal.voters, sender), ENotAuthorized);

        // Calculate total voting power (including delegated power)
        let member_power = get_member_voting_power(voting_power, sender);
        let delegated_power = get_delegated_power(delegation_registry, sender);
        let total_power = member_power + delegated_power;

        // Record vote
        let vote_record = VoteRecord {
            vote,
            timestamp: current_time,
            voting_power: total_power,
            rationale,
        };
        table::add(&mut proposal.voters, sender, vote_record);

        // Update vote counts
        if (vote == 0) {
            proposal.votes_against = proposal.votes_against + total_power;
        } else if (vote == 1) {
            proposal.votes_for = proposal.votes_for + total_power;
        } else if (vote == 2) {
            proposal.votes_abstain = proposal.votes_abstain + total_power;
        };

        event::emit(VoteCast {
            group_id: voting_power.group_id,
            proposal_id: proposal.proposal_id,
            voter: sender,
            vote,
            voting_power: total_power,
            timestamp: current_time,
        });
    }

    // Execute a proposal after voting period
    public entry fun execute_proposal(
        jamiifund: &mut JamiiFund,
        proposal: &mut DetailedProposal,
        registry: &mut ProposalRegistry,
        voting_power: &VotingPower,
        config: &GovernanceConfig,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        
        assert!(current_time > proposal.voting_deadline, EVotingPeriodActive);
        assert!(current_time <= proposal.execution_deadline, EVotingPeriodEnded);
        assert!(!proposal.is_executed, EAlreadyExecuted);

        // Calculate participation rate
        let total_votes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;
        let participation_rate = (total_votes * 10000) / voting_power.total_voting_power;
        
        // Check if quorum is met
        assert!(participation_rate >= config.quorum_threshold, EInsufficientVotes);

        // Check if proposal passes
        let approval_rate = if (total_votes > 0) {
            (proposal.votes_for * 10000) / total_votes
        } else {
            0
        };

        let proposal_passes = approval_rate >= proposal.required_threshold;
        
        // Execute proposal logic based on type
        let execution_result = if (proposal_passes) {
            execute_proposal_logic(jamiifund, proposal, ctx)
        } else {
            string::utf8(b"Proposal failed - insufficient votes")
        };

        // Mark as executed
        proposal.is_executed = true;
        option::fill(&mut proposal.execution_result, execution_result);

        // Update metadata
        let metadata = table::borrow_mut(&mut registry.proposal_history, proposal.proposal_id);
        option::fill(&mut metadata.executed_at, current_time);
        metadata.success = proposal_passes;
        metadata.total_votes = total_votes;
        metadata.participation_rate = participation_rate;

        // Remove from active proposals
        let (found, index) = vector::index_of(&registry.active_proposals, &proposal.proposal_id);
        if (found) {
            vector::remove(&mut registry.active_proposals, index);
        };

        event::emit(ProposalExecuted {
            group_id: voting_power.group_id,
            proposal_id: proposal.proposal_id,
            success: proposal_passes,
            final_votes_for: proposal.votes_for,
            final_votes_against: proposal.votes_against,
            participation_rate,
            timestamp: current_time,
        });
    }

    // Delegate voting power to another member
    public entry fun delegate_voting_power(
        delegation_registry: &mut DelegationRegistry,
        voting_power: &VotingPower,
        delegate: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Revoke existing delegation if any
        if (table::contains(&delegation_registry.delegations, sender)) {
            revoke_delegation_internal(delegation_registry, sender, current_time);
        };

        // Get delegator's voting power
        let power_to_delegate = get_member_voting_power(voting_power, sender);
        
        // Set new delegation
        table::add(&mut delegation_registry.delegations, sender, delegate);
        
        if (table::contains(&delegation_registry.delegate_powers, delegate)) {
            let current_delegated = table::borrow_mut(&mut delegation_registry.delegate_powers, delegate);
            *current_delegated = *current_delegated + power_to_delegate;
        } else {
            table::add(&mut delegation_registry.delegate_powers, delegate, power_to_delegate);
        };

        // Record delegation history
        let delegation_record = DelegationRecord {
            delegate,
            delegated_at: current_time,
            revoked_at: option::none(),
            power_delegated: power_to_delegate,
        };

        if (table::contains(&delegation_registry.delegation_history, sender)) {
            let history = table::borrow_mut(&mut delegation_registry.delegation_history, sender);
            vector::push_back(history, delegation_record);
        } else {
            let mut history = vector::empty();
            vector::push_back(&mut history, delegation_record);
            table::add(&mut delegation_registry.delegation_history, sender, history);
        };

        event::emit(DelegationSet {
            group_id: delegation_registry.group_id,
            delegator: sender,
            delegate,
            power_delegated: power_to_delegate,
            timestamp: current_time,
        });
    }

    // Revoke delegation
    public entry fun revoke_delegation(
        delegation_registry: &mut DelegationRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&delegation_registry.delegations, sender), ENotAuthorized);
        revoke_delegation_internal(delegation_registry, sender, current_time);
    }

    // Update member voting power based on contributions and reputation
    public entry fun update_voting_power(
        jamiifund: &JamiiFund,
        voting_power: &mut VotingPower,
        member: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        
        // Calculate new voting power based on multiple factors
        let (base_power, contribution_bonus, reputation_bonus, tenure_bonus) = 
            calculate_member_power(jamiifund, voting_power.group_id, member, clock);
        
        let total_power = base_power + contribution_bonus + reputation_bonus + tenure_bonus;
        
        let old_power = if (table::contains(&voting_power.member_powers, member)) {
            let existing_power = table::borrow(&voting_power.member_powers, member);
            existing_power.total_power
        } else {
            0
        };

        let member_power = MemberVotingPower {
            base_power,
            contribution_bonus,
            reputation_bonus,
            tenure_bonus,
            total_power,
            last_calculated: current_time,
        };

        if (table::contains(&voting_power.member_powers, member)) {
            let existing = table::borrow_mut(&mut voting_power.member_powers, member);
            *existing = member_power;
        } else {
            table::add(&mut voting_power.member_powers, member, member_power);
        };

        // Update total voting power
        voting_power.total_voting_power = voting_power.total_voting_power - old_power + total_power;
        voting_power.last_updated = current_time;

        if (old_power != total_power) {
            event::emit(VotingPowerUpdated {
                group_id: voting_power.group_id,
                member,
                old_power,
                new_power: total_power,
                timestamp: current_time,
            });
        };
    }

    // Helper functions
    fun get_proposal_requirements(proposal_type: u8, config: &GovernanceConfig): (u64, u64) {
        if (proposal_type == PROPOSAL_TYPE_LOAN) {
            (config.voting_period_ms, config.simple_majority_threshold)
        } else if (proposal_type == PROPOSAL_TYPE_EXIT) {
            (config.voting_period_ms, config.simple_majority_threshold)
        } else if (proposal_type == PROPOSAL_TYPE_RULE_CHANGE) {
            (config.voting_period_ms, config.supermajority_threshold)
        } else if (proposal_type == PROPOSAL_TYPE_EMERGENCY) {
            (config.emergency_voting_period_ms, config.supermajority_threshold)
        } else if (proposal_type == PROPOSAL_TYPE_MEMBER_REMOVAL) {
            (config.voting_period_ms, config.supermajority_threshold)
        } else {
            (config.voting_period_ms, config.simple_majority_threshold)
        }
    }

    fun execute_proposal_logic(
        jamiifund: &mut JamiiFund,
        proposal: &DetailedProposal,
        ctx: &mut TxContext
    ): String {
        // This would integrate with the core module to execute approved proposals
        // Implementation depends on the specific proposal type
        if (proposal.proposal_type == PROPOSAL_TYPE_LOAN) {
            string::utf8(b"Loan approved and disbursed")
        } else if (proposal.proposal_type == PROPOSAL_TYPE_RULE_CHANGE) {
            string::utf8(b"Rule change implemented")
        } else {
            string::utf8(b"Proposal executed successfully")
        }
    }

    fun calculate_member_power(
        jamiifund: &JamiiFund,
        group_id: ID,
        member: address,
        clock: &Clock
    ): (u64, u64, u64, u64) {
        // Base power: 1 vote per member
        let base_power = 100;
        
        // Contribution bonus: based on total contributions
        let contribution_bonus = 0; // Calculate from member data
        
        // Reputation bonus: based on loan repayment history
        let reputation_bonus = 0; // Calculate from member reputation
        
        // Tenure bonus: based on time in group
        let tenure_bonus = 0; // Calculate from join date
        
        (base_power, contribution_bonus, reputation_bonus, tenure_bonus)
    }

    fun get_member_voting_power(voting_power: &VotingPower, member: address): u64 {
        if (table::contains(&voting_power.member_powers, member)) {
            let member_power = table::borrow(&voting_power.member_powers, member);
            member_power.total_power
        } else {
            0
        }
    }

    fun get_delegated_power(delegation_registry: &DelegationRegistry, delegate: address): u64 {
        if (table::contains(&delegation_registry.delegate_powers, delegate)) {
            *table::borrow(&delegation_registry.delegate_powers, delegate)
        } else {
            0
        }
    }

    fun revoke_delegation_internal(
        delegation_registry: &mut DelegationRegistry,
        delegator: address,
        current_time: u64
    ) {
        let delegate = table::remove(&mut delegation_registry.delegations, delegator);
        
        // Update delegation history
        if (table::contains(&delegation_registry.delegation_history, delegator)) {
            let history = table::borrow_mut(&mut delegation_registry.delegation_history, delegator);
            let last_index = vector::length(history) - 1;
            let last_record = vector::borrow_mut(history, last_index);
            option::fill(&mut last_record.revoked_at, current_time);
        };
        
        // Remove delegated power
        if (table::contains(&delegation_registry.delegate_powers, delegate)) {
            table::remove(&mut delegation_registry.delegate_powers, delegate);
        };
    }

    // View functions
    public fun get_proposal_details(proposal: &DetailedProposal): (String, String, u8, u64, u64, u64, bool) {
        (
            proposal.title,
            proposal.description,
            proposal.proposal_type,
            proposal.votes_for,
            proposal.votes_against,
            proposal.voting_deadline,
            proposal.is_executed
        )
    }

    public fun get_member_voting_power_details(voting_power: &VotingPower, member: address): (u64, u64, u64, u64, u64) {
        if (table::contains(&voting_power.member_powers, member)) {
            let power = table::borrow(&voting_power.member_powers, member);
            (power.base_power, power.contribution_bonus, power.reputation_bonus, power.tenure_bonus, power.total_power)
        } else {
            (0, 0, 0, 0, 0)
        }
    }

    public fun is_member_delegating(delegation_registry: &DelegationRegistry, member: address): (bool, address) {
        if (table::contains(&delegation_registry.delegations, member)) {
            (true, *table::borrow(&delegation_registry.delegations, member))
        } else {
            (false, @0x0)
        }
    }
}