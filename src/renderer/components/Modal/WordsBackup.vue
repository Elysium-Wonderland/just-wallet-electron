<template>
    <modal title="Backup Mnemonic" :visible="showDialog" @onCancel="confirm()" class="WordsBackup">
        <div slot="content">
            <ul class="lists">
                <li>It consists of 24 words, please copy and keep it in a safe place.</li>
                <li>100% is under your control, has been lost, cannot be retrieved!</li>
                <li>Do not save by screenshot or screen recording, pay attention to the order!</li>
            </ul>
            <div class="words">{{mnemonic}}</div>
            <div class="btn">
                <!--        <button class="btn1">Remind later</button>-->
                <button class="btn2" @click="confirm()">Next</button>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: 'WordsBackup',
        data() {
            return {
                showDialog: false,
            }
        },
        props: {
            visible: {
                type: Boolean
            },
            mnemonic: {
                type: String
            }
        },
        watch: {
            visible: {
                handler(newV) {
                    this.showDialog = newV
                },
                deep: true
            }
        },
        methods: {
            showModal() {
                this.showDialog = !this.showDialog
            },
            confirm() {
                this.showModal();
                this.$parent.checkBackup();
                // this.$router.push('/index/transaction')
            }
        }
    }
</script>

<style type="text/css" scoped>
    .WordsBackup {
        text-align: left;
    }

    .WordsBackup .lists li {
        color: #666666;
        font-family: Helvetica;
        font-size: 14px;
        line-height: 18px;
    }

    .WordsBackup .words {
        margin: 40px 0 20px 0;
        color: #333;
        font-weight: bold;
        font-family: Helvetica;
        padding: 10px;
        border-radius: 6px;
        border: 2px solid #ddd;
        line-height: 26px;
    }

    .WordsBackup .btn {
        /*display: flex;*/
        justify-content: space-between;
        align-items: center;
        /*text-align: right;*/
    }

    .WordsBackup .btn button {
        width: 133px;
        height: 40px;
        line-height: 40px;
        border-radius: 5px;
        margin-top: 20px;
        font-weight: 400;
        box-sizing: border-box;
        cursor: pointer;
    }

    .WordsBackup .btn button:focus {
        outline: none;
    }

    .WordsBackup .btn button.btn1 {
        border: 1px solid #9100ff;
        background: #fff;
        color: #9900ff;
    }

    .WordsBackup .btn button.btn2 {
        margin-top: 10px;
        height: 40px;
        line-height: 40px;
        box-shadow: 0 1px 20px rgba(67, 15, 99, 0.31);
        border-radius: 5px;
        background-color: #9900ff;
        text-align: center;
        color: #fff;
        cursor: pointer;
        width: 100%;
    }
</style>
