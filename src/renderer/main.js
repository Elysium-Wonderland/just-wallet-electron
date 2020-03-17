import Vue from 'vue';
import Vuex from 'vuex';
import ElementUI from 'element-ui';
import '@/styles/element-variables.scss';
import App from './App.vue';
import router from './router';

import Account from '../renderer/components/Account';
import Modal from '../renderer/components/Modal'
import VueClipboard from 'vue-clipboard2'
import justjs from './just/just';
import store from './store';
import config from './config/application';

localStorage.setItem('rpcUrl', config.rpcUrl);
localStorage.setItem('chainId', config.chainId);
justjs.init();

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(Vuex);
Vue.use(VueClipboard);


Vue.component('Account', Account);
Vue.component('modal', Modal);

new Vue({
  router,
  components: { App },
  store,
  template: '<App/>',
  created() {
    // Prevent blank screen in Electron builds
    this.$router.push('/')
  }
}).$mount('#app');
