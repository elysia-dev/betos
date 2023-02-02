DEPLOYER=test2
BEAR=test

EPOCH=1
yarn run ts-node execute.ts --action start
aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bull --assume-yes --args u64:$EPOCH u64:1000 --profile $DEPLOYER
aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bear --assume-yes --args u64:$EPOCH u64:2000 --profile $BEAR
sleep 1

EPOCH=2
yarn run ts-node execute.ts --action lock
aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bull --assume-yes --args u64:$EPOCH u64:300000 --profile $DEPLOYER
aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bear --assume-yes --args u64:$EPOCH u64:400000 --profile $BEAR
sleep 1

for EPOCH in 3 4
do
yarn run ts-node execute.ts --action execute
aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bull --assume-yes --args u64:$EPOCH u64:50000 --profile $DEPLOYER
aptos move run --function-id $BETOS_ADDRESS::prediction::bet_bear --assume-yes --args u64:$EPOCH u64:60000 --profile $BEAR
sleep 1
done

aptos move run --function-id $BETOS_ADDRESS::prediction::claim_entry --assume-yes --profile $DEPLOYER
aptos move run --function-id $BETOS_ADDRESS::prediction::claim_entry --assume-yes --profile $BEAR
