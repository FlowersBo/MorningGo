// const ApiRootUrl = 'https://w3.morninggo.cn/';
// const ApiRootUrl = 'http://192.168.31.104:8080/morninggo_app_http_war/';
const ApiRootUrl = 'http://192.168.126.228:8080/morninggo_app_http_war/';//中划线
module.exports = {
    RefreshAuth: ApiRootUrl + 'chuwugui/user/refresh_auth', //刷新授权
    Login: ApiRootUrl + 'chuwugui/user/auth', //登录授权
    VerificationCode: ApiRootUrl + 'chuwugui/user/smscode', //验证码

    Info: ApiRootUrl + 'chuwugui/user/info', //用户信息


    DeviceList: ApiRootUrl + 'chuwugui/device/devicelists', //设备列表
    // AlarmList: ApiRootUrl + 'chuwugui/device/alarmlist', //设备报警

    OrderList: ApiRootUrl + 'chuwugui/order/orderlist', //订单列表
    // OrderDetail: ApiRootUrl + 'chuwugui/order/orderdetail', //订单详情


    yesterdayData: ApiRootUrl + 'chuwugui/report/yesterdayData',
    lastSevendaysData: ApiRootUrl + 'chuwugui/report/lastSevendaysData',
    lastMonthData: ApiRootUrl + 'chuwugui/report/lastMonthData',
    lastTwoMonthData: ApiRootUrl + 'chuwugui/report/lastTwoMonthData',
}