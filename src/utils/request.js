import axios from 'axios'

// 创建axios，赋给变量service
const service = axios.create();

/**
 * 请求接口前，做一些数据处理（请求拦截器）
 */
service.interceptors.request.use(function(config) {
    // 在发送请求之前做些什么
    // 后台需要前端这边传相关的参数（在请求头添加参数）
    // Tokey
    // userId
    // sui
    // 业务需求
    return config;
}, function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


/**
 * 请求接口后，返回数据进行拦截（响应拦截器）
 */
service.interceptors.response.use(function(response) {
    // 对响应数据做点什么
    return response;

}, function(error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default service;

/**
 * 使用export default时，但不能同时存在多个default。
 * 文件 import 不需要花括号，
 */