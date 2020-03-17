import justjs from './base';
import commonConstants from '../constants/just';
// import ajax from '../utils/ajax';

const BigNumber = require('bignumber.js');

import axios from 'axios'
let just, url;

function init() {
    just = justjs.network(localStorage.getItem('rpcUrl'), localStorage.getItem('chainId'));
    url = localStorage.getItem('rpcUrl')
    just.setBech32MainPrefix(commonConstants.main_coin_prefix);
    const path = commonConstants.path;
    just.setPath(path);
}


function newAddress(mnemonic, account_index) {
    return just.getAddress(mnemonic);
}

function getECPairPriv(mnemonic) {
    return just.getECPairPriv(mnemonic);
}

function jtToAjtFixed(amount) {
    return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(18)).toFixed();
}


function ajtToJt(amount, precise) {
    BigNumber.config({DECIMAL_PLACES: precise});
    return new BigNumber(amount).dividedBy(new BigNumber(10).pow(18));
}

function processTxRes(response) {
    let raw_log = response.raw_log;
    if (response.error) {
        return {
            'result': 'fail',
            'error': response.error
        };
    }
    let result, error;
    let rawLogObj = JSON.parse(raw_log);
    if (rawLogObj instanceof Array) {
        rawLogObj.find(rawLog => rawLog.success);
        if (rawLogObj) {
            result = 'success';
        } else {
            result = 'fail';
            error = rawLogObj.message;
        }
    } else {
        if (rawLogObj.success) {
            result = 'success';
        } else {
            result = 'fail';
            error = rawLogObj.message;
        }
    }
    return {
        'result': result,
        'hash': response.txhash,
        'error': error
    };
}

function transfer(from, to, amount, mneString, fee) {
    let realAmount = jtToAjtFixed(amount);

    const ecpairPriv = getECPairPriv(mneString);
    return just.getAccounts(from).then(data => {
        let stdSignMsg = just.NewStdMsg({
            type: 'cosmos-sdk/MsgSend',
            from_address: from,
            to_address: to,
            amountDenom: commonConstants.main_coin_denom,
            amount: realAmount,
            feeDenom: commonConstants.main_coin_denom,
            fee: jtToAjtFixed(fee),
            gas: 200000,
            memo: '',
            account_number: data.result.value.account_number,
            sequence: data.result.value.sequence
        });

        const signedTx = just.sign(stdSignMsg, ecpairPriv);
        return just.broadcast(signedTx);
    }).then(response => {
        return processTxRes(response);
    }).catch(error => {
        return processTxRes(error);
    });
}

function delegate(delegatorAddr, validatorAddr, amount, mneString, fee) {
    let realAmount = jtToAjtFixed(amount);

    const ecpairPriv = getECPairPriv(mneString);
    return just.getAccounts(delegatorAddr).then(data => {
        let stdSignMsg = just.NewStdMsg({
            type: 'cosmos-sdk/MsgDelegate',
            delegator_address: delegatorAddr,
            validator_address: validatorAddr,
            amountDenom: commonConstants.main_coin_denom,
            amount: realAmount,
            feeDenom: commonConstants.main_coin_denom,
            fee: jtToAjtFixed(fee),
            gas: 200000,
            memo: '',
            account_number: data.result.value.account_number,
            sequence: data.result.value.sequence
        });
        const signedTx = just.sign(stdSignMsg, ecpairPriv);
        return just.broadcast(signedTx);
    }).then(response => {
        return processTxRes(response);
    }).catch(error => {
        return processTxRes(error);
    });
}

function undelegate(delegatorAddr, validatorAddr, amount, mneString, fee) {
    let realAmount = jtToAjtFixed(amount);

    const ecpairPriv = getECPairPriv(mneString);
    return just.getAccounts(delegatorAddr).then(data => {
        let stdSignMsg = just.NewStdMsg({
            type: 'cosmos-sdk/MsgUndelegate',
            delegator_address: delegatorAddr,
            validator_address: validatorAddr,
            amountDenom: commonConstants.main_coin_denom,
            amount: realAmount,
            feeDenom: commonConstants.main_coin_denom,
            fee: jtToAjtFixed(fee),
            gas: 200000,
            memo: '',
            account_number: data.result.value.account_number,
            sequence: data.result.value.sequence
        });
        const signedTx = just.sign(stdSignMsg, ecpairPriv);
        return just.broadcast(signedTx);
    }).then(response => {
        return processTxRes(response);
    });
}

