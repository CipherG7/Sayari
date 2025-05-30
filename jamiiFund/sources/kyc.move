#[allow(unused_field)]
module jamiifund::kyc {
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use sui::hash;
    use sui::bcs;

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EAlreadyVerified: u64 = 2;
    const EInvalidVerificationCode: u64 = 3;
    const EVerificationExpired: u64 = 4;
    const EContactAlreadyUsed: u64 = 5;
    const EBadgeNotFound: u64 = 6;
    const EAlreadyFlagged: u64 = 7;

    // Constants
    const VERIFICATION_CODE_EXPIRY_MS: u64 = 300000; // 5 minutes
    const KYC_BADGE_VALIDITY_MS: u64 = 31536000000; // 1 year

    // Structs
    public struct KYCRegistry has key {
        id: UID,
        admin: address,
        verified_contacts: Table<String, VerifiedContact>, // contact -> verification info
        user_badges: Table<address, KYCBadge>, // user -> badge
        flagged_users: Table<address, FlagRecord>, // defaulters and suspicious users
        pending_verifications: Table<String, PendingVerification>, // contact -> pending verification
        total_verified_users: u64,
        total_flagged_users: u64,
    }

    public struct VerifiedContact has store {
        contact: String,
        contact_type: u8, // 1: phone, 2: email
        user_address: address,
        verified_at: u64,
        is_active: bool,
    }

    public struct KYCBadge has key, store {
        id: UID,
        user_address: address,
        contact: String,
        contact_type: u8,
        verification_hash: vector<u8>, // Hash of contact + timestamp for uniqueness
        issued_at: u64,
        expires_at: u64,
        is_flagged: bool,
        reputation_score: u64,
    }

    public struct PendingVerification has store, drop {
        contact: String,
        contact_type: u8,
        user_address: address,
        verification_code: String,
        created_at: u64,
        expires_at: u64,
        attempts: u64,
    }

    public struct FlagRecord has store {
        user_address: address,
        reason: String,
        flagged_at: u64,
        flagged_by: address,
        loan_defaults: u64,
        is_active: bool,
    }

    public struct AdminCap has key {
        id: UID,
    }

    // Events
    public struct VerificationRequested has copy, drop {
        user_address: address,
        contact: String,
        contact_type: u8,
        timestamp: u64,
    }

    public struct KYCVerified has copy, drop {
        user_address: address,
        contact: String,
        contact_type: u8,
        badge_id: ID,
        timestamp: u64,
    }

    public struct UserFlagged has copy, drop {
        user_address: address,
        reason: String,
        flagged_by: address,
        timestamp: u64,
    }

    public struct BadgeRevoked has copy, drop {
        user_address: address,
        badge_id: ID,
        reason: String,
        timestamp: u64,
    }

    // Initialize KYC registry
    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        
        let registry = KYCRegistry {
            id: object::new(ctx),
            admin,
            verified_contacts: table::new(ctx),
            user_badges: table::new(ctx),
            flagged_users: table::new(ctx),
            pending_verifications: table::new(ctx),
            total_verified_users: 0,
            total_flagged_users: 0,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(registry);
        transfer::transfer(admin_cap, admin);
    }

    // Request verification for phone or email
    public entry fun request_verification(
        registry: &mut KYCRegistry,
        contact: String,
        contact_type: u8, // 1 for phone, 2 for email
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Check if contact is already verified
        assert!(!table::contains(&registry.verified_contacts, contact), EContactAlreadyUsed);
        
        // Check if user already has a badge
        assert!(!table::contains(&registry.user_badges, user_address), EAlreadyVerified);

        // Generate simple verification code (in production, this should be sent via SMS/Email)
        let verification_code = generate_verification_code(contact, current_time);
        
        let pending_verification = PendingVerification {
            contact,
            contact_type,
            user_address,
            verification_code,
            created_at: current_time,
            expires_at: current_time + VERIFICATION_CODE_EXPIRY_MS,
            attempts: 0,
        };

        // Remove any existing pending verification for this contact
        if (table::contains(&registry.pending_verifications, contact)) {
            table::remove(&mut registry.pending_verifications, contact);
        };

        table::add(&mut registry.pending_verifications, contact, pending_verification);

        event::emit(VerificationRequested {
            user_address,
            contact,
            contact_type,
            timestamp: current_time,
        });
    }

