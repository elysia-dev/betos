module betos::prediction {
    use std::signer;
    use std::vector;

    use aptos_std::table::{Self, Table};
    use aptos_std::event;

    use aptos_framework::account::SignerCapability;
    use aptos_framework::resource_account;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::{AptosCoin};

    use pyth::pyth;
    use pyth::price_identifier;
    use pyth::i64;
    use pyth::price::{Self,Price};

    // #[test_only]
    // use std::debug;

        // For the entire list of price_ids head to https://pyth.network/developers/price-feed-ids/#pyth-cross-chain-testnet
    const APTOS_USD_PRICE_FEED_IDENTIFIER : vector<u8> = x"44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e";

    const ENO_OWNER: u64 = 0;
    const EBET_TOO_EARLY: u64 = 1;

    struct Events has key {
        update_price_events: event::EventHandle<UpdatePriceEvent>,
    }

    struct UpdatePriceEvent has drop, store {
        price: Price,
    }

    // only exists in @betos
    struct RoundContainer has key {
        signer_cap: SignerCapability,
        rounds: vector<Round>, // index is called as `epoch`
        current_epoch: u64,
    }

    struct Round has key, store {
        epoch: u64,
        start_timestamp: u64, // block.
        lock_timestamp: u64,
        close_timestamp: u64,
        bull_amount: u64,
        bear_amount: u64,
        total_amount: u64,
        lock_price: u64, // start
        close_price: u64,
    }

    // address => BetContainer => bets: HashTable(epoch -> Bet)
    struct Bet has store {
        epoch: u64,
        is_bull: bool,
        amount: u64,
        claimed: bool,
    }

    struct BetContainer has key {
        bets: Table<u64, Bet>, // key: epoch -> value: Bet
        epochs: vector<u64>
    }

    // account: @betos
    fun init_module(account: &signer) {
        // Destroys temporary storage for resource account signer capability and returns signer capability.
        let resource_signer_cap = resource_account::retrieve_resource_account_cap(account, @admin);
        let round_container = RoundContainer {
            signer_cap: resource_signer_cap,
            rounds: vector::empty<Round>(),
            current_epoch: 0
        };

        let events = Events {
            update_price_events: account::new_event_handle<UpdatePriceEvent>(account),
        };

        coin::register<AptosCoin>(account);
        move_to<RoundContainer>(account, round_container);
        move_to<Events>(account, events);
    }

    public fun start_round(rounds: &mut vector<Round>, epoch: u64) {
        // TODO: change to 300
        let interval_seconds = 100;
        let start_timestamp = timestamp::now_seconds();
        let lock_timestamp = start_timestamp + interval_seconds;
        let close_timestamp = start_timestamp + 2 * interval_seconds;

        let new_round = Round {
            epoch: epoch,
            start_timestamp,
            lock_timestamp,
            close_timestamp,
            bull_amount: 0,
            bear_amount: 0,
            total_amount: 0,
            close_price: 0,
            lock_price: 0,
        };

        vector::push_back(rounds, new_round);
    }

    public fun safe_start_round(rounds: &mut vector<Round>, epoch: u64) {
        // TODO: check called onlyOnce
        // TODO: check epoch n - 2 has ended
        // TODO: check now >= epoch n - 2 . close_timestamp
        start_round(rounds, epoch);
    }

    public fun safe_lock_round(round: &mut Round, price: u64) {
        round.lock_price = price;
    }

    public fun safe_close_round(round: &mut Round, price: u64) {
        round.close_price = price;
    }

    // TODO: rename to execute_round
    // onlyOwner
    public entry fun execute_round(account: &signer, pyth_update_data: vector<vector<u8>>) acquires RoundContainer {
        let account_address = signer::address_of(account);
        assert!(account_address == @admin, ENO_OWNER);
        let round_container = borrow_global_mut<RoundContainer>(@betos);
        // let resource_signer = account::create_signer_with_capability(&round_container.signer_cap);

        // 1. get oracle price
        let price = update_and_fetch_price(account, pyth_update_data);
        let price_positive = i64::get_magnitude_if_positive(&price::get_price(&price)); // This will fail if the price is negative

        // 2. close epoch - 1
        // vector index should be decremented by 1. e.g. epoch 1 -> index 0
        let current_epoch = round_container.current_epoch;
        let prev_round = vector::borrow_mut<Round>(&mut round_container.rounds, current_epoch - 2);
        safe_close_round(prev_round, price_positive);

        // 3. lock epoch
        let current_round = vector::borrow_mut<Round>(&mut round_container.rounds, current_epoch - 1);
        safe_lock_round(current_round, price_positive);

        // 4. start epoch
        safe_start_round(&mut round_container.rounds, current_epoch + 1);
        // 5. epoch += 1
        round_container.current_epoch = current_epoch + 1;
    }

    // onlyOwner
    // lock -> start
    public entry fun genesis_lock_round(account: &signer, pyth_update_data: vector<vector<u8>>) acquires RoundContainer {
        let account_address = signer::address_of(account);
        assert!(account_address == @admin, ENO_OWNER);
        let round_container = borrow_global_mut<RoundContainer>(@betos);
        // let resource_signer = account::create_signer_with_capability(&round_container.signer_cap);

        // 1. get oracle price
        let price = update_and_fetch_price(account, pyth_update_data);
        let price_positive = i64::get_magnitude_if_positive(&price::get_price(&price)); // This will fail if the price is negative

        let current_epoch = round_container.current_epoch;

        // 3. lock epoch
        // vector index should be decremented by 1. e.g. epoch 1 -> index 0
        let current_round = vector::borrow_mut<Round>(&mut round_container.rounds, current_epoch - 1);
        safe_lock_round(current_round, price_positive);

        // 4. start epoch
        safe_start_round(&mut round_container.rounds, current_epoch + 1);
        // 5. epoch += 1
        round_container.current_epoch = current_epoch + 1;
    }

    // onlyOwner
    // start
    public entry fun genesis_start_round(account: &signer) acquires RoundContainer {
        let account_address = signer::address_of(account);
        assert!(account_address == @admin, ENO_OWNER);
        let round_container = borrow_global_mut<RoundContainer>(@betos);
        // let resource_signer = account::create_signer_with_capability(&round_container.signer_cap);

        let current_epoch = round_container.current_epoch;

        // 4. start epoch
        safe_start_round(&mut round_container.rounds, current_epoch + 1);
        // 5. epoch += 1
        round_container.current_epoch = current_epoch + 1;
    }

    public fun get_round(epoch: u64): (u64, u64, u64, u64, u64) acquires RoundContainer {
        let round_container = borrow_global<RoundContainer>(@betos);
        let round = vector::borrow<Round>(&round_container.rounds, epoch - 1);

        (round.start_timestamp, round.lock_timestamp, round.close_timestamp, round.close_price, round.lock_price)
    }

    // epoch: the index of round_container.rounds vector
    public entry fun bet(better: &signer, epoch: u64, amount: u64, is_bull: bool) acquires RoundContainer, BetContainer {
        // TODO: check timestamp
        // 0. start_timestamp <= now < lock_timestamp
        // let now = timestamp::now_seconds();
        // assert!(start_timestamp <= now, EBET_TOO_EARLY);

        let better_address = signer::address_of(better);
        // 1. Create if not exists
        if (!exists<BetContainer>(better_address)) {
            move_to<BetContainer>(better, BetContainer { bets: table::new<u64, Bet>(), epochs: vector::empty<u64>() });
        };

        // 2. Transfer aptos
        let round_container = borrow_global_mut<RoundContainer>(@betos);
        let resource_signer = account::create_signer_with_capability(&round_container.signer_cap);
        let resource_signer_address = signer::address_of(&resource_signer);
        let in_coin = coin::withdraw<AptosCoin>(better, amount);
        coin::deposit(resource_signer_address, in_coin);

        // 3. Insert BetInfo into table
        let bet_container = borrow_global_mut<BetContainer>(better_address);
        table::add(&mut bet_container.bets, epoch, Bet { epoch, amount, is_bull, claimed: false } );
        vector::push_back(&mut bet_container.epochs, epoch);

        // 4. Add round.bull_amount
        // vector index should be decremented by 1. e.g. epoch 1 -> index 0
        let round = vector::borrow_mut<Round>(&mut round_container.rounds, epoch - 1);
        if (is_bull) {
            round.bull_amount = round.bull_amount + amount;
        } else {
            round.bear_amount = round.bear_amount + amount;
        };
        round.total_amount = round.total_amount + amount;
    }

    public entry fun bet_bull(better: &signer, epoch: u64, amount: u64) acquires RoundContainer, BetContainer {
        bet(better, epoch, amount, true);
    }

    public entry fun bet_bear(better: &signer, epoch: u64, amount: u64) acquires RoundContainer, BetContainer {
        bet(better, epoch, amount, false);
    }

    fun claim(resource_signer: &signer, account_address: address, round: &Round, bet: &mut Bet) {
        // TODO: handle the draw
        if (round.lock_price <= round.close_price && bet.is_bull) {
            let prize = (bet.amount * round.total_amount) / round.bull_amount;
            coin::transfer<AptosCoin>(resource_signer, account_address, prize);
            bet.claimed = true;
        } else if(round.close_price < round.lock_price && !bet.is_bull) {
            let prize = (bet.amount * round.total_amount) / round.bear_amount;
            coin::transfer<AptosCoin>(resource_signer, account_address, prize);
            bet.claimed = true;
        };
    }

    public entry fun claim_entry(account: &signer) acquires RoundContainer, BetContainer {
        let account_address = signer::address_of(account);
        let bet_container = borrow_global_mut<BetContainer>(account_address);
        let round_container = borrow_global<RoundContainer>(@betos);
        let resource_signer = account::create_signer_with_capability(&round_container.signer_cap);
        let num_rounds = vector::length(&round_container.rounds);

        let epoch = 1;

        loop {
            if (epoch == num_rounds + 1) {
                break
            };

            // Check if the user bet
            if (!table::contains(&bet_container.bets, epoch)) {
                epoch = epoch + 1;
                continue
            };
            // Check if claimed
            let bet = table::borrow_mut(&mut bet_container.bets, epoch);
            if (bet.claimed) {
                epoch = epoch + 1;
                continue
            };

            let round = vector::borrow(&round_container.rounds, epoch - 1);
            if (round.close_price == 0) {
                epoch = epoch + 1;
                continue
            };

            claim(&resource_signer, account_address, round, bet);

            epoch = epoch + 1;
        };
    }

    // Not necessary
    /*
    public entry fun set_close_price_by_oracle(account: &signer, epoch: u64, pyth_update_data: vector<vector<u8>>) acquires Events, RoundContainer {
        let price = update_and_fetch_price(account, pyth_update_data);

        let price_positive = i64::get_magnitude_if_positive(&price::get_price(&price)); // This will fail if the price is negative
        // let expo_magnitude = i64::get_magnitude_if_negative(&price::get_expo(&price)); // This will fail if the exponent is positive
        // let price_in_aptos_coin =  (OCTAS_PER_APTOS * pow(10, expo_magnitude)) / price_positive; // 1 USD in APT

        let events = borrow_global_mut<Events>(@betos);
        event::emit_event<UpdatePriceEvent>(
            &mut events.update_price_events,
            UpdatePriceEvent {
                price
            }
        );

        let round_container = borrow_global_mut<RoundContainer>(@betos);
        let round = vector::borrow_mut<Round>(&mut round_container.rounds, epoch);
        round.close_price = price_positive;
    }

    public entry fun set_lock_price(account: &signer, epoch: u64, price: u64) acquires RoundContainer {
        // check onlyOwner
        let account_address = signer::address_of(account);
        assert!(account_address == @admin, ENO_OWNER);

        let round_container = borrow_global_mut<RoundContainer>(@betos);
        let round = vector::borrow_mut<Round>(&mut round_container.rounds, epoch);
        round.lock_price = price
    }

    public entry fun set_close_price(account: &signer, epoch: u64, price: u64) acquires RoundContainer {
        // check onlyOwner
        let account_address = signer::address_of(account);
        assert!(account_address == @admin, ENO_OWNER);

        let round_container = borrow_global_mut<RoundContainer>(@betos);
        let round = vector::borrow_mut<Round>(&mut round_container.rounds, epoch);
        round.close_price = price
    }
    */

    fun update_and_fetch_price(account: &signer, pyth_update_data: vector<vector<u8>>): Price {
        // First update the Pyth price feeds. The user pays the fee for the update.
        let coins = coin::withdraw<AptosCoin>(account, pyth::get_update_fee(&pyth_update_data));

        pyth::update_price_feeds(pyth_update_data, coins);

        // Now we can use the prices which we have just updated
        pyth::get_price(price_identifier::from_byte_vec(APTOS_USD_PRICE_FEED_IDENTIFIER)) // Get recent price (will fail if price is too old)
    }

    #[test(creator = @0xa11ce, framework = @0x1)]
    fun test_bet_bull_after_close() {
    }

    #[test(creator = @0xa11ce, framework = @0x1)]
    fun test_claim_already_claimed() {
        // assert no transfer happens

        // assert bet.claiemd remains true
    }

    #[test(creator = @0xa11ce, framework = @0x1)]
    fun test_claim_bull() {
        // Assumption: total: 100, bull: 50, bear 50, bet.amount: 20, bet.claiemd = false
        // Expected: prize: 40, bet.claimed: true

        // assert get the right amount of the prize

        // assert bet.claimed false -> true
    }

    fun test_claim_bear() {

    }

    fun test_claim_draw() {

    }

    #[test_only]
    public entry fun set_up_test(origin_account: &signer, resource_account: &signer, framework: signer) {
        use std::vector;
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(origin_account));
        // account::create_account_for_test(signer::address_of(resource_account));

        // create a resource account from the origin account, mocking the module publishing process
        resource_account::create_resource_account(origin_account, vector::empty<u8>(), vector::empty<u8>());
        init_module(resource_account);
    }

    #[test(creator = @0xa11ce, resource_account = @0x6c9df88bbf3864ff164ef4af37945100ba7f3c6e9a37e3ebc81320bbd4e79253, framework = @0x1)]
    fun test_add_round(
        creator: signer,
        resource_account: signer,
        framework: signer
    ) acquires RoundContainer, Round {
        set_up_test(&creator, &resource_account, framework);

        let now = timestamp::now_seconds();
        let interval_seconds = 10;
        let creator_addr = signer::address_of(&creator);

        add_round(&creator);
        let round = borrow_global<Round>(creator_addr);

        assert!(round.start_timestamp == now, 0);
        assert!(round.lock_timestamp == now + interval_seconds, 0);
        assert!(round.close_timestamp == now + 2 * interval_seconds, 0);
    }

/*
    #[test(creator = @0xa11ce, resource_account = @0x6c9df88bbf3864ff164ef4af37945100ba7f3c6e9a37e3ebc81320bbd4e79253, stranger = @0xb0b, framework = @0x1)]
    fun test_add_round_only_owner(
        creator: signer,
        resource_account: signer,
        stranger: signer,
        framework: signer,
    ) acquires RoundContainer {
        set_up_test(&creator, &resource_account, framework);

        let stranger_addr = signer::address_of(&stranger);
        debug::print(&stranger_addr);
        debug::print(&@deployer);

        add_round(&creator);
        // let round = borrow_global<Round>(stranger_addr);
    }
    */
}
