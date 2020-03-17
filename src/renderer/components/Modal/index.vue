<template>
    <div class="modal-backdrop" v-if="visible">
        <div class="modal">
            <div class="top">
                <img src="../../assets/modalLogo.png" alt="" class="logo">
                <img src="../../assets/close.png" alt="" @click="close" class="close">
            </div>
            <div class="title">
                {{title}}
            </div>
            <div class="bd">
                <slot name="content"></slot>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'modal',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            }
        },
        methods: {
            close() {
                this.$emit('onCancel')
            }
        }
    }
</script>
<style type="text/css">
    .modal-backdrop {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, .5);
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999999;
    }

    .modal {
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.7);
        background-color: #ffffff;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        border-radius: 6px;
        width: 400px;
        padding: 30px 30px 10px 30px;
    }

    .modal .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal .logo {
        width: 180px;
    }

    .modal .close {
        width: 18px;
        cursor: pointer;
    }

    .modal .bd {
        text-align: left;
    }

    .modal .title {
        font-size: 20px;
        font-weight: bold;
        text-align: left;
        margin: 14px 0;
    }
</style>
