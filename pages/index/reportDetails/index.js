// pages/index/reportDetails/index.js
let that, eventChannel;
import * as util from '../../../utils/util';
import * as echarts from '../../../component/ec-canvas/echarts';
import * as api from '../../../config/api';
import * as mClient from '../../../utils/requestUrl';

function initChart(chart, dataItem) {
  var option = {
    backgroundColor: "#fff",
    color: ["#C23831", "#334B5C", "#61A0A8", "#91F2DE", "#FFDB5C", "#FF9F7F"],
    title: {
      text: '前一天销售额',
      left: 'center',
    },
    legend: { //图例
      data: ['小柜', '中柜', '大柜'],
      top: '5%',
      left: '5%',
      z: 100,
      selectedMode: false, //是否可选显示
      orient: 'vertical',
      textStyle: {
        fontStyle: 'oblique'
      }
    },
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: "销售额 \n{b} : {c} ({d}%)",
      // formatter: "{b} : {c} ({d}%)", //{a} <br/>
      // formatter: function (params) {
      //   console.log(params)
      //   var result = '';
      //   params.forEach(function (item) {
      //     result += item.marker + " " + item.seriesName + " : " + item.value + "</br>";
      //   });
      //   return result;
      // },
    },
    toolbox: {
      show: true,
      feature: {
        mark: {
          show: true
        }
      }
    },
    calculable: true,
    series: [{
      label: {
        normal: {
          fontSize: 12 //图显示字体大小
        }
      },
      data: dataItem,
      type: 'pie',
      radius: '60%',
      center: ['50%', '56%'],
      // radius: ['40%', '60%'],//设置环状图
    }]
  };
  chart.setOption(option);
  return chart;
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    dataItem: [{
      value: 45,
      name: '小柜'
    }, {
      value: 46,
      name: '中柜'
    }, {
      value: 60,
      name: '大柜'
    }],
    ec: {
      lazyLoad: true //初始化加载
    },
    isFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    const query = wx.createSelectorQuery().in(this)
    query.selectAll('.custom').boundingClientRect(function (res) {
      const customHeight = res[0].height;
      that.setData({
        customHeight: customHeight
      })
    }).exec()
    let date = new Date();
    date.setDate(date.getDate() - 1);
    date = util.customFormatTime(date);
    that.setData({
      date: date
    })
    eventChannel = this.getOpenerEventChannel();
    // eventChannel.on('acceptDataFromOpenerPage', function (data) {
    //   console.log(data.point);
    //   // wx.setNavigationBarTitle({
    //   //   title: data.point.pointname,
    //   // })
    //   that.setData({
    //     point: data.point
    //   })
    // });
    // // that.someEvent('成功');
    // (function () {
    //   console.log('成功')
    //   eventChannel.emit('someEvent', {
    //     data: ev
    //   });
    // }(ev))
  },
  someEvent: (ev) => {
    eventChannel.emit('someEvent', {
      data: ev
    });
  },
  //日期选择
  bindDateChange: (e) => {
    let date = e.detail.value;
    that.setData({
      date: date
    })

    that.echartsFn(date);
  },

  // 数据请求
  echartsFn: (date) => {
    let data = {
      date: date
    };
    mClient.wxGetRequest(api.a, data)
      .then((res) => {
        console.log('饼图',res.data)
        if (res.code == '200'){

        }else {
          wx.showToast({
            title: res.data.message,
            duration: 2000
          })
        }
      })
      .catch((rej) => {

      })
    that.initGraph();
  },

  // echarts
  initGraph: function (lastSevenDaysDataAgency) {
    that.setData({
      isShow: true
    })
    console.log('饼图数据', that.data.dataItem);
    let finishDatesWrap = [],
      sumPriceWrap = [],
      orderCountWrap = [];
    // for (const key in lastSevenDaysDataAgency) {
    //   lastSevenDaysDataAgency[key].finishDates = util.customFormatOnlyMonthDay(lastSevenDaysDataAgency[key].finishDates);
    //   finishDatesWrap.push(lastSevenDaysDataAgency[key].finishDates);
    //   sumPriceWrap.push(lastSevenDaysDataAgency[key].sumPrice);
    //   orderCountWrap.push(lastSevenDaysDataAgency[key].orderCount);
    // }
    // let dataItem = [];
    // dataItem.push(finishDatesWrap, sumPriceWrap);
    this.oneComponent = this.selectComponent('#mychart-dom-bar');
    console.log(this.oneComponent)
    this.oneComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(chart);
      initChart(chart, that.data.dataItem);
      return chart;
    });
  },

  toDayFn: (e) => {
    let day = e.currentTarget.dataset.day;
    let converedDate = new Date(Date.parse(that.data.date));
    if (day === '0') {
      converedDate.setDate(converedDate.getDate() - 1);
    } else {
      converedDate.setDate(converedDate.getDate() + 1);
    }
    let date = util.customFormatTime(converedDate);
    converedDate = util.customFormatTime(converedDate);
    that.echartsFn(date);
    that.setData({
      date: date,
    })
  },

  refresh() {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    date = util.customFormatTime(date);
    that.setData({
      date: date
    })
    if (that.data) {
      that.setData({
        'pull.isLoading': true,
        'pull.loading': '../../resource/img/pull_refresh.gif',
        'pull.pullText': '正在刷新',
        'push.pullText': '',
      })
      that.echartsFn();
      setTimeout(() => {
        that.setData({
          'pull.loading': '../../resource/img/finish.png',
          'pull.pullText': '刷新完成',
          'pull.isLoading': false
        })
      }, 1500)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})