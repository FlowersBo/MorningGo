import * as echarts from '../../component/ec-canvas/echarts';
import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
import * as util from '../../utils/util';
let that;

function getLineOption(chart, leftData, rightData, dateTitle) {
  console.log('调用了')
  var option = {
    title: {
      text: dateTitle + '销售额(订单量)',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#333'
      }
    },
    color: ["#BB0012", "#0042BB"],
    legend: {
      data: ['销售额(元)', '订单量(次)'],
      top: 22,
      left: 'center',
      backgroundColor: '#fff',
      z: 100,
      selectedMode: true,
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '1%',
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: leftData[0],
      // show: false //是否显示X轴
    },
    yAxis: [{
        name: '销售额(元)',
        nameTextStyle: {
          color: '#BB0012',
          fontStyle: 'italic',
          fontSize: '12',
          verticalAlign: 'middle',
        },
        type: 'value',
        data: leftData[0],
        splitLine: {
          show: false //Y轴分割线
        }
      },
      {
        name: '订单量(次)',
        nameTextStyle: {
          color: '#0042BB',
          fontStyle: 'italic',
          fontSize: '12',
          verticalAlign: 'middle',
        },
        type: 'value',
        data: rightData[0],
        splitLine: {
          show: false
        }
      }
    ],
    series: [{
        name: '销售额(元)',
        smooth: false,
        type: 'line',
        data: leftData[1],
        color: '#BB0012',
      },
      {
        name: '订单量(次)',
        symbolSize: 4,
        color: '#0042BB',
        yAxisIndex: 1,
        data: rightData[1],
        type: 'line',
      }
    ]
  };
  chart.setOption(option);
  return chart;
};

