DEPLOYER=test2
BEAR=test
EPOCH=2
# aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bull --assume-yes --args u64:$EPOCH u64:20 --profile $DEPLOYER
# aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bear --assume-yes --args u64:$EPOCH u64:30 --profile $BEAR

aptos move run --function-id $BETOS_ADDRESS::prediction::claim_entry --assume-yes --profile $DEPLOYER
aptos move run --function-id $BETOS_ADDRESS::prediction::claim_entry --assume-yes --profile $BEAR
