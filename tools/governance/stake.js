const yargs = require('yargs');
const argv = yargs
    .option('contract', {
        alias: 'c',
        description: 'The contract address',
        type: 'string'
    })
    .option('amount', {
        alias: 'a',
        description: 'The amount of tokens to stake',
        type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;


const 1earnGovernance = artifacts.require("1earnGovernance");
const 1FI = artifacts.require("1FI");
const 1CRV = artifacts.require("1CRV");

const D = console.log;

let govInstance
let govAddress
let tokenInstance
let tokenAddress


const walletAddress = 1earnGovernance.currentProvider.addresses[0];

function argvCheck() {
    if (argv.amount == null || argv.amount == '')
        throw 'You must supply the amount of tokens to mint using --amount AMOUNT or -a AMOUNT! Amount is a normal number - not wei';
    govAddress = argv.contract ? argv.contract : 1earnGovernance.address;
    if (!govAddress)
        throw 'You must supply a contract address using --contract CONTRACT_ADDRESS or -c CONTRACT_ADDRESS!';

}

async function init() {
    argvCheck();
    govInstance = await 1earnGovernance.at(govAddress);
    tokenAddress = await govInstance.1FI.call();
    tokenInstance = await 1FI.at(tokenAddress);
}

const web3 = require('web3');

async function tokenStatus() {
    console.log(`1FI token address: ${tokenAddress}`);
    let total = await tokenInstance.totalSupply.call();
    console.log(`Current total supply of the hfi token is: ${web3.utils.fromWei(total)}`);

    let balance = await tokenInstance.balanceOf.call(walletAddress);
    console.log(`Balance of hfi token ${tokenAddress} for address ${walletAddress} is: ${web3.utils.fromWei(balance)}\n`);
}

async function stake() {
    const amount = web3.utils.toWei(argv.amount);
    console.log(`Attempting to approve ${walletAddress} to spend ${argv.amount} 1FI tokens (${tokenAddress}) for ${walletAddress}...`);
    const approvalResult = await tokenInstance.approve(govInstance.address, amount);
    console.log(`Approval tx hash: ${approvalResult.tx}\n`);

    console.log(`Attempting to stake ${argv.amount} 1FI tokens (${tokenAddress}) to governance contract ${walletAddress}...`);
    const stakingResult = await govInstance.stake(amount);
    console.log(`Staking transaction hash: ${stakingResult.tx}\n`);

    const total = await govInstance.totalSupply();
    console.log(`Total amount of staked hfi token (${tokenAddress}) in the 1earnGovernance contract (${govInstance.address}) is now: ${web3.utils.fromWei(total)}`);

    let balanceOf = await govInstance.balanceOf(walletAddress);
    console.log(`Balance for address ${walletAddress} is now: ${web3.utils.fromWei(balanceOf)}`);

    let earned = await govInstance.earned(walletAddress);
    console.log(`Current earned rewards for address ${walletAddress} is: ${web3.utils.fromWei(earned)}`);
}

module.exports = function (result) {
    return init()
        .then(tokenStatus)
        .then(stake)
        .then(result).catch(result);
}
