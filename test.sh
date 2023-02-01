DEPLOYER=test2
BEAR=test
EPOCH=0
aptos move run --function-id $ADDRESS::prediction::add_round --assume-yes --profile $DEPLOYER
aptos move run --function-id $ADDRESS::prediction::set_lock_price --assume-yes --args u64:$EPOCH u64:100000000 --profile $DEPLOYER

aptos move run --function-id $ADDRESS::prediction::bet_bull --assume-yes --args u64:$EPOCH u64:1 --profile $DEPLOYER
aptos move run --function-id $ADDRESS::prediction::bet_bear --assume-yes --args u64:$EPOCH u64:1 --profile $BEAR

aptos move run --function-id $ADDRESS::prediction::set_close_price --assume-yes --args u64:0 u64:20 --profile $DEPLOYER

aptos move run --function-id $ADDRESS::prediction::claim_entry --assume-yes --profile $DEPLOYER
aptos move run --function-id $ADDRESS::prediction::claim_entry --assume-yes --profile $BEAR
