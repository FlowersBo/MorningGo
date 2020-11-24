// pages/index/reportDetails/index.js
let that, eventChannel;
import * as util from '../../../utils/util';
import * as echarts from '../../../component/ec-canvas/echarts';
import * as api from '../../../config/api';
import * as mClient from '../../../utils/requestUrl';

function initChart(chart, dataItem) {
  console.log(dataItem);
  var option = {
    backgroundColor: "#fff",
    color: ["#C34B45", "#476A83", "#5BAFBA", "#91F2DE", "#FFDB5C", "#FF9F7F"],
    title: {
      text: '销售额' + '(' + that.data.point.dayTitle + ')占比',
      left: 'center',
      top: '2%',
      color: '#333'
    },
    legend: { //图例
      data: ['小柜', '中柜', '大柜'],
      top: '6%',
      left: '2%',
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
      formatter: "销售额(元) \n{b} : {c} ({d}%)",
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
      type: 'pie',
      minShowLabelAngle: '0',
      // roseType: 'area',//南丁格尔图
      // selectedMode: 'single',
      // selectedOffset: 5, //扇形偏移量
      data: dataItem,
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
    ec: {
      lazyLoad: true //初始化加载
    },
    isFlag: false,
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    const query = wx.createSelectorQuery().in(this)
    query.selectAll('.custom').boundingClientRect(res => {
      const customHeight = res[0].height;
      that.setData({
        customHeight: customHeight
      })
    }).exec()
    let date = new Date();
    date.setDate(date.getDate() - 1);
    let endDate = util.customFormatTime(date);
    date = util.customFormatTime(date);
    that.setData({
      date: date,
      endDate: endDate
    })
    eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      console.log(data.point);
      // wx.setNavigationBarTitle({
      //   title: data.point.pointname,
      // })
      if(data.point.daynumber===1){
        data.point.dayTitle='昨日'
      }else{
        data.point.dayTitle='近7天'
      }
      that.setData({
        point: data.point
      })
      if (data.point) {
        that.echartsFn(date);
      }
    });
    (function () {
      eventChannel.emit('someEvent', {
        data: '成功'
      });
    }())
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
  echartsFn: (date = '') => {
    let point = that.data.point;
    console.log(point)
    let data = {
      pointId: point.pointid,
      searchDate: date
    };
    let apiUrl = '';
    if (point.daynumber === 1) {
      apiUrl = api.salesRatioData;
    } else if (point.daynumber === 7) {
      apiUrl = api.salesRatioDataLastSevenDays;
    };
    mClient.wxGetRequest(apiUrl, data)
      .then((res) => {
        console.log('饼图', res.data);
        if (res.data.code == '200') {
          if (res.data.data.list.length > 0) {
            that.setData({
              isShow: true
            })
            that.initGraph(res.data.data.list);
          } else {
            that.setData({
              isShow: false
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
          that.setData({
            isFlag: true
          })
        }
      })
      .catch((rej) => {
        console.log('无法请求', rej);
        wx.showToast({
          title: '服务器忙，请稍后重试',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          isFlag: true
        })
      })
  },

  // echarts
  initGraph: function (dayList) {
    console.log('饼图数据', dayList);
    let dayDateWrap = [];
    for (const key in dayList) {
      let dayDate_item = {};
      console.log(dayList[key]);
      if (dayList[key].specifications === '0') {
        dayDate_item.name = '小柜';
        dayDate_item.value = dayList[key].priceSum;
        console.log('dayDate_item',dayDate_item)
        if (dayDate_item.value > 0) {
          dayDateWrap.push(dayDate_item);
        }
      } else if (dayList[key].specifications === '1') {
        dayDate_item.name = '中柜';
        dayDate_item.value = dayList[key].priceSum;
        if (dayDate_item.value > 0) {
          dayDateWrap.push(dayDate_item);
        }
      } else if (dayList[key].specifications === '2') {
        dayDate_item.name = '大柜';
        dayDate_item.value = dayList[key].priceSum;
        if (dayDate_item.value > 0) {
          dayDateWrap.push(dayDate_item);
        }
      }
    }
    if (dayDateWrap.length <= 0) {
      that.setData({
        isShow: false
      })
      return;
    }
    this.oneComponent = this.selectComponent('#mychart-dom-bar');
    this.oneComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(chart);
      initChart(chart, dayDateWrap); 
      return chart;
    });
  },

  toDayFn: (e) => {
    let day = e.currentTarget.dataset.day;
    let converedDate = new Date(Date.parse(that.data.date));
    if (day === '0') {
      converedDate.setDate(converedDate.getDate() - 1);
    } else {
      let beforDay = new Date(Date.parse(new Date));
      beforDay.setDate(beforDay.getDate() - 1);
      converedDate.setDate(converedDate.getDate() + 1);
      if (converedDate.valueOf() > beforDay.valueOf()) {
        return false
      }
    }
    let date = util.customFormatTime(converedDate);
    converedDate = util.customFormatTime(converedDate);
    that.setData({
      date: date,
    })
    that.echartsFn(date);
  },

  refresh() {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    date = util.customFormatTime(date);
    that.setData({
      date: date
    })
    that.setData({
      'pull.isLoading': true,
      'pull.loading': '../../resource/img/pull_refresh.gif',
      'pull.pullText': '正在刷新',
      'push.pullText': '',
    })
    setTimeout(() => {
      that.setData({
        'pull.loading': '../../resource/img/finish.png',
        'pull.pullText': '刷新完成',
        'pull.isLoading': false
      })
    }, 1500)
    that.echartsFn();
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