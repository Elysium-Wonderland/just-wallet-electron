<template>
    <div class="delegate">
        <div class="card">
            Delegate
        </div>
        <div v-if="validators.length === 0" class="noData">No Record</div>
        <ul class="delegateLists" v-if="validators.length !== 0">
            <li v-for="(item,index) in validators" :key="index" @click="clickSend(index)">
                <div class="sn">{{item.name}}</div>
                <div>voting Power: <b>{{item.power}}</b></div>
                <div>address: <b>{{item.displayAddr}}</b></div>
                <div>commission: <b>{{item.commission}}</b></div>
                <div>website: <a>{{item.website}}</a></div>
                <div>jailed: <b>{{item.jailed}}</b></div>
            </li>
        </ul>
        <div class="records">
            History
        </div>
        <div>
            <el-table :data="txs" v-el-table-infinite-scroll="loadMoreSend" height="calc(100vh - 390px)" class="table" empty-text="No Record">
                <el-table-column prop="" label="Date" :formatter="dateFormat" width="150" align="center"></el-table-column>
                <el-table-column prop="txhash" label="Hash" align="center"></el-table-column>
                <el-table-column prop="tx.value.msg[0].value.validator_address" label="Supernode"
                                 min-width="115" align="center"></el-table-column>
                <el-table-column prop="" label="Amount" :formatter="amountFormat" width="80" align="center"></el-table-column>
            </el-table>
        </div>
        <delegate-modal ref="delegateModal" />
    </div>

</template>

<script>
    import DelegateModal from '@/components/Modal/Delegate'
    import db_constants from '../constants/db';
    import indexedDb from '../utils/indexedDb';
    import justjs from '../just/just';
    import commonConstant from '../constants/common';
    import justConstant from '../constants/just';
    import mnemonicUtils from '../utils/mnemonicUtils';
    import BigNumber from 'bignumber.js';
    import elTableInfiniteScroll from 'el-table-infinite-scroll';
    import moment from "moment";

    export default {
        name: 'Delegate',
        components: {
            DelegateModal
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
                delegateValue: {
                    address: null,
                    amount: null,
                    pin: null
                },
                validators: [],
                selectedValidatorAddr: ''
            }
        },
        mounted() {
            this.getValidators();
            this.getTxs();
        },
        methods: {
            getAccount(){
                return indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1);
            },
            getInitPage() {
                return justjs.getAddrDelegations(this.account.address, 1, 1)
                    .then(response => {
                        if (!response) return;
                        let data = response.data;
                        console.log(data);
                        let totalCount = data.total_count;
                        this.page = Math.ceil(totalCount / this.pageSize);

                    });
            },
            getTxsPage() {
                console.log(this.page)
                if (this.page <= 0) return null;
                return justjs.getAddrDelegations(this.account.address, this.page, this.pageSize)
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
                    .then(() => this.getInitPage())
                    .then(() => this.getTxsPage());
            },
            getValidators() {
                justjs.getValidators().then(response => {
                    console.log("aaa", response);
                    let result = response.data.result;
                    result.forEach(res => {
                        let validator = {
                            address: res.operator_address,
                            displayAddr: res.operator_address.substring(0, 25) + '...' + res.operator_address.substring(44),
                            name: res.description.moniker,
                            commission: new BigNumber(res.commission.commission_rates.rate).toString(),
                            website: res.description.website,
                            power: justjs.ajtToJt(res.delegator_shares, 2),
                            jailed: res.jailed
                        };
                        this.validators.push(validator);
                    });
                });
            },
            dateFormat(tx) {
                let date = tx.timestamp;
                return moment(date).format('YYYY-MM-DD hh:mm:ss');
            },
            amountFormat(tx) {
                // debugger
                let amount = tx.tx.value.msg[0].value.amount;
                if (amount && amount.amount) {
                    return justjs.ajtToJt(amount.amount, 2).toString();
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
                this.selectedValidatorAddr = this.validators[index].address;
                this.$refs.delegateModal.validatorAddr = this.selectedValidatorAddr;
                this.$refs.delegateModal.showModal();
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


