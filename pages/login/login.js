const app = getApp();

Page({
  data: {
    hasLogin: false,
    userInfo: null,
    dailyCallCount: 0,
    maxDailyCalls: 10,
    totalAnalysis: 0,
    loginDays: 0,
    genderMode: 'female',
    userHeight: '',
    userWeight: '',
    bodyInfoText: '未设置',
    showBodyModal: false,
    showGenderModal: false
  },

  onLoad() {
    this.initPageData();
  },

  onShow() {
    this.initPageData();
  },

  // 初始化页面数据
  initPageData() {
    const userInfo = app.globalData.userInfo;
    const genderMode = wx.getStorageSync('genderMode') || 'female';
    
    // 按性别加载身材信息
    const userHeight = wx.getStorageSync(`userHeight_${genderMode}`) || '';
    const userWeight = wx.getStorageSync(`userWeight_${genderMode}`) || '';
    
    this.setData({
      hasLogin: app.globalData.hasLogin,
      userInfo: userInfo,
      dailyCallCount: app.globalData.dailyCallCount,
      maxDailyCalls: app.globalData.maxDailyCalls,
      genderMode: genderMode,
      userHeight: userHeight,
      userWeight: userWeight,
      bodyInfoText: this.getBodyInfoText(userHeight, userWeight)
    });
    
    if (app.globalData.hasLogin) {
      this.loadUserStats();
    }
  },

  // 获取身材信息文本
  getBodyInfoText(height, weight) {
    if (height && weight) {
      return `${height}cm / ${weight}kg`;
    }
    return '未设置';
  },

  // 加载用户统计数据
  loadUserStats() {
    const totalAnalysis = wx.getStorageSync('totalAnalysis') || 0;
    const firstLoginDate = wx.getStorageSync('firstLoginDate');
    let loginDays = 0;
    
    if (firstLoginDate) {
      const daysDiff = Math.floor((Date.now() - firstLoginDate) / (1000 * 60 * 60 * 24));
      loginDays = daysDiff + 1;
    }
    
    this.setData({
      totalAnalysis,
      loginDays
    });
  },

  // 获取用户信息
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      
      // 保存用户信息
      app.login(userInfo);
      
      // 记录首次登录时间
      const firstLoginDate = wx.getStorageSync('firstLoginDate');
      if (!firstLoginDate) {
        wx.setStorageSync('firstLoginDate', Date.now());
      }
      
      this.setData({
        hasLogin: true,
        userInfo: userInfo
      });
      
      this.loadUserStats();
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将无法使用AI分析功能',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({
            hasLogin: false,
            userInfo: null,
            totalAnalysis: 0,
            loginDays: 0
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示身材信息弹窗
  showBodyInfoModal() {
    this.setData({ showBodyModal: true });
  },

  // 隐藏身材信息弹窗
  hideBodyInfoModal() {
    this.setData({ showBodyModal: false });
  },

  // 显示性别偏好弹窗
  showGenderModal() {
    this.setData({ showGenderModal: true });
  },

  // 隐藏性别偏好弹窗
  hideGenderModal() {
    this.setData({ showGenderModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 身高输入
  onHeightInput(e) {
    this.setData({ userHeight: e.detail.value });
  },

  // 体重输入
  onWeightInput(e) {
    this.setData({ userWeight: e.detail.value });
  },

  // 保存身材信息
  saveBodyInfo() {
    const { userHeight, userWeight, genderMode } = this.data;
    
    if (!userHeight || !userWeight) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (userHeight < 100 || userHeight > 250) {
      wx.showToast({
        title: '请输入合理的身高',
        icon: 'none'
      });
      return;
    }

    if (userWeight < 30 || userWeight > 200) {
      wx.showToast({
        title: '请输入合理的体重',
        icon: 'none'
      });
      return;
    }

    const height = parseInt(userHeight);
    const weight = parseInt(userWeight);
    
    app.globalData.userHeight = height;
    app.globalData.userWeight = weight;
    
    // 按性别保存身材信息，与其他页面保持一致
    wx.setStorageSync(`userHeight_${genderMode}`, height);
    wx.setStorageSync(`userWeight_${genderMode}`, weight);
    
    this.setData({ 
      showBodyModal: false,
      bodyInfoText: this.getBodyInfoText(height, weight)
    });
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 选择性别
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ genderMode: gender });
  },

  // 清除历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '将清除所有分析历史记录，此操作不可恢复',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('analysisHistory');
          wx.removeStorageSync('totalAnalysis');
          
          this.setData({ totalAnalysis: 0 });
          
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 页面隐藏时保存性别设置
  onHide() {
    if (this.data.genderMode !== wx.getStorageSync('genderMode')) {
      app.globalData.genderMode = this.data.genderMode;
      wx.setStorageSync('genderMode', this.data.genderMode);
    }
  }
});