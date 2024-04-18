// pages/answer/answer.js
Page({
  data: {
      select:"",
      status:"",
      list:[],
      pageNumber:0,
      optionList:["A","B","C","D"],
      successNum:0,
      failNum:0,
      correct:"",
      correct_status:"",
      start:""
  },
  selectAnswer(e){
    // 1. 用户选择的是什么选项
    //optionItem必须是e.currentTarget.dataset里存在的属性
    const { optionItem } = e.currentTarget.dataset;
    // 2. 这个选项是错误的还是正确
    // 给用户提示，进行背景颜色的替换
    const answer = this.data.list[this.data.pageNumber].answer;
    if(optionItem === answer){
      this.setData({
        select: optionItem,
        status: "success",
        successNum: this.data.successNum + 1
      })
    }else{
      this.setData({
        select: optionItem,
        status: "fail",
        failNum: this.data.failNum + 1
      }),
      this.setData({
        correct: answer,
        correct_status: "success"
      })
    }
    // 跳转到下一个题目
    if(this.data.pageNumber === this.data.list.length - 1)
    {
      wx.showModal({
        title: '恭喜你',
        content: this.data.failNum==0?'所有题全对':'你已完成所有题目，共答对'+this.data.successNum+'道题,共答错'+this.data.failNum+'到题',
        showCancel: false,
        success: ()=>{
          // 当前用户的昵称
          // 当前用户的头像
          // 本次答对的题目数量
          // 本次答题结束的时间
          const {avatarUrl,nickName} = wx.getStorageSync('userInfo')
          const num = this.data.successNum;
          const endTime = new Date().getTime();
           // 计算时间差（单位：毫秒）
          const timeDiff = endTime - this.data.start;
          // 将毫秒转换为秒
          const seconds = timeDiff / 1000;
          //console.log("9999999999999999: ",seconds)
          //需要数据和用户相关联，所以要获取openId，openId是用户的唯一标识
          const openid = wx.getStorageSync('openId');
          const score = this.calculateScore(num,seconds);
          console.log("刚获取的用户的openid：",openid)
          wx.request({
            url: 'http://localhost:8080/getSuccessNum',
            method: 'GET',
            data: {
              open_id: openid
            },
            success: function(res) {
              //console.log(res)
              if(!res.data){
                wx.request({
                  url: 'http://localhost:8080/addData', // 后端 API 接口地址
                  method: 'POST',
                  header: {
                    'Content-Type': 'application/json'
                  },
                  data: {
                    // 前端发送的数据，假设为一个对象
                    data: {
                      // 要添加的数据
                      avatarUrl: avatarUrl,
                      nickName: nickName,
                      successNum: num,
                      endTime:endTime,
                      howLong:seconds,
                      openId:openid
                    },
                  },
                  success: (res) => {
                    console.log(res.data); // 输出后端返回的结果
                  },
                  fail: (error) => {
                    console.error(error);
                  },
                });
              }else{
                if(res.data.successNum < num 
                  || (res.data.successNum===num && res.data.score < score)){
                    //修改
                    wx.request({  
                      url: 'http://localhost:8080/updateSuccessNum',
                      method: 'GET',
                      data: {
                        open_id: openid,
                        newSuccessNum: num,
                        newEndTime:endTime,
                        howLong:seconds
                      },
                      success: res => {
                        // 请求成功处理逻辑，根据后端接口返回的数据进行处理
                        console.log(res.data);
                        // wx.showToast({
                        //   title: 'Success: success_num updated successfully.',
                        //   icon: 'success',
                        //   duration: 2000
                        // });
                      },
                      fail: err => {
                        console.error(err);                     
                      }
                    });
                }
              }
            },
            fail: function(err) {
              console.error('Failed to get success number: ' + err);
            }
          });
          //存入数据库
          // console.log(avatarUrl)
          // console.log(nickName)
          // console.log(num)
          // console.log(endTime)
          // console.log(seconds)
          // console.log(openid)
          //console.log('时间差（秒）：', seconds);
          wx.navigateTo({
            url: '../index/index',
          },2000)
          // wx.redirectTo({
          //   url: '../index/index',
          // })
        }
      })
    }else{
      setTimeout(()=>{
        this.setData({
          pageNumber : this.data.pageNumber + 1,
          status: "",
          select: "",
          correct:"",
          correct_status:""
        })
      },500)
    }
  },
  // 计算得分的函数
  calculateScore: function(correctAnswers, seconds) {
    let score = 0.0;
    score = correctAnswers * 10 - (10-correctAnswers) * 5 - seconds * 0.1;
    score = Math.round(score * 100) / 100; //精确到小数点后两位，并四舍五入，跟数据库对应上 Math.round(68.2253 * 100) / 100  ==> 68.23
    return score;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      //从mysql获取10条数据
      this.getQuestionList();
  },
  
  getQuestionList: function () {
    this.data.start = new Date().getTime();
    wx.request({
      url: 'http://localhost:8080/questionList',
      method: 'GET',
      success: (res) => { // 使用箭头函数来保持上下文
        console.log(res.data); // 在控制台打印返回的数据
        // 使用 this.setData 来设置页面数据
        // 原始字符串
       // var option = res.data[0].option;
        let dataArray = res.data;
        // 遍历数组中的每个对象并处理
        dataArray.forEach(obj => {
          // 获取当前对象的 option 属性值
          let optionString = obj.option;
          // 去掉最外层的双引号
          //后台传过来的["北京", "上海", "广州", "成都"]是字符串类型，要转为数组类型
          let optionArray = JSON.parse(optionString);
          // 输出去掉最外层双引号后的 option 属性值
          obj.option = optionArray;
        });
        this.setData({
          // list: [{id: 1, title: "什么是首都？", option: ["北京", "上海", "广州", "成都"], answer: "A"}]
          list:res.data
        });
      },
      fail: function (err) {
        console.error('请求失败', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})