<template>
    <modal title="Delegate" :visible="showDialog" @onCancel="close" class="JtTransfer">
        <div slot="content">
            <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item label="Input supernode address" prop="address">
                    <el-input type="text" v-model="validatorAddr" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="Input amount" prop="count">
                    <el-input
                            autocomplete="off"
                            v-model="ruleForm.count">
                        <img slot="prefix" src="../../assets/jt.png" alt="" class="jtIcon">
                        <div slot="append"><b>JT</b></div>
                    </el-input>
                </el-form-item>
                <el-form-item label="Input pin code" prop="code">
                    <el-input v-model="ruleForm.code" type="password" autocomplete="off"></el-input>
                </el-form-item>
                <ul class="fee">
                    <li><b>Miner fee </b> <span>0.005 JT</span></li>
                </ul>
                <el-form-item>
                    <div class="btn" @click="transfer('ruleForm')">Delegate</div>
                </el-form-item>
            </el-form>
        </div>
    </modal>
</template>

<script>
    import indexedDb from "../../utils/indexedDb";
    import db_constants from "../../constants/db";
    import mnemonicUtils from "../../utils/mnemonicUtils";
    import justjs from "../../just/just";
    import justConstant from "../../constants/just";

    export default {
        name: 'Delegate',
        data() {
            var validateAddress = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Please input supernode address'))
                } else {
                    callback()
                }
            }
            var validateCount = (rule, value, callback) => {
                const rep = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/
                if (value === '') {
                    callback(new Error('Please input amount'))
                } else {
                    if (!rep.test(value)) {
                        return callback(new Error('Must be number'))
                    }
                    callback()
                }
            }
            var validateCode = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Please input pin code'))
                } else {
                    callback()
                }
            }
            return {
                showDialog: false,
                amount: '0.00',
                ruleForm: {
                    count: '',
                    code: ''
                },
                rules: {
                    address: [
                        {validator: validateAddress, trigger: 'blur'}
                    ],
                    count: [
                        {validator: validateCount, trigger: 'blur'}
                    ],
                    code: [
                        {validator: validateCode, trigger: 'blur'}
                    ]
                },
                validatorAddr: ''
            }
        },
        props: {
            visible: {
                type: Boolean
            },
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
            close() {
                this.ruleForm = {
                    count: '',
                    code: ''
                };
                this.showModal();
            },
            showModal() {
                this.showDialog = !this.showDialog
            },
            getAccount() {
                return indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1);
            },
            transfer(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.getAccount()
                            .then((account) => {
                                const [pin, toAddress, amount] = [this.ruleForm.code, this.validatorAddr, this.ruleForm.count];
                                const mneString = mnemonicUtils.decryptMnemonic(account.key, pin, account.name, account.address);
                                const address = justjs.newAddress(mneString);
                                this.showModal();
                                if (address !== account.address) {
                                    this.$message.error(`Delegate failed: incorrect pin`);
                                    return;
                                }
                                return justjs.delegate(account.address, toAddress, amount, mneString, justConstant.fee)
                            }).then(res => {
                            if (res && res.result === 'success') {
                                this.$message.success("Delegate success");
                                this.ruleForm = {
                                    address: '',
                                    count: '',
                                    code: ''
                                };
                                this.validatorAddr = '';
                            } else if (res && res.result !== 'success') {
                                this.$message.error(`Delegate failed: ` + res.error);
                            }
                        });
                    } else {
                        console.log('error submit!!')
                        return false
                    }
                })
            }
        }
    }
</script>

<style type="text/css" scoped>
    .jtIcon {
        width: 24px;
        margin-top: 8px;
    }

    .btn {
        margin-top: 30px;
        height: 40px;
        line-height: 40px;
        box-shadow: 0 1px 20px rgba(67, 15, 99, 0.31);
        border-radius: 5px;
        background-color: #9900ff;
        text-align: center;
        color: #fff;
        cursor: pointer;
    }

    ul.fee li {
        list-style: none;
        font-size: 13px;
    }

    ul.fee li span {
        color: #9900ff;
        font-weight: bold;
    }
</style>
