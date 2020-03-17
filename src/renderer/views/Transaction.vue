<template>
  <div class="right">
    <div class="right_top">
      <div class="info_left">
        <span class="jtIcon"><img src="../assets/jt.png" alt="" class="jt" /></span>
        <span class="amount">
          <b>JT</b>
          <span>{{balance}}</span>
        </span>
      </div>
      <div class="info_btn">
        <button @click="clickSend()">Send</button>
      </div>
    </div>
    <div class="records">
      History
    </div>
    <div class="tabs">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="Send" name="send">
        <el-table :data="sendTxs" v-el-table-infinite-scroll="loadMoreSend" height="calc(100vh - 272px)" class="table" empty-text="No Record">
          <el-table-column prop="" label="Date" :formatter="dateFormat" width="150" align="center"></el-table-column>
          <el-table-column prop="txhash" label="Hash" align="center"></el-table-column>
          <el-table-column prop="tx.value.msg[0].value.to_address" label="To" min-width="115" align="center"></el-table-column>
          <el-table-column prop="" label="Amount" :formatter="amountFormat" width="80" align="center"></el-table-column>
        </el-table>
        </el-tab-pane>
        <el-tab-pane label="Receive" name="receive">
        <el-table :data="recvTxs" v-el-table-infinite-scroll="loadMoreSend" height="calc(100vh - 272px)" class="table" empty-text="No Record">
          <el-table-column prop="" label="Date" :formatter="dateFormat" width="150" align="center"></el-table-column>
          <el-table-column prop="txhash" label="Hash" align="center"></el-table-column>
          <el-table-column prop="tx.value.msg[0].value.from_address" label="From" min-width="115" align="center"></el-table-column>
          <el-table-column prop="" label="Amount" :formatter="amountFormat" width="80" align="center"></el-table-column>
        </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <transfer ref="transferModal" />
  </div>

</template>

<script>
  import Transfer from '@/components/Modal/Transfer'
  import db_constants from '../constants/db';
  import indexedDb from '../utils/indexedDb';
  import justjs from '../just/just'
  import commonConstant from '../constants/common';
  import justConstant from '../constants/just';
  import moment from 'moment';
  import elTableInfiniteScroll from 'el-table-infinite-scroll';

  export default {
    components: {
      Transfer
    },
    directives: {
      'el-table-infinite-scroll': elTableInfiniteScroll
    },
    data() {
      return {
        sendTxs: [],
        recvTxs: [],
        account: {
          address: null,
          encryptedMne: null
        },
        activeName: 'send',
        balance: null,
        sendPage: null,
        recvPage: null,
        pageSize: commonConstant.pageSize,
      }
    },
    mounted() {
      this.getTxs();
    },
    methods: {
      getAccount(){
        return indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1);
      },
      getSendInitPage() {
        return justjs.getAddrTxSend(this.account.address, 1, 1)
                .then(response => {
                  if (!response) return;
                  let data = response.data;
                  console.log(data);
                  let totalCount = data.total_count;
                  this.sendPage = Math.ceil(totalCount / this.pageSize);

                });
      },
      getSendTxs() {
        if (this.sendPage <= 0) return null;
        return justjs.getAddrTxSend(this.account.address, this.sendPage, this.pageSize)
                .then(response => {
                  if (!response) return;
                  let data = response.data;
                  console.log(data);
                  this.sendPage --;
                  this.sendTxs = this.sendTxs.concat(data.txs.reverse());
                });
      },
      getRecvInitPage() {
        return justjs.getAddrTxRece(this.account.address, 1, 1)
                .then(response => {
                  if (!response) return;
                  let data = response.data;
                  console.log(data);
                  let totalCount = data.total_count;
                  this.recvPage = Math.ceil(totalCount / this.pageSize);
                });
      },
      getRecvTxs() {
        if (this.recvPage <= 0) return null;
        return justjs.getAddrTxRece(this.account.address, this.recvPage, this.pageSize)
                .then(response => {
                  if (!response) return;
                  let data = response.data;
                  console.log(data);
                  this.recvPage--;
                  this.recvTxs = this.recvTxs.concat(data.txs.reverse());
                });
      },
      getTxs() {
        this.getAccount()
                .then(account => {
                  this.account = {address: account.address, encryptedMne: account.key};
                })
                .then(() => this.getBalance())
                .then(() => this.getSendInitPage())
                .then(() => this.getSendTxs())
                .then(() => this.getRecvInitPage())
                .then(() => this.getRecvTxs());
      },
      getBalance() {
        return justjs.getAddrBalance(this.account.address)
                .then(response => {
                  let result = response.data.result;
                  if (!result.length) {
                    this.balance = 0;
                    return;
                  }
                  let balanceRec = result.find(i => i.denom === justConstant.main_coin_denom);
                  if (balanceRec) {
                    this.balance = justjs.ajtToJt(balanceRec.amount, 2);
                  }
                })
      },
      dateFormat(tx) {
        let date = tx.timestamp;
        return moment(date).format('YYYY-MM-DD hh:mm:ss');
      },
      amountFormat(tx) {
        let amountArray = tx.tx.value.msg[0].value.amount;
        let amount = amountArray.find(amount => amount.denom === justConstant.main_coin_denom);
        if (amount && amount.amount) {
          return justjs.ajtToJt(amount.amount, 2).toString();
        }
      },
      loadMoreSend() {
        this.getAccount()
                .then(account => {
                  this.account = {address: account.address, encryptedMne: account.key};
                })
                .then(() => this.getSendTxs())
      },
      clickSend () {
        this.$refs.transferModal.showModal();
      }
    }
  };
</script>

<style type="text/css" scoped>
  .right {
    border-top: 1px solid #ebebeb;
    border-bottom: 1px solid #ebebeb;
    border-right: 1px solid #ebebeb;
    height: calc( 100vh - 90px);
    flex-grow: 1;
    background: #fff;
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
    width: 60px;
    height: 30px;
    font-size: 15px;
  }
  .info_btn button:nth-child(1){
    margin-right: 10px;
  }
  .info_btn button:focus{
    outline: none;
  }
  .records{
    text-align: left;
    border-bottom: 1px solid #ccc;
    padding: 0 10px;
    height: 40px;
    line-height: 40px;
    box-sizing: border-box;
  }
  .tabs{
    margin: 10px 0 0 0;
  }
  .table:before{
   background: none;
  }
</style>


