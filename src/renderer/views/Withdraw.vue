<template>
    <div class="delegate">
        <div class="right_top">
            <div class="info_left">
                <span class="jtIcon"><img src="../assets/jt.png" alt="" class="jt" /></span>
                <span class="amount">
          <b>Total Rewards</b>
          <span>{{totalRewards}}</span>
        </span>
            </div>
        </div>
        <div class="card">
            Rewards
        </div>
        <div v-if="rewards.length === 0" class="noData">No Record</div>
        <ul class="delegateLists" v-if="rewards.length !== 0">
            <li v-for="(item,index) in rewards" :key="index" @click="clickSend(index)">
                <div>supernode: <b>{{item.displayAddr}}</b></div>
                <div>amount: <b>{{item.displayAmount}}</b></div>
            </li>
        </ul>
        <div class="records">
            History
        </div>
        <div>
            <el-table :data="txs" v-el-table-infinite-scroll="loadMoreSend" height="calc(100vh - 390px)" class="table" empty-text="No Record">
                <el-table-column prop="" label="Date" :formatter="dateFormat" width="150" align="center"></el-table-column>
                <el-table-column prop="txhash" label="Hash" align="center"></el-table-column>
                <el-table-column prop="tx.value.msg[0].value.validator_address" label="Supernode" align="center"></el-table-column>
                <el-table-column prop="" label="Amount" :formatter="amountFormat" width="80" align="center"></el-table-column>
            </el-table>
        </div>
        <withdraw-modal ref="withdrawModal"/>
    </div>

</template>

<script>
    import WithdrawModal from "@/components/Modal/Withdraw";
    import db_constants from '../constants/db';
    import indexedDb from '../utils/indexedDb';
    import justjs from '../just/just';
    import commonConstant from '../constants/common';
    import justConstant from '../constants/just';
    import mnemonicUtils from '../utils/mnemonicUtils';
    import BigNumber from "bignumber.js";
    import moment from "moment";
    import elTableInfiniteScroll from "el-table-infinite-scroll";

    export default {
        components: {
            WithdrawModal
        },
        directives: {
            'el-table-infinite-scroll': elTableInfiniteScroll
        },
        data() {
            return {
                txs: [],
                account: {
                    address: null,
                    encryptedMne: null
                },
                page: null,
                pageSize: commonConstant.pageSize,
                reward: {
                    address: null,
                    amount: null,
                    pin: null
                },
                rewards: [],
                totalRewards: 0,
                selectedValidatorAddr: ''
            }
        },
        mounted() {
            this.getTxs();
        },
        methods: {
            getAccount(){
                return indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1);
            },
            getInitPage() {
                return justjs.getAddrWithdraw(this.account.address, 1, 1)
                    .then(response => {
                        if (!response) return;
                        let data = response.data;
                        console.log(data);
                        let totalCount = data.total_count;
                        this.page = Math.ceil(totalCount / this.pageSize);

                    });
            },
            getTxsPage() {
                if (this.page <= 0) return null;
                return justjs.getAddrWithdraw(this.account.address, this.page, this.pageSize)
                    .then(response => {
                        if (!response) return;
                        let data = response.data;
                        console.log(data);
                        this.page --;
                        this.txs = this.txs.concat(data.txs.reverse());
                    });
            },
            getTxs() {
                this.getAccount()
                    .then(account => {
                        this.account = {address: account.address, encryptedMne: account.key};
                    })
                    .then(() => this.getTotalRewards())
                    .then(() => this.getInitPage())
                    .then(() => this.getTxsPage());
            },
            getTotalRewards() {
                justjs.getAddrReward(this.account.address).then(response => {
                    let data = response.data;
                    let rewards = data.result.rewards;
                    if (rewards && rewards.length) {
                        rewards.forEach(reward => {
                            let rewardArr = reward.reward;
                            let rewardObj = rewardArr.find(r => r.denom === justConstant.main_coin_denom);
                            if (!rewardObj) return;
                            let obj = {
                                displayAddr : reward.validator_address.substring(0, 25) + '...' + reward.validator_address.substring(44),
                                displayAmount : justjs.ajtToJt(rewardObj.amount, 2)
                            };
                            Object.assign(obj, reward);
                            this.rewards.push(obj);
                        });
                        let rewardArr = data.result.total;
                        let rewardObj = rewardArr.find(r => r.denom === justConstant.main_coin_denom);
                        if (!rewardObj) return;
                        this.totalRewards = justjs.ajtToJt(rewardObj.amount, 2);
                    }
                });
            },
            dateFormat(tx) {
                let date = tx.timestamp;
                return moment(date).format('YYYY-MM-DD hh:mm:ss');
            },
            amountFormat(tx) {
                // return justjs.ajtToJt(parseInt('97101642776710619723947912374927348934345ajt'), 2).toString();
                let events = tx.events;
                let transferEvent = events.find(e => e.type === 'transfer');
                if (!transferEvent) {
                    return 0;
                }
                let attributes = transferEvent.attributes;
                let amountAttr = attributes.find(a => a.key === "amount");
                if (!amountAttr) {
                    return 0;
                }
                let amount = amountAttr.value;
                if (amount) {
                    return justjs.ajtToJt(parseInt(amount), 2).toString();
                }
            },
            loadMoreSend() {
                this.getAccount()
                    .then(account => {
                        this.account = {address: account.address, encryptedMne: account.key};
                    })
                    .then(() => this.getTxsPage())
            },
            clickSend(index) {
                if (index === undefined || index === null) {
                    this.selectedValidatorAddr = 'All Supernodes';
                } else {
                    this.selectedValidatorAddr = this.rewards[index].validator_address;
                }
                this.$refs.withdrawModal.validatorAddr = this.selectedValidatorAddr;
                this.$refs.withdrawModal.showModal();
            }
        }
    };