function withdraw(delegatorAddr, validatorAddr, mneString, fee) {
    const ecpairPriv = getECPairPriv(mneString);
    return just.getAccounts(delegatorAddr).then(data => {
        let stdSignMsg = just.NewStdMsg({
            type: 'cosmos-sdk/MsgWithdrawDelegationReward',
            delegator_address: delegatorAddr,
            validator_address: validatorAddr,
            // amountDenom: commonConstants.main_coin_denom,
            // amount: realAmount,
            feeDenom: commonConstants.main_coin_denom,
            fee: jtToAjtFixed(fee),
            gas: 200000,
            memo: '',
            account_number: data.result.value.account_number,
            sequence: data.result.value.sequence
        });
        const signedTx = just.sign(stdSignMsg, ecpairPriv);
        return just.broadcast(signedTx);
    }).then(response => {
        return processTxRes(response);
    });
}

function vote(voter, proposalId, option, mneString, fee) {
    const ecpairPriv = getECPairPriv(mneString);
    return just.getAccounts(voter).then(data => {
        let stdSignMsg = just.NewStdMsg({
            type: 'cosmos-sdk/MsgVote',
            proposal_id: proposalId,
            voter: voter,
            option: option,
            feeDenom: commonConstants.main_coin_denom,
            fee: jtToAjtFixed(fee),
            gas: 200000,
            memo: '',
            account_number: data.result.value.account_number,
            sequence: data.result.value.sequence
        });
        const signedTx = just.sign(stdSignMsg, ecpairPriv);
        return just.broadcast(signedTx);
    }).then(response => {
        return processTxRes(response);
    });
}

function getAddrBalance(address) {
    return axios.get(`${url}/bank/balances/${address}`);
}

function getValidators() {
    return axios.get(`${url}/staking/validators`);
}

function getBondedValidators(address) {
    return axios.get(`${url}/staking/delegators/${address}/validators`);
}

function getAllProposals() {
    return axios.get(`${url}/gov/proposals`);
}

function getAddrVoting(address, page = 1, limit = 20) {
    return axios.get(`${url}/txs`, {
        params: {
            'message.action': 'vote',
            'message.sender': address,
            'page': page,
            'limit': limit
        }
    });
}

function getAddrDelegations(address, page = 1, limit = 20) {
    return axios.get(`${url}/txs`, {
        params: {
            'message.action': 'delegate',
            'message.sender': address,
            'page': page,
            'limit': limit
        }
    });
}

function getAddrReward(address) {
    return axios.get(`${url}/distribution/delegators/${address}/rewards`);
}

function getAddrRewardByValidator(address, validator) {
    return axios.get(`${url}/distribution/delegators/${address}/rewards/${validator}`);
}

function getAddrUndelegations(address, page = 1, limit = 20) {
    return axios.get(`${url}/txs`, {
        params: {
            'message.action': 'begin_unbonding',
            'message.sender': address,
            'page': page,
            'limit': limit
        }
    });
}

function getAddrTxSend(address, page = 1, limit = 20) {
    return axios.get(`${url}/txs`, {
        params: {
            'message.action': 'send',
            'message.sender': address,
            'page': page,
            'limit': limit
        }
    });
}

function getAddrTxRece(address, page = 1, limit = 20) {
    return axios.get(`${url}/txs`, {
        params: {
            'message.action': 'send',
            'transfer.recipient': address,
            'page': page,
            'limit': limit
        }
    });
}

function getAddrWithdraw(address, page = 1, limit = 20) {
    return axios.get(`${url}/txs`, {
        params: {
            'message.action': 'withdraw_delegator_reward',
            'transfer.recipient': address,
            'page': page,
            'limit': limit
        }
    });
}

export default {
    init,
    newAddress,
    transfer,
    delegate,
    undelegate,
    vote,
    withdraw,
    getAddrBalance,
    getValidators,
    getAddrDelegations,
    getAddrUndelegations,
    getBondedValidators,
    getAddrTxSend,
    getAddrTxRece,
    getAllProposals,
    getAddrVoting,
    getAddrReward,
    getAddrRewardByValidator,
    getAddrWithdraw,
    jtToAjtFixed,
    ajtToJt
}
