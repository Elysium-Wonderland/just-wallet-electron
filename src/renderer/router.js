import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Home1 from './views/Home1.vue';
import Account from './components/Account/index';
import Transaction from './views/Transaction.vue';
import Delegate from './views/Delegate.vue';
import Unlock from './views/Unlock';
import Vote from './views/Vote';
import Withdraw from './views/Withdraw';
import indexedDb from './utils/indexedDb';
import db_constants from './constants/db';
Vue.use(Router);

let beforeEnterAccount = function (to, from, next) {
  indexedDb.findIndexedDB(db_constants.ACCOUNT_TABLE_NAME, db_constants.ACCOUNT_TABLE.id, 1)
      .then(account => {
        if (account && account.address && account.key && account.name) {
          next();
        } else {
          next({name: 'home'});
        }
      }).catch(() => {
        next({name: 'home'});
      })
};

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home1',
      name: 'home1',
      component: Home1
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/index',
      name: 'Index',
      component: Account,
      beforeEnter: (to, from, next) => {
        beforeEnterAccount(to, from, next);
      },
      children: [
        {
          path: '/index/transaction',
          name: 'Info',
          component: Transaction
        },
        {
          path: '/index/delegate',
          name: 'delegate',
          component: Delegate
        },
        {
          path: '/index/unlock',
          name: 'unlock',
          component: Unlock
        },
        {
          path: '/index/vote',
          name: 'vote',
          component: Vote
        },
        {
          path: '/index/withdraw',
          name: 'withdraw',
          component: Withdraw
        }
      ]
    },
    ]

});