</script>

<style type="text/css" scoped>
    .delegate {
        border-top: 1px solid #ebebeb;
        border-bottom: 1px solid #ebebeb;
        border-right: 1px solid #ebebeb;
        height: calc( 100vh - 90px);
        flex-grow: 1;
        background: #fff;
        text-align: left;
        width: 794px;
        box-sizing: border-box;
    }
    .right_top {
        display: flex;
        justify-content: space-between;
        padding: 20px;
        align-items: center;
    }
    .info_left {
        display: flex;
    }
    .jtIcon {
        margin-right: 10px;
    }
    .jt{
        width: 30px;
    }
    .amount {
        display: flex;
        flex-direction: column;
        text-align: left;
    }
    .amount span{
        font-size: 12px;
    }
    .info_btn button {
        color: #9100ff;
        border: 1px solid #9100ff;
        border-radius: 5px;
        background: #fff;
        padding: 2px 6px;
        cursor: pointer;
        /*width: 60px;*/
        height: 30px;
        font-size: 15px;
    }
    .info_btn button:nth-child(1){
        margin-right: 10px;
    }
    .info_btn button:focus{
        outline: none;
    }
    .card{
        border-bottom: 1px solid #ccc;
        height: 40px;
        line-height: 40px;
        padding-left: 10px;
        box-sizing: border-box;
    }
    .delegateLists {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 20px 73px 0 73px;
        height: 200px;
        overflow-y: auto;
    }
    .delegateLists li {
        width: 297px;
        height: max-content;
        box-shadow: 0 2px 20px rgba(204, 204, 204, 0.5);
        border-radius: 10px;
        background-color: #ffffff;
        box-sizing: border-box;
        padding: 20px;
        margin-bottom: 20px;
        cursor: pointer;
    }
    .delegateLists li div {
        color: #999;
    }
    .delegateLists li div a{
        color: #9100ff;
    }
    .delegateLists li div.sn{
        color: #4fd0f6;
        font-weight: bold;
    }
    .delegate .noData{
        height: 200px;
        line-height: 200px;
        text-align: center;
        color: #909399;
        font-size: 14px;
    }
    .records{
        text-align: left;
        border-bottom: 1px solid #ccc;
        padding: 0 10px;
        height: 40px;
        line-height: 40px;
        box-sizing: border-box;
    }
    .table:before{
        background: none;
    }
</style>


