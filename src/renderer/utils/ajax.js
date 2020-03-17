import axios from 'axios';
import config from '../config/application'

let baseURL = config.rpcUrl;
const $ajax = axios.create({
  baseURL
});

$ajax.interceptors.response.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