Page({
  data: {
    loadText: '加载中...',
    info: {
      reportGenres: ['销售日报', '销售月报'],
      dateRange: [
        ['昨日', '近7天'],
        ['前一个月', '前两个月'],
      ],
    },
    reportTotal: {
      '销售额（元）': 0,
      '订单量（次）': 0
    },
    reportDetail: {
      titles: ['点位', '销售额', '订单量', '占比'],
      titleUrls: ['', '../../assets/img/arrow.png', '../../assets/img/arrow.png', ''],
    },
    dateRange: 0,
    reportGenreindex: 0, //日/月报切换index
    dateRangeindex: 0, //天/月数切换index

    pageIndex: 1,
    pageSize: 10,
    pointDetaillyDate: '',
    isSaleAmountSort: false,
    isSaleCountSort: false,
    salesVolumeSort: '', //销售额序列
    orderQuantitySort: '', //订单量序列
    pointTotal: 0,
    serchContent: '',
    pointsData: [], //列表
    isFlag: false,
    isShow: false, //echarts显示/隐藏
    ec: {
      lazyLoad: true // 延迟加载
    },
  },

  onLoad: function () {
    that = this;
    // const query = wx.createSelectorQuery().in(this)
    // query.selectAll('.custom').boundingClientRect(function (res) {
    //   const customHeight = res[0].height;
    //   that.setData({
    //     customHeight: customHeight
    //   })
    // }).exec()
    let dateRange = that.data.dateRange;
    // this.renderChart(dateRange);
    that.setData({
      isShow: false
    })
    this.renderReport(dateRange);
    this.renderTransactionSummation(dateRange);
  },

  onShow: function () {

  },
  // 切换日/月报
  selectedReportGenres: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let dateRangeindex = that.data.dateRangeindex;
    let dateRange = parseInt('' + index + dateRangeindex);
    // let reportDetail = that.data.reportDetail;
    // reportDetail.titleUrls[1] = '../../assets/img/arrow.png';
    // reportDetail.titleUrls[2] = '../../assets/img/arrow.png';
    this.setData({
      reportGenreindex: index,
      dateRange: dateRange,
      'push.pullText': '',
      serchContent: '',
      // reportDetail: reportDetail,
    });
    this.renderTransactionSummation(dateRange);
    // this.renderChart(dateRange);
    this.renderReport(dateRange);
  },

  // 切换天/月数
  selectedDateRange: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let reportGenreindex = that.data.reportGenreindex;
    let dateRange = parseInt('' + reportGenreindex + index);
    // let reportDetail = that.data.reportDetail;
    // reportDetail.titleUrls[1] = '../../assets/img/arrow.png';
    // reportDetail.titleUrls[2] = '../../assets/img/arrow.png';
    this.setData({
      dateRange: dateRange,
      dateRangeindex: index,
      'push.pullText': '',
      serchContent: '',
      // reportDetail: reportDetail,
    });
    this.renderTransactionSummation(dateRange);
    // this.renderChart(dateRange);
    this.renderReport(dateRange);
  },

  // 时间段计算
  renderTransactionSummation: function (dateRange = 0) {
    let pointReportDate = new Date();
    let pointSummationReportDate = new Date();
    this.setData({
      loadText: '加载中...',
    })
    if (dateRange === 0) {
      pointReportDate.setDate(pointReportDate.getDate() - 1);
      let startDate = util.customFormatTime(pointReportDate);
      let endDate = util.customFormatTime(pointReportDate);

      let pointDetaillyDate = util.customFormatOnlyMonthDay(pointReportDate);
      this.setData({
        pointDetaillyDate: pointDetaillyDate,
      });
    }

    if (dateRange === 1) {
      pointReportDate.setDate(pointReportDate.getDate() - 1);
      let endDate = util.customFormatTime(pointReportDate);
      let pointDetaillyEndDate = util.customFormatOnlyMonthDay(pointReportDate);

      pointReportDate.setDate(pointReportDate.getDate() - 7);
      let startDate = util.customFormatTime(pointReportDate);
      let pointDetaillyStartDate = util.customFormatOnlyMonthDay(pointReportDate);

      let pointDetaillyDate = pointDetaillyStartDate + '~' + pointDetaillyEndDate;
      this.setData({
        pointDetaillyDate: pointDetaillyDate,
      });
    }

    if (dateRange === 10) {
      pointSummationReportDate.setMonth(pointSummationReportDate.getMonth() - 1);
      let endDateReportTotal = util.customFormatTime(pointSummationReportDate);
      let pointDetaillyEndDate = util.customFormatOnlyMonth(pointSummationReportDate);

      pointSummationReportDate.setMonth(pointSummationReportDate.getMonth());
      let startDateReportTotal = util.customFormatTime(pointSummationReportDate);
      let pointDetaillyStartDate = util.customFormatOnlyMonth(pointSummationReportDate);

      let pointDetaillyDate = pointDetaillyStartDate;
      this.setData({
        pointDetaillyDate: pointDetaillyDate,
      });
    }

    if (dateRange === 11) {
      pointSummationReportDate.setMonth(pointSummationReportDate.getMonth() - 1);
      let endDateReportTotal = util.customFormatTime(pointSummationReportDate);
      let pointDetaillyEndDate = util.customFormatOnlyMonth(pointSummationReportDate);

      pointSummationReportDate.setMonth(pointSummationReportDate.getMonth() - 1);
      let startDateReportTotal = util.customFormatTime(pointSummationReportDate);
      let pointDetaillyStartDate = util.customFormatOnlyMonth(pointSummationReportDate);

      let pointDetaillyDate = pointDetaillyStartDate + '~' + pointDetaillyEndDate;
      this.setData({
        pointDetaillyDate: pointDetaillyDate,
      });
    }
  },

  // 数据
  renderReport: function (dateRange = 0, pointName = '', pageIndex = 1, pointsData = []) {
    let that = this;
    let salesVolumeSort = that.data.salesVolumeSort; //排序按销售额为升序
    let orderQuantitySort = that.data.orderQuantitySort; //默认订单量升序
    let pageSize = that.data.pageSize;
    let pointTotal = that.data.pointTotal;
    let reportTotal = that.data.reportTotal;
    let reportDetail = that.data.reportDetail;

    this.setData({
      loadText: '加载中...',
    })

    let data = {
      pageindex: pageIndex,
      pagesize: pageSize,
      salesVolumeSort: salesVolumeSort,
      orderQuantitySort: orderQuantitySort,
      pointName: pointName,
      id: wx.getStorageSync('userID'),
    };
    let apiUrl = '';
    if (dateRange === 0) {
      apiUrl = api.yesterdayData;
      that.setData({
        dayNumber: 1,
        isShow: false
      })
      reportDetail.titles.fill('占比', 3);
    } else if (dateRange === 1) {
      apiUrl = api.lastSevendaysData;
      that.setData({
        dayNumber: 7
      })
      reportDetail.titles.fill('占比', 3);
    } else if (dateRange === 10) {
      apiUrl = api.lastMonthData;
      reportDetail.titles.fill('出租率', 3);
    } else if (dateRange === 11) {
      apiUrl = api.lastTwoMonthData;
      reportDetail.titles.fill('出租率', 3);
    }
    mClient.wxGetRequest(apiUrl, data)
      .then(resp => {
        if (resp.data.code == '200') {
          pointsData = pointsData.concat(resp.data.data.list2);
          if (pointsData.length <= 0) {
            that.setData({
              isFlag: true
            })
          } else {
            that.setData({
              isFlag: false
            })
          }
          pointTotal = resp.data.data.total;
          if (resp.data.data.list[0]) {
            reportTotal['销售额（元）'] = resp.data.data.list[0].priceSum;
            reportTotal['订单量（次）'] = resp.data.data.allOrderCount;
          }
          let dateTitle = '';
          if (resp.data.data.lastSevenDaysDataAgency) {
            that.initGraph(resp.data.data.lastSevenDaysDataAgency, dateTitle = "近七天");
          } else if (resp.data.data.lastMonthDataAgency) {
            that.initGraph(resp.data.data.lastMonthDataAgency, dateTitle = "前一个月");
          } else if (resp.data.data.last2MonthDataAgency) {
            that.initGraph(resp.data.data.last2MonthDataAgency, dateTitle = "前两个月");
          }
          this.setData({
            pointsData: pointsData,
            pageIndex: pageIndex + 1,
            pointTotal: pointTotal,
            reportTotal: reportTotal,
            reportDetail: reportDetail
          });
        } else {
          wx.showToast({
            title: resp.data.message,
            duration: 2000,
            icon: 'none'
          })
        }
      })
      .catch(rej => {
        that.setData({
          isFlag: true
        })
      })
  },

  // echarts
  initGraph: function (lastSevenDaysDataAgency, dateTitle) {
    that.setData({
      isShow: true
    })
    console.log('折线图数据', lastSevenDaysDataAgency);
    let finishDatesWrap = [],
      sumPriceWrap = [],
      orderCountWrap = [];
    for (const key in lastSevenDaysDataAgency) {
      lastSevenDaysDataAgency[key].finishDates = util.customFormatOnlyMonthDay(lastSevenDaysDataAgency[key].finishDates);
      finishDatesWrap.push(lastSevenDaysDataAgency[key].finishDates);
      sumPriceWrap.push(lastSevenDaysDataAgency[key].sumPrice);
      orderCountWrap.push(lastSevenDaysDataAgency[key].orderCount);
    }
    let leftData = [],
      rightData = [];
    leftData.push(finishDatesWrap, sumPriceWrap);
    rightData.push(finishDatesWrap, orderCountWrap);
    console.log('销售额', leftData);
    console.log('订单量', rightData);
    if (lastSevenDaysDataAgency) {
      this.oneComponent = this.selectComponent('#mychart-dom-bar');
    }
    this.oneComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(chart);
      getLineOption(chart, leftData, rightData, dateTitle);
      return chart;
    });
  },

  //跳转统计饼图
  bindReportDetaill: function (e) {
    let point = e.currentTarget.dataset;
    wx.navigateTo({
      url: 'reportDetails/index',
      // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
      events: {
        // 被打开页面进行回调
        someEvent: function (data) {
          console.log(data)
        }
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          point
        })
      }

    })
  },

  //搜索查找
  bindPointSerch: function (e) {
    let dateRange = that.data.dateRange;
    let serchContent = e.detail.value;
    that.setData({
      'push.pullText': '',
      serchContent: serchContent
    })
    that.renderReport(dateRange, serchContent);
  },

  // 排序
  bindPointSort: function (e) {
    let that = this;
    let isSaleAmountSort = that.data.isSaleAmountSort;
    let isSaleCountSort = that.data.isSaleCountSort;
    let index = e.currentTarget.dataset.index;
    let dateRange = that.data.dateRange;
    let reportDetail = that.data.reportDetail;
    if (index === 1) {
      reportDetail.titleUrls[2] = '../../assets/img/arrow.png';
      if (isSaleAmountSort === false) {
        reportDetail.titleUrls[index] = '../../assets/img/arrow-h.png';
        this.setData({
          isSaleAmountSort: true,
          salesVolumeSort: 'asc',
          orderQuantitySort: '',
          reportDetail: reportDetail
        })
      } else {
        reportDetail.titleUrls[index] = '../../assets/img/arrow-l.png';
        this.setData({
          isSaleAmountSort: false,
          salesVolumeSort: 'desc',
          orderQuantitySort: '',
          reportDetail: reportDetail
        })
      }
    } else if (index === 2) {
      reportDetail.titleUrls[1] = '../../assets/img/arrow.png';
      if (isSaleCountSort === false) {
        reportDetail.titleUrls[index] = '../../assets/img/arrow-h.png';
        this.setData({
          isSaleCountSort: true,
          orderQuantitySort: 'asc',
          salesVolumeSort: '',
          reportDetail: reportDetail
        })
      } else {
        reportDetail.titleUrls[index] = '../../assets/img/arrow-l.png';
        this.setData({
          isSaleCountSort: false,
          orderQuantitySort: 'desc',
          salesVolumeSort: '',
          reportDetail: reportDetail
        })
      }
    } else {
      return;
    }

    this.renderReport(dateRange);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    let pointsData = that.data.pointsData;
    let pageIndex = that.data.pageIndex;
    let dateRange = that.data.dateRange;
    let pageSize = that.data.pageSize;
    let pointTotal = that.data.pointTotal;
    console.log('下一页', pageIndex);
    if (pointsData.length < pointTotal) {
      that.setData({
        'push.isLoading': true,
        'push.pullText': '正在加载',
        'push.loading': '../../resource/img/pull_refresh.gif',
      })
      that.renderReport(dateRange, '', pageIndex, pointsData);
      setTimeout(() => {
        that.setData({
          pageIndex: pageIndex,
          'push.isLoading': false,
          'push.pullText': '- 上拉加载更多 -',
          'push.loading': '../../resource/img/finish.png',
        })
      }, 1500)
    } else if ((pointTotal / pageSize) < pageIndex && pointTotal > 0) {
      that.setData({
        'push.isLoading': true,
        'push.pullText': '- 我也是有底线的 -'
      })
    }
  },

  // 刷新
  // refresh() {
  //   let dateRange = that.data.dateRange;
  //   that.setData({
  //     pageIndex: 1,
  //     pointsData: []
  //   })
  //   that.setData({
  //     'pull.isLoading': true,
  //     'pull.loading': '../../resource/img/pull_refresh.gif',
  //     'pull.pullText': '正在刷新',
  //     'push.pullText': '',
  //   })
  //   that.renderReport(dateRange);
  //   setTimeout(() => {
  //     that.setData({
  //       'pull.loading': '../../resource/img/finish.png',
  //       'pull.pullText': '刷新完成',
  //       'pull.isLoading': false
  //     })
  //   }, 1500)
  // },

  // toload() {
  //   let pointsData = that.data.pointsData;
  //   let pageIndex = that.data.pageIndex;
  //   let dateRange = that.data.dateRange;
  //   let pageSize = that.data.pageSize;
  //   let pointTotal = that.data.pointTotal;
  //   console.log('下一页', pageIndex);
  //   if (pointsData.length < pointTotal) {
  //     that.setData({
  //       'push.isLoading': true,
  //       'push.pullText': '正在加载',
  //       'push.loading': '../../resource/img/pull_refresh.gif',
  //     })
  //     that.renderReport(dateRange, '', pageIndex, pointsData);
  //     setTimeout(() => {
  //       that.setData({
  //         pageIndex: pageIndex,
  //         'push.isLoading': false,
  //         'push.pullText': '- 上拉加载更多 -',
  //         'push.loading': '../../resource/img/finish.png',
  //       })
  //     }, 1500)
  //   } else if ((pointTotal / pageSize) < pageIndex) {
  //     that.setData({
  //       'push.isLoading': false,
  //       'push.pullText': '- 我也是有底线的 -'
  //     })
  //   }
  // },

})