    // Verify contact with code and issue KYC badge
    public entry fun verify_contact(
        registry: &mut KYCRegistry,
        contact: String,
        verification_code: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.pending_verifications, contact), EInvalidVerificationCode);
        
        // Get the contact type before removing the pending verification
        let contact_type = {
            let pending = table::borrow(&registry.pending_verifications, contact);
            assert!(pending.user_address == user_address, ENotAuthorized);
            assert!(current_time <= pending.expires_at, EVerificationExpired);
            assert!(pending.verification_code == verification_code, EInvalidVerificationCode);
            pending.contact_type
        };

        // Create verification hash for uniqueness
        let mut hash_input = contact;
        string::append(&mut hash_input, string::utf8(b"_"));
        string::append(&mut hash_input, u64_to_string(current_time));
        let verification_hash = hash::keccak256(&bcs::to_bytes(&hash_input));

        // Issue KYC badge
        let badge_uid = object::new(ctx);
        let badge_id = object::uid_to_inner(&badge_uid);
        
        let kyc_badge = KYCBadge {
            id: badge_uid,
            user_address,
            contact,
            contact_type,
            verification_hash,
            issued_at: current_time,
            expires_at: current_time + KYC_BADGE_VALIDITY_MS,
            is_flagged: false,
            reputation_score: 100, // Starting reputation
        };

        // Record verified contact
        let verified_contact = VerifiedContact {
            contact,
            contact_type,
            user_address,
            verified_at: current_time,
            is_active: true,
        };

        table::add(&mut registry.verified_contacts, contact, verified_contact);
        table::add(&mut registry.user_badges, user_address, kyc_badge);
        
        // Clean up pending verification
        table::remove(&mut registry.pending_verifications, contact);
        
        registry.total_verified_users = registry.total_verified_users + 1;

        event::emit(KYCVerified {
            user_address,
            contact,
            contact_type,
            badge_id,
            timestamp: current_time,
        });
    }

    // Flag user for loan default or suspicious activity (admin only)
    public entry fun flag_user(
        registry: &mut KYCRegistry,
        _admin_cap: &AdminCap,
        user_address: address,
        reason: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let flagged_by = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        assert!(table::contains(&registry.user_badges, user_address), EBadgeNotFound);
        assert!(!table::contains(&registry.flagged_users, user_address), EAlreadyFlagged);

        // Update badge status
        let badge = table::borrow_mut(&mut registry.user_badges, user_address);
        badge.is_flagged = true;
        badge.reputation_score = if (badge.reputation_score >= 20) { 
            badge.reputation_score - 20 
        } else { 
            0 
        };

        // Create flag record
        let flag_record = FlagRecord {
            user_address,
            reason,
            flagged_at: current_time,
            flagged_by,
            loan_defaults: 1,
            is_active: true,
        };

        table::add(&mut registry.flagged_users, user_address, flag_record);
        registry.total_flagged_users = registry.total_flagged_users + 1;

        event::emit(UserFlagged {
            user_address,
            reason,
            flagged_by,
            timestamp: current_time,
        });
    }

    // Record loan default (can be called by core contract)
    public entry fun record_loan_default(
        registry: &mut KYCRegistry,
        user_address: address,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        
        if (table::contains(&registry.user_badges, user_address)) {
            let badge = table::borrow_mut(&mut registry.user_badges, user_address);
            badge.reputation_score = if (badge.reputation_score >= 30) { 
                badge.reputation_score - 30 
            } else { 
                0 
            };

            // Update or create flag record
            if (table::contains(&registry.flagged_users, user_address)) {
                let flag_record = table::borrow_mut(&mut registry.flagged_users, user_address);
                flag_record.loan_defaults = flag_record.loan_defaults + 1;
            } else {
                let flag_record = FlagRecord {
                    user_address,
                    reason: string::utf8(b"Loan default"),
                    flagged_at: current_time,
                    flagged_by: tx_context::sender(_ctx),
                    loan_defaults: 1,
                    is_active: true,
                };
                table::add(&mut registry.flagged_users, user_address, flag_record);
                registry.total_flagged_users = registry.total_flagged_users + 1;
            };
        };
    }

    // Revoke KYC badge (admin only)
    public entry fun revoke_badge(
        registry: &mut KYCRegistry,
        _admin_cap: &AdminCap,
        user_address: address,
        reason: String,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.user_badges, user_address), EBadgeNotFound);
        
        let badge = table::remove(&mut registry.user_badges, user_address);
        let badge_id = object::uid_to_inner(&badge.id);
        
        // Find and deactivate verified contact
        let contact = badge.contact;
        if (table::contains(&registry.verified_contacts, contact)) {
            let verified_contact = table::borrow_mut(&mut registry.verified_contacts, contact);
            verified_contact.is_active = false;
        };

        // Delete the badge object
        let KYCBadge { id, user_address: _, contact: _, contact_type: _, verification_hash: _, 
                      issued_at: _, expires_at: _, is_flagged: _, reputation_score: _ } = badge;
        object::delete(id);

        registry.total_verified_users = registry.total_verified_users - 1;

        event::emit(BadgeRevoked {
            user_address,
            badge_id,
            reason,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Helper functions
    fun generate_verification_code(contact: String, timestamp: u64): String {
        // Simple code generation - in production, use proper random generation
        let mut hash_input = contact;
        string::append(&mut hash_input, u64_to_string(timestamp));
        let hash_bytes = hash::keccak256(&bcs::to_bytes(&hash_input));
        
        // Take first 6 digits worth of hash as verification code
        let code_num = (((*vector::borrow(&hash_bytes, 0) as u64) * 256 + 
                        (*vector::borrow(&hash_bytes, 1) as u64)) % 1000000);
        u64_to_string(code_num)
    }

    fun u64_to_string(num: u64): String {
        if (num == 0) {
            return string::utf8(b"0")
        };
        
        let mut result = vector::empty<u8>();
        let mut n = num;
        
        while (n > 0) {
            let digit = ((n % 10) as u8) + 48; // Convert to ASCII
            vector::push_back(&mut result, digit);
            n = n / 10;
        };
        
        vector::reverse(&mut result);
        string::utf8(result)
    }

    // View functions
    public fun is_user_verified(registry: &KYCRegistry, user_address: address): bool {
        table::contains(&registry.user_badges, user_address)
    }

    public fun is_user_flagged(registry: &KYCRegistry, user_address: address): bool {
        table::contains(&registry.flagged_users, user_address)
    }

    public fun get_user_reputation(registry: &KYCRegistry, user_address: address): u64 {
        if (table::contains(&registry.user_badges, user_address)) {
            let badge = table::borrow(&registry.user_badges, user_address);
            badge.reputation_score
        } else {
            0
        }
    }

    public fun get_badge_details(registry: &KYCRegistry, user_address: address): (String, u8, u64, u64, bool) {
        assert!(table::contains(&registry.user_badges, user_address), EBadgeNotFound);
        let badge = table::borrow(&registry.user_badges, user_address);
        (badge.contact, badge.contact_type, badge.issued_at, badge.expires_at, badge.is_flagged)
    }

    public fun get_pending_verification_code(registry: &KYCRegistry, contact: String): String {
        assert!(table::contains(&registry.pending_verifications, contact), EInvalidVerificationCode);
        let pending = table::borrow(&registry.pending_verifications, contact);
        pending.verification_code
    }

    public fun get_registry_stats(registry: &KYCRegistry): (u64, u64) {
        (registry.total_verified_users, registry.total_flagged_users)
    }
}