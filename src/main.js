// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import moment from 'moment';
import 'spectre.css/dist/spectre.min.css';
import store from './store';
import App from './App';

Vue.config.productionTip = false;

Vue.filter('fromNow', date => moment(date).fromNow());

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App },
});
