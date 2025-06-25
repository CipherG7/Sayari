#[test_only]
module jamiifund::core_tests;
    use sui::test_scenario::{Self, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::{Self, SUI};
    use sui::test_utils::assert_eq;
    use std::string;

    use jamiifund::core::{Self, JamiiFund, GroupCap, MemberCap};

// Test addresses
const ADMIN: address = @0xAD;
const ALICE: address = @0x01;
const BOB: address = @0x02;
const CHARLIE: address = @0x03;

// Test constants
const INITIAL_BALANCE: u64 = 1000000000; // 1 SUI
const MIN_CONTRIBUTION: u64 = 100000000; // 0.1 SUI
const LOAN_RATIO: u64 = 5000; // 50%

// Helper function to create test scenario
fun create_test_scenario(): Scenario {
    test_scenario::begin(ADMIN)
}

// Helper function to advance time by days
fun advance_time_by_days(scenario: &mut Scenario, days: u64) {
    let ctx = test_scenario::ctx(scenario);
    let mut clock = clock::create_for_testing(ctx);
    clock::increment_for_testing(&mut clock, days * 24 * 60 * 60 * 1000);
    clock::share_for_testing(clock);
}

// Helper function to create coins
fun mint_test_coin(amount: u64, ctx: &mut TxContext): Coin<SUI> {
    coin::mint_for_testing<SUI>(amount, ctx)
}

#[test]
fun test_initialize_platform() {
    let mut scenario = create_test_scenario();
    let ctx = test_scenario::ctx(&mut scenario);

    // Initialize the JamiiFund platform
    core::initialize(ctx);

    test_scenario::next_tx(&mut scenario, ADMIN);

    // Check that object was created
    assert!(test_scenario::has_most_recent_shared<JamiiFund>(), 0);

    test_scenario::end(scenario);
}