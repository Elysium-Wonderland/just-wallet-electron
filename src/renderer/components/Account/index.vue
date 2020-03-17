<template>
    <div class="Index">
        <div class="content">
            <div class="top">
                <router-link to="/home"><img src="../../assets/modalLogo.png" alt="" class="logo"/></router-link>
                <!--                <a :href="'/home'"><img src="../../assets/modalLogo.png" alt="" class="logo"/></a>-->
                <img src="../../assets/assets.png" alt="" class="assets"/>
            </div>
            <div class="main">
                <div class="left">
                    <img src="../../assets/assets.png" alt="" class="assets">
                    <div class="account">{{account.name}}
                    </div>
                    <div id="qrcode" class="qrcode"></div>
                    <vue-qr :text="account.address" :margin="0" :logoScale="0.3" :size="100"
                            v-if="account.address"></vue-qr>
                    <div class="address">
                        {{account.address}}
                        <button type="button"
                                v-clipboard:copy="account.address"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"><img src="../../assets/copy.png" alt="" class="copy"/>
                        </button>
                    </div>
                    <div class="transfer" @click="transferModal()"><img src="../../assets/jt.png" alt="" class="jt"/>
                        Wallet
                    </div>
                    <div class="Delegate" :class="{'active': clickDelegate}" @click="delegateModal()">Delegate</div>
                    <div class="Delegate" :class="{'active': clickUnlock}" @click="unlockModal()">Unlock</div>
<!--                    <div class="Delegate" :class="{'active': clickVote}" @click="voteModal()">Vote</div>-->
                    <div class="Delegate" :class="{'active': clickWithdraw}" @click="withdrawModal()">Withdraw</div>
                </div>
                <router-view/>
            </div>
        </div>
    </div>
</template>

<script>
    import vueQr from 'vue-qr'
    import db_constants from '../../constants/db';
    import indexedDb from '../../utils/indexedDb';
    import mnemonicUtils from "../../utils/mnemonicUtils";
    import justjs from "../../just/just";
    import cryptoJs from "crypto-js";

    export default {
        data() {
            return {
                clickDelegate: false,
                clickUnlock: false,
                clickVote: false,
                clickWithdraw: false,
                account: {
                    name: null,
                    qrcode: null,
                    address: null
                }
            };
        },
        mounted() {
            indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1).then((data, error) => {
                this.account.address = data.address;
                this.account.name = data.name;
            });
            this.getCurrentLink();
        },
        methods: {
            getCurrentLink() {
                let path = this.$route.path;
                if (path === '/index/delegate') {
                    this.clickDelegate = true;
                    this.clickUnlock = false;
                    this.clickVote = false;
                    this.clickWithdraw = false;
                } else if (path === '/index/unlock') {
                    this.clickDelegate = false;
                    this.clickUnlock = true;
                    this.clickVote = false;
                    this.clickWithdraw = false;
                } else if (path === '/index/vote') {
                    this.clickDelegate = false;
                    this.clickUnlock = false;
                    this.clickVote = true;
                    this.clickWithdraw = false;
                } else if (path === '/index/withdraw') {
                    this.clickDelegate = false;
                    this.clickUnlock = false;
                    this.clickVote = false;
                    this.clickWithdraw = true;
                } else {
                    this.clickDelegate = false;
                    this.clickUnlock = false;
                    this.clickVote = false;
                    this.clickWithdraw = false;
                }
            },
            transferModal() {
                this.clickDelegate = false;
                this.clickUnlock = false;
                this.clickVote = false;
                this.clickWithdraw = false;
                this.$router.push('/index/transaction')
            },
            delegateModal() {
                this.clickDelegate = true;
                this.clickUnlock = false;
                this.clickVote = false;
                this.clickWithdraw = false;
                this.$router.push('/index/delegate')
            },
            unlockModal() {
                this.clickDelegate = false;
                this.clickUnlock = true;
                this.clickVote = false;
                this.clickWithdraw = false;
                this.$router.push('/index/unlock')
            },
            voteModal() {
                this.clickDelegate = false;
                this.clickUnlock = false;
                this.clickVote = true;
                this.clickWithdraw = false;
                this.$router.push('/index/vote')
            },
            withdrawModal() {
                this.clickDelegate = false;
                this.clickUnlock = false;
                this.clickVote = false;
                this.clickWithdraw = true;
                this.$router.push('/index/withdraw')
            },
            onCopy: function (e) {
                this.$message({message: 'Copied', type: 'success'})
            },
            onError: function (e) {
                this.$message.error('Copied failed')
            }
        },
        components: {vueQr}
    };
</script>

<style type="text/css" scoped>
    .Index {
        background: #fafafa;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }

    .assets {
        width: 50px;
    }

    .Index .content {
        width: 1083px;
        margin: 0 auto;
    }

    .Index .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20px;
    }

    .Index .top .logo {
        width: 160px;
    }

    .Index .main {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .Index .main .left {
        width: 289px;
        border: 1px solid #ebebeb;
        background-color: #f6f7f9;
        height: calc(100vh - 90px);
        box-sizing: border-box;
        padding: 20px 0;
    }

    .Index .main .account {
        margin: 9px 0;
    }

    .edit, .copy {
        width: 14px;
    }

    .Index .main .qrcode {
        width: 100px;
    }

    .Index .main .address {
        width: 244px;
        border-radius: 5px;
        border: 1px solid #dddddd;
        background-color: rgba(0, 0, 0, 0.02);
        padding: 8px;
        word-break: break-all;
        font-size: 13px;
        margin: 10px auto;
    }

    .Index .main .address button {
        border: none;
        cursor: pointer;
    }

    .Index .main .address button:focus {
        outline: none;
    }

    .Index .main .transfer {
        margin-top: 10px;
        height: 42px;
        line-height: 42px;
        background-color: #999999;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .Index .main .jt {
        width: 24px;
        margin-right: 10px;
    }

    .Index .main .Delegate {
        height: 42px;
        line-height: 42px;
        color: #9100ff;
        font-family: Helvetica;
        cursor: pointer;
    }

    .Index .Delegate.active {
        background: #9100ff;
        color: #fff;
    }
</style>


