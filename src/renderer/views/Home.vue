<template>
    <div>
        <div class="Home">
            <img src='../assets/logo.png' alt="" class="logo">
            <div class="title">
                <p>{{title1}}</p>
                <p class="title2">{{title2}}</p>
            </div>
            <div class="btn">
                <button class="btn1" @click="importWallet()"><img src="../assets/importIcon.png" class="icon">Import
                    Wallet
                </button>
                <button class="btn2" @click="CreateWallet()"><img src="../assets/createIcon.png" class="icon">Create
                    Wallet
                </button>
            </div>
            <div class="btn_into">
                <button :class="!enterDisabled?'btn3':'btn3 btn_disable'" @click="enterWallet()"><img
                        src="../assets/importIcon.png" class="icon">Already have a wallet account. Open directly.
                </button>
            </div>
        </div>
        <!--import wallet-->
        <import-wallet ref="changeModal"/>
        <!--create wallet-->
        <create-wallet ref="createModal"/>
        <!--backup mnemonic-->
        <words-backup ref="backupModal" :mnemonic="mnemonic"/>
        <!--confirm mnemonic-->
        <check-backup ref="checkBackupModal" :mnemonic="mnemonic" :address="address" :encrypted-mne="encryptedMne" :name="account"/>
    </div>
</template>

<script>
    import ImportWallet from '../components/Modal/ImportWallet'
    import CreateWallet from '../components/Modal/CreateWallet'
    import WordsBackup from '../components/Modal/WordsBackup'
    import CheckBackup from '../components/Modal/CheckBackup'
    import indexedDb from "../utils/indexedDb";
    import db_constants from "../constants/db";

    export default {
        name: 'Home',
        data() {
            return {
                mnemonic: '',
                address: '',
                encryptedMne: '',
                account: '',
                title1: 'It would not be much of a universe',
                title2: 'if it wasn\'t home to the people you love',
                visible: false,
                enterDisabled: true
            }
        },
        methods: {
            importWallet() {
                this.$refs.changeModal.showModal();
            },
            CreateWallet() {
                this.$refs.createModal.showModal();
            },
            backUpWallet() {
                this.$refs.backupModal.showModal();
            },
            checkBackup() {
                this.$refs.checkBackupModal.showModal();
            },
            enterWallet() {
                if (!this.enterDisabled) {
                    this.$router.push("/index/transaction")
                }
            },
            getAccount() {
                return indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1);
            }
        },
        components: {
            ImportWallet,
            CreateWallet,
            WordsBackup,
            CheckBackup
        },
        mounted() {
            this.getAccount().then(account => {
                if (account && account.name && account.key && account.address) {
                    this.enterDisabled = false;
                }
            });
        },
    }
</script>

<style type="text/css" scoped>
    .Home {
        width: 100%;
        height: 100vh;
        background-image: url(../assets/bg.png);
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    .logo {
        width: 192px;
        margin-top: 120px;
        margin-bottom: 40px;
    }

    .title {
        color: #ffffff;
        font-family: "DIN Alternate";
        font-size: 25px;
        font-weight: 700;
        line-height: 30px;
        text-transform: uppercase;
    }

    .title p.title2 {
        font-size: 20px;
    }

    .btn {
        width: 400px;
        display: flex;
        align-items: center;
        margin: 40px auto 0 auto;
    }

    .btn_into {
        width: 400px;
        display: flex;
        align-items: center;
        margin: 20px auto 0 auto;
    }

    button {
        width: 175px;
        height: 30px;
        border-radius: 5px;
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    button:focus {
        outline: none;
    }

    button.btn1 {
        background-color: #6600ff;
        box-shadow: 0 1px 20px rgba(15, 42, 99, 0.18);
        margin-right: 20px;
    }

    button.btn2 {
        box-shadow: 0 1px 20px rgba(67, 15, 99, 0.31);
        background-color: #9900ff;
        margin-left: 20px;
    }

    button.btn3 {
        box-shadow: 0 1px 20px rgba(67, 15, 99, 0.31);
        background-color: #9900ff;
        margin-left: 50px;
        width: 300px;
    }

    button.btn_disable {
        cursor: default;
        background-color: #666666;
    }

    button .icon {
        width: 16px;
        height: 16px;
        margin-right: 10px;
    }
</style>
