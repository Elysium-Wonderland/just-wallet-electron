<template>
    <modal title="Create Wallet" :visible="showDialog" @onCancel="close" class="CreateWallet">
        <div slot="content">
            <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item label="Account name" prop="account">
                    <el-input v-model="ruleForm.account" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="Pin code(8 characters at least)" prop="pass">
                    <el-input v-model="ruleForm.pass" type="password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="Confirm pin code" prop="checkPass">
                    <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <div class="btn" @click="createWallet('ruleForm')">Create Wallet</div>
                </el-form-item>
            </el-form>
        </div>
    </modal>
</template>

<script>
    import justjs from '../../just/just';
    import mnemonicUtils from '../../utils/mnemonicUtils';
    import pinCode from "../../utils/pinCode";

    export default {

        name: 'CreateWallet',
        data() {
            let validateAccount = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Please input account name'));
                } else {
                    callback();
                }
            };
            let validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Please input pin code'))
                } else {
                    if (!pinCode.validatePin(value)) {
                        return callback(new Error('At least 8 characters including a number, a lowercase letter and a uppercase letter'))
                    }
                    if (this.ruleForm.checkPass !== '') {
                        this.$refs.ruleForm.validateField('checkPass')
                    }
                    callback()
                }
            };
            let validatePass2 = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Please input confirm pin code'))
                } else if (value !== this.ruleForm.pass) {
                    callback(new Error('Inconsistent with pin code'))
                } else {
                    callback()
                }
            };
            return {
                showDialog: false,
                ruleForm: {
                    pass: '',
                    checkPass: '',
                    account: ''
                },
                rules: {
                    account: [
                        {validator: validateAccount, trigger: 'blur'}
                    ],
                    pass: [
                        {validator: validatePass, trigger: 'blur'}
                    ],
                    checkPass: [
                        {validator: validatePass2, trigger: 'blur'}
                    ]
                }
            }
        },
        props: {
            visible: {
                type: Boolean
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
            close() {
                this.ruleForm = {
                    pass: '',
                    checkPass: '',
                    account: ''
                };
                this.showModal();
            },
            showModal() {
                this.showDialog = !this.showDialog
            },
            createWallet(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        const mnemonic = mnemonicUtils.generateMnemonic();
                        const address = justjs.newAddress(mnemonic);
                        const pin = this.ruleForm.pass;
                        const name = this.ruleForm.account;
                        const encryptedMne = mnemonicUtils.encryptMnemonic(mnemonic, pin, name, address);
                        this.$parent.CreateWallet();
                        this.$parent.backUpWallet();
                        this.$parent.mnemonic = mnemonic;
                        this.$parent.address = address;
                        this.$parent.encryptedMne = encryptedMne;
                        this.$parent.account = name;
                        this.ruleForm = {
                            pass: '',
                            checkPass: '',
                            account: ''
                        };
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
    .btn {
        margin-top: 10px;
        height: 40px;
        line-height: 40px;
        box-shadow: 0 1px 20px rgba(67, 15, 99, 0.31);
        border-radius: 5px;
        background-color: #9900ff;
        text-align: center;
        color: #fff;
        cursor: pointer;
    }
</style>
