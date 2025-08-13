App({
  globalData: {
    userInfo: null,
    hasLogin: false,
    dailyCallCount: 0,
    maxDailyCalls: 10,
    lastCallDate: '',
    genderMode: 'female', // 'male' or 'female'
    userHeight: 0,
    userWeight: 0,
    apiKey: '',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
    // 初始化每日调用次数
    this.initDailyCallCount();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.hasLogin = true;
    }
  },

  // 初始化每日调用次数
  initDailyCallCount() {
    const today = new Date().toDateString();
    const lastCallDate = wx.getStorageSync('lastCallDate');
    const dailyCallCount = wx.getStorageSync('dailyCallCount') || 0;

    if (lastCallDate !== today) {
      // 新的一天，重置调用次数
      this.globalData.dailyCallCount = 0;
      this.globalData.lastCallDate = today;
      wx.setStorageSync('dailyCallCount', 0);
      wx.setStorageSync('lastCallDate', today);
    } else {
      this.globalData.dailyCallCount = dailyCallCount;
      this.globalData.lastCallDate = lastCallDate;
    }
  },

  // 检查是否可以调用AI
  canCallAI() {
    return this.globalData.hasLogin && this.globalData.dailyCallCount < this.globalData.maxDailyCalls;
  },

  // 增加AI调用次数
  incrementCallCount() {
    this.globalData.dailyCallCount++;
    wx.setStorageSync('dailyCallCount', this.globalData.dailyCallCount);
  },

  // 调用豆包AI接口
  async callAI(prompt) {
    if (!this.canCallAI()) {
      throw new Error('今日AI分析次数已用完，请明天再试');
    }

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: this.globalData.apiUrl,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.globalData.apiKey}`
          },
          data: {
            messages: [{
              content: prompt,
              role: 'user'
            }],
            model: 'doubao-seed-1-6-flash-250715'
          },
          success: resolve,
          fail: reject
        });
      });

      if (response.statusCode === 200 && response.data.choices) {
        this.incrementCallCount();
        return response.data.choices[0].message.content;
      } else {
        throw new Error('AI服务暂时不可用');
      }
    } catch (error) {
      console.error('AI调用失败:', error);
      throw error;
    }
  },

  // 用户登录
  login(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.hasLogin = true;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 用户登出
  logout() {
    this.globalData.userInfo = null;
    this.globalData.hasLogin = false;
    wx.removeStorageSync('userInfo');
  }
});