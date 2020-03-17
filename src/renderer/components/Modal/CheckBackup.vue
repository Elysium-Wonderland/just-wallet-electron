<template>
    <modal title="Please confirm your mnemonic words" :visible="showDialog" @onCancel="showDialog=false" class="CheckBackup">
        <div slot="content">
            <div class="tip">Please click on your mnemonic in order to ensure mnemonic verification success!</div>
            <ul class="wordLists">
                <li v-for="(word,index) in wordsList" :key="index" :class="{'active': checkWords.includes(word)}" @click="clickWord(index)">
                    {{word}}
                </li>
            </ul>
            <ul class="newWord">
                <li v-for="(word,index) in checkWords" :key="index" @click="cancelWord(index)">{{word}}</li>
            </ul>
            <div :class="success?'successMsg':'errorMsg'" v-show="showMsg">{{message}}</div>
            <div class="btn">
                <button @click="confirm()">Confirm</button>
            </div>
        </div>
    </modal>
</template>

<script>
    import indexedDb from '../../utils/indexedDb';
    export default {
        name: 'CheckBackup',
        data() {
            return {
                showDialog: false,
                // words: 'museum pill firm slow poem future soft spot hope stomach bachelor cave',
                wordsList: [],
                checkWords: [],
                message: '',
                success: false,
                showMsg: false
            }
        },
        props: {
            visible: {
                type: Boolean
            },
            mnemonic: {
                type: String
            },
            address: {
                type: String
            },
            encryptedMne: {
                type: String
            },
            name: {
                type: String
            }
        },
        watch: {
            visible: {
                handler(newV) {
                    this.showDialog = newV
                },
                deep: true
            },
            mnemonic: {
                handler(newV) {
                    this.wordsList = this.getArrRandomly(newV.split(' '));
                }
            }
        },
        methods: {
            showModal() {
                this.checkWords = [];
                this.showDialog = !this.showDialog
            },
            getArrRandomly(arr) {
                let len = arr.length;
                for (let i = len - 1; i >= 0; i--) {
                    let randomIndex = Math.floor(Math.random() * (i + 1));
                    let itemIndex = arr[randomIndex];
                    arr[randomIndex] = arr[i];
                    arr[i] = itemIndex;
                }
                return arr;
            },
            clickWord(i) {
                console.log('word', this.wordsList)
                this.checkWords.push(this.wordsList[i]);
                this.wordsList.splice(i, 1);
            },
            cancelWord(i) {
                this.wordsList.push(this.checkWords[i]);
                this.checkWords.splice(i, 1);
            },
            confirm() {
                if (this.mnemonic === this.checkWords.join(' ')){
                    this.message = 'Correct';
                    this.success = true;
                    this.wordsList = [];
                    this.checkWords = [];
                    indexedDb.saveIndexedDB('account', 'id', {
                            id: 1,
                            key: this.encryptedMne,
                            address: this.address,
                            name: this.name
                        })
                            .then(() => {
                                this.ruleForm = {
                                    pass: '',
                                    checkPass: '',
                                    account: ''
                                };
                                this.$router.push('/index/transaction');
                            })
                } else {
                    this.wordsList.splice(0, this.wordsList.length);
                    this.wordsList = this.getArrRandomly(this.mnemonic.split(' '));
                    this.checkWords = [];
                    this.message = 'Incorrect mnemonic, please retry!';
                    this.showMsg = true;
                    this.success = false;
                }
            }
        },
    }
</script>

<style type="text/css" scoped>
    .CheckBackup {
        text-align: left;
    }

    .CheckBackup .tip {
        width: 310px;
        color: #666666;
        font-family: Helvetica;
        font-size: 14px;
    }

    .CheckBackup .wordLists {
        list-style: none;
        display: flex;
        /*justify-content: space-between;*/
        align-items: center;
        flex-wrap: wrap;
        width: 400px;
        margin-top: 20px;
    }

    .CheckBackup .wordLists li {
        width: 90px;
        box-sizing: border-box;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 6px;
        text-align: center;
        margin: 0 5px 10px 5px;
        /*margin-bottom: 10px;*/
        cursor: pointer;
    }

    .CheckBackup .wordLists li.active {
        border: 1px solid #9900ff;
        color: #9900ff;
    }

    .CheckBackup .newWord {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        border: 1px solid #ccc;
        border-radius: 5px;
        min-height: 100px;
        padding: 10px;
    }

    .CheckBackup .newWord li{
        min-width: 20px;
        box-sizing: border-box;
        padding: 2px;
        text-align: center;
        margin-bottom: 10px;
        cursor: pointer;
    }

    .btn {
        width: 100%;
        margin-top: 20px;
    }

    .btn button {
        width: 100%;
        height: 40px;
        line-height: 40px;
        box-shadow: 0 1px 20px rgba(67, 15, 99, 0.31);
        border-radius: 5px;
        background-color: #9900ff;
        border: none;
        color: #fff;
        cursor: pointer;
    }

    .btn button:focus {
        outline: none;
    }

    .errorMsg {
        color: #F56C6C;
        font-size: 12px;
        line-height: 1;
        padding-top: 4px;
        top: 100%;
        left: 0;
    }

    .successMsg {
        color: #7FF868;
        font-size: 12px;
        line-height: 1;
        padding-top: 4px;
        top: 100%;
        left: 0;
    }
</style>
