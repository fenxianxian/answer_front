Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  toAnswer(){
    const userInfo = wx.getStorageSync('userInfo');
    if(userInfo){
      wx.navigateTo({
        url: '../answer/answer',
      })
    }else{
      wx.getUserProfile({
        desc: '获取用户基本信息',
        success:(res1)=>{
          // console.log(res);
          wx.login({
            success: res2 => {
              if (res2.code) {
                const code = res2.code;
                console.log('用户登录凭证：', code);
                // 发送登录凭证到服务器进行验证，并获取用户的 OpenID
                this.getUserOpenId(code);
                const { userInfo:{avatarUrl,nickName}} = res1;
                const userInfo = {
                  avatarUrl,
                  nickName,
                }
                wx.setStorageSync('userInfo', userInfo)
                wx.navigateTo({
                  url: '../answer/answer',
                })
              } else {
                console.error('登录失败！' + res2.errMsg);
              }
            },
            fail: err => {
              console.error('调用登录接口失败', err);
            }
          });
        }
      })
    }
  },
  getUserOpenId: function (code) {
    // 构造请求参数
    const requestData = {
      appid: 'wx4f346de1fae51089',
      secret: '1cdf7cf9294a9da7f194dbad1bf9ea0c',
      js_code: code,
      grant_type: 'authorization_code'
    };
    // 发送请求到微信服务器获取用户的 OpenID
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      data: requestData,
      success: res => {
        // 将用户的 OpenID 存储在后台数据库或者其他持久化存储中
        // ...
        const openid = res.data.openid;
        console.log('用户的 OpenID 是：', openid);
        wx.setStorageSync('openId', openid)
      },
      fail: err => {
        console.error('获取用户 OpenID 失败', err);
      }
    });
  },
  toRank(){
    wx.navigateTo({
      url: '../rank/rank',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    

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