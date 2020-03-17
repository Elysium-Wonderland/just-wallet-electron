<template>
    <modal title="Vote" :visible="showDialog" @onCancel="close" class="JtTransfer">
        <div slot="content">
            <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item label="Input proposal id" prop="proposalId">
                    <el-input type="text" v-model="proposalId" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-radio-group v-model="ruleForm.option">
                        <el-radio label="Yes">Yes</el-radio>
                        <el-radio label="No">No</el-radio>
                        <el-radio label="NoWithVeto">No With Veto</el-radio>
                        <el-radio label="Abstain">Abstain</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Input pin code" prop="code">
                    <el-input v-model="ruleForm.code" type="password" autocomplete="off"></el-input>
                </el-form-item>
                <ul class="fee">
                    <li><b>Miner fee </b> <span>0.005 JT</span></li>
                </ul>
                <el-form-item>
                    <div class="btn" @click="transfer('ruleForm')">Vote</div>
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
        name: 'Vote',
        data() {
            var validateProposalId = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Please input Proposal Id'))
                } else {
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
                    option: 'Yes',
                    code: ''
                },
                rules: {
                    proposalId: [
                        {validator: validateProposalId, trigger: 'blur'}
                    ],
                    code: [
                        {validator: validateCode, trigger: 'blur'}
                    ]
                },
                proposalId: ''
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
                    option: 'Yes',
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
                                const [pin, proposalId, option] = [this.ruleForm.code, this.proposalId, this.ruleForm.option];
                                const mneString = mnemonicUtils.decryptMnemonic(account.key, pin, account.name, account.address);
                                const address = justjs.newAddress(mneString);
                                this.showModal();
                                if (address !== account.address) {
                                    this.$message.error(`Vote failed: incorrect pin`);
                                    return;
                                }
                                return justjs.vote(account.address, proposalId, option, mneString, justConstant.fee)
                            }).then(res => {
                            if (res && res.result === 'success') {
                                this.$message.success("Vote success");
                                this.ruleForm = {
                                    option: 'Yes',
                                    code: ''
                                };
                                this.validatorAddr = '';
                            } else if (res && res.result !== 'success') {
                                this.$message.error(`Vote failed: ` + res.error);
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
