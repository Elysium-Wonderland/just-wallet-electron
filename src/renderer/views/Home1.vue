<template>
  <div class="home-container">

    <button v-on:click="transfer()">transfer</button>
    <button v-on:click="delegate()">delegate</button>
    <button v-on:click="undelegate()">undelegate</button>
    <button v-on:click="vote()">vote</button>

    <a :href="'transaction'">tx</a>
    <a :href="'delegate'">delegate</a>
    <a :href="'unlock'">unlock</a>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import moment from "dayjs";
import { get, isEmpty } from "lodash";
import justjs from "../just/just";
import cryptoJs from "crypto-js";
import indexedDb from '../utils/indexedDb';
import mnemonicUtils from "../utils/mnemonicUtils";

export default {
  name: "Home",
  interval: null,
  data() {
    return {
      address: null,
      encryptedMne: null,
      pin: null
    }
  },
  computed: {
    ...mapState("basic", ["pool"]),
    ...mapState("blocks", { blockList: "list", lastHeight: "lastHeight" }),
    ...mapState("validators", { validatorList: "list" }),
    ...mapGetters("blocks", { blocksLastList: "lastList" }),
    ...mapGetters("transactions", { txLastList: "lastList" }),
    blockTime() {
      if (!this.blockList.length) return 0;
      const first = moment(this.blockList[0].header.time).unix();
      const last = moment(
        this.blockList[this.blockList.length - 1].header.time
      ).unix();
      return ((first - last) / this.blockList.length).toFixed(2);
    },
    bonded() {
      return (this.pool.bonded_tokens / Math.pow(10, 24)).toFixed(2);
    },
    bondedRatio() {
      if (isEmpty(this.pool)) {
        return 0;
      }
      const bondedStr = this.pool.bonded_tokens + "";
      const unbondedStr = this.pool.not_bonded_tokens + "";
      const bonded = bondedStr.slice(0, bondedStr.length - 18) - 0;
      const unbonded = unbondedStr.slice(0, unbondedStr.length - 18) - 0;
      return ((bonded * 100) / (bonded + unbonded)).toFixed(2);
    }
  },
  methods: {
    get,
    fetchData: function() {
      this.$store.dispatch("blocks/fetchList");
    },
    fetchLatestBlock() {
      this.$store.dispatch("blocks/fetchLatest");
    },
    transfer() {
      justjs.transfer('jt1kjskjst38m8zdgqwww4acghs26jycdnp3muka7', 'jt1rveur0299f7488shv2ajjv0veggev430q7cssa', 100, this.encryptedMne, this.pin, 0.005).
              then(res => console.log(res));
    },
    delegate() {
      justjs.delegate('jt1kjskjst38m8zdgqwww4acghs26jycdnp3muka7', 'jtvaloper1ltqefcdhlaj3dwpffz0qadu8hlh6xlltqpgenf', 1000, this.encryptedMne, this.pin, 0.005).
      then(res => console.log(res));
    },
    undelegate() {
      justjs.undelegate('jt1kjskjst38m8zdgqwww4acghs26jycdnp3muka7', 'jtvaloper1ltqefcdhlaj3dwpffz0qadu8hlh6xlltqpgenf', 1000, this.encryptedMne, this.pin, 0.005).
      then(res => console.log(res));
    },
    vote() {
      justjs.vote('5', 'jt1kjskjst38m8zdgqwww4acghs26jycdnp3muka7', 'No', mnemonic_deposit, 0.005).
      then(res => console.log(res));
    }
  },
  mounted: function() {

    // const mnemonic_deposit = mnemonicUtils.generateMnemonic();
    // const address = justjs.newAddress(mnemonic_deposit);
    // console.log('address', address);

    //加密并保存
    const pin = '12345678';
    this.pin = pin;
    const mnemonic_deposit = 'essence risk faculty prevent crawl coast dwarf elite drill notice sure onion size transfer shove polar spawn select mystery maze busy west flame aerobic';
    const address = justjs.newAddress(mnemonic_deposit);
    let name = 'test';
    const a = mnemonicUtils.encryptMnemonic1(mnemonic_deposit, pin, name, address);
    console.log('encrypted', a);
    indexedDb.saveIndexedDB('account', 'id', {id:1, key:a, address:address, name:name});

    indexedDb.findIndexedDB('account', 'id', 1).then(data => {
      console.log(data);
      // const mne = cryptoJs.AES.decrypt(data.key, pin).toString(cryptoJs.enc.Utf8);
      // const mne = mnemonicUtils.decryptMnemonic(data.key, pin, name, address);
      // const address = justjs.newAddress(mne.toString(cryptoJs.enc.Utf8));
      // this.address = address;
      // this.encryptedMne = data.key;
      // if (address !== data.address) {
      //   alert('incorrect pin');
      // }

      console.log('111decrypted', mne);

      console.log('address', address);
      justjs.getAddrBalance(address).then((data) => {
        console.log('balance', data)
      });
      justjs.getValidators().then(data => console.log('validators', data));
      justjs.getAddrDelegations(address).then(data => console.log('delegations', data));
      justjs.getAddrUndelegations(address).then(data => console.log('undelegations', data));
      justjs.getAddrTxSend(address).then(data => console.log('send', data));
      justjs.getAddrTxRece(address).then(data => console.log('receive', data));
    });


    // await this.$store.dispatch("basic/fetchPool");
    // await this.$store.dispatch("transactions/fetchTotalCount");
    // await this.$store.dispatch("validators/fetchAll", "bonded");
    // await this.$store.dispatch("transactions/fetchLastList");
    // this.fetchLatestBlock();
    // this.fetchData();
    // this.interval = setInterval(() => {
    //   this.fetchData();
    //   this.fetchLatestBlock();
    // }, 5 * 1000);
  },
  beforeDestroy: function() {
    clearInterval(this.interval);
    this.interval = null;
  }
};
</script>

<style>

</style>

