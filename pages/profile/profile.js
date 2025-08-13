const app = getApp();

Page({
  data: {
    hasLogin: false,
    userInfo: null,
    dailyCallCount: 0,
    maxDailyCalls: 10,
    totalAnalysis: 0,
    favoriteCount: 0,
    favoriteOutfits: [],
    loginDays: 0,
    currentDate: '',
    wardrobeItemCount: 0,
    wardrobeData: {
      tops: [],
      bottoms: [],
      shoes: [],
      accessories: []
    },
    
    // 弹窗状态
    showSettingsModal: false,
    showStatsModal: false,
    showWardrobeModal: false,
    currentCategory: '',
    categoryTitle: '',
    newItemName: '',
    
    // 用户设置
    userHeight: '',
    userWeight: '',
    genderMode: 'female',
    

  },

  onLoad() {
    this.initPageData();
    this.loadWardrobeData();
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
    
    // 获取收藏的搭配
    const favoriteOutfits = wx.getStorageSync('favoriteOutfits') || [];
    
    this.setData({
      hasLogin: app.globalData.hasLogin,
      userInfo: userInfo,
      dailyCallCount: app.globalData.dailyCallCount,
      maxDailyCalls: app.globalData.maxDailyCalls,
      genderMode: genderMode,
      userHeight: userHeight,
      userWeight: userWeight,
      currentDate: new Date().toLocaleDateString(),
      favoriteOutfits: favoriteOutfits
    });
    
    // 加载衣橱数据
    this.loadWardrobeData();
    
    if (app.globalData.hasLogin) {
      this.loadUserStats();
    }
  },

  // 加载用户统计数据
  loadUserStats() {
    const totalAnalysis = wx.getStorageSync('totalAnalysis') || 0;
    const favoriteOutfits = wx.getStorageSync('favoriteOutfits') || [];
    const firstLoginDate = wx.getStorageSync('firstLoginDate');
    
    let loginDays = 0;
    if (firstLoginDate) {
      const daysDiff = Math.floor((Date.now() - firstLoginDate) / (1000 * 60 * 60 * 24));
      loginDays = daysDiff + 1;
    }
    
    this.setData({
      totalAnalysis,
      favoriteCount: favoriteOutfits.length,
      loginDays
    });
  },

  // 导航到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 查看收藏
  viewFavorites() {
    const favorites = wx.getStorageSync('favoriteOutfits') || [];
    if (favorites.length === 0) {
      wx.showToast({
        title: '暂无收藏搭配',
        icon: 'none'
      });
      return;
    }
    
    // 这里可以导航到收藏页面，或者显示收藏列表
    wx.showModal({
      title: '我的收藏',
      content: `您共收藏了 ${favorites.length} 套搭配方案`,
      showCancel: false
    });
  },

  // 查看历史
  viewHistory() {
    const analysisHistory = wx.getStorageSync('analysisHistory') || [];
    const outfitHistory = wx.getStorageSync('outfitHistory') || [];
    
    const totalHistory = analysisHistory.length + outfitHistory.length;
    
    if (totalHistory === 0) {
      wx.showToast({
        title: '暂无历史记录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '分析历史',
      content: `拍照分析：${analysisHistory.length} 次\n搭配生成：${outfitHistory.length} 次`,
      showCancel: false
    });
  },

  // 打开设置
  openSettings() {
    this.setData({ showSettingsModal: true });
  },

  // 查看统计
  viewStats() {
    this.setData({ showStatsModal: true });
  },

  // 快速色彩分析
  quickColorAnalysis() {
    wx.switchTab({
      url: '/pages/photo/photo'
    });
  },



  // 快速偏好搭配
  quickPreference() {
    wx.navigateTo({
      url: '/pages/preference/preference'
    });
  },

  // 分享应用
  shareApp() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    wx.showToast({
      title: '请点击右上角分享',
      icon: 'none'
    });
  },

  // 显示帮助
  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 登录后可使用AI分析功能\n2. 每日可免费分析10次\n3. 支持拍照识别和智能搭配\n4. 可设置个人偏好生成专属搭配',
      showCancel: false
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护，仅收集必要的用户信息用于提供服务，不会泄露给第三方。',
      showCancel: false
    });
  },

  // 联系我们
  contactUs() {
    wx.showModal({
      title: '联系我们',
      content: '如有问题或建议，请通过以下方式联系：\n邮箱：support@aifashion.com\n微信：AI穿搭助手',
      showCancel: false
    });
  },

  // 显示版本信息
  showVersion() {
    wx.showModal({
      title: '版本信息',
      content: 'AI穿搭助手 v1.0\n\n更新内容：\n- 拍照识别功能\n- 个人偏好设置\n- AI智能推荐\n- 衣橱管理功能',
      showCancel: false
    });
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
            favoriteCount: 0,
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

  // 隐藏设置弹窗
  hideSettingsModal() {
    this.setData({ showSettingsModal: false });
  },

  // 隐藏统计弹窗
  hideStatsModal() {
    this.setData({
      showStatsModal: false
    });
  },

  // 切换性别
  switchGender() {
    const newGender = this.data.genderMode === 'female' ? 'male' : 'female';
    
    // 保存当前性别的身材信息
    const currentGender = this.data.genderMode;
    if (this.data.userHeight || this.data.userWeight) {
      wx.setStorageSync(`userHeight_${currentGender}`, this.data.userHeight);
      wx.setStorageSync(`userWeight_${currentGender}`, this.data.userWeight);
    }
    
    // 加载新性别的身材信息
    const newHeight = wx.getStorageSync(`userHeight_${newGender}`) || '';
    const newWeight = wx.getStorageSync(`userWeight_${newGender}`) || '';
    
    this.setData({
      genderMode: newGender,
      userHeight: newHeight,
      userWeight: newWeight
    });
    
    // 保存到本地存储
    wx.setStorageSync('genderMode', newGender);
    
    // 重新加载衣橱数据
    this.loadWardrobeData();
    
    wx.showToast({
      title: `已切换为${newGender === 'female' ? '女性' : '男性'}`,
      icon: 'success',
      duration: 1500
    });
  },

  // 获取衣橱总数
  getTotalClothingCount() {
    const { wardrobeData } = this.data;
    let total = 0;
    if (wardrobeData.tops) total += wardrobeData.tops.length;
    if (wardrobeData.bottoms) total += wardrobeData.bottoms.length;
    if (wardrobeData.shoes) total += wardrobeData.shoes.length;
    if (wardrobeData.accessories) total += wardrobeData.accessories.length;
    return total;
  },



  // 新单品输入
  onNewItemInput(e) {
    this.setData({
      newItemName: e.detail.value
    });
  },

  // 添加新单品
  addNewItem() {
    const { newItemName, currentCategory, wardrobeData } = this.data;
    
    if (!newItemName.trim()) {
      wx.showToast({
        title: '请输入单品名称',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否已存在
    if (wardrobeData[currentCategory] && wardrobeData[currentCategory].includes(newItemName.trim())) {
      wx.showToast({
        title: '该单品已存在',
        icon: 'none'
      });
      return;
    }
    
    // 添加到对应分类
    const updatedData = { ...wardrobeData };
    if (!updatedData[currentCategory]) {
      updatedData[currentCategory] = [];
    }
    updatedData[currentCategory].push(newItemName.trim());
    
    this.setData({
      wardrobeData: updatedData,
      newItemName: ''
    });
    
    // 保存到本地存储
    this.saveWardrobeData();
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 编辑单品
  editItem(e) {
    const index = e.currentTarget.dataset.index;
    const { currentCategory, wardrobeData } = this.data;
    const currentItem = wardrobeData[currentCategory][index];
    
    wx.showModal({
      title: '编辑单品',
      editable: true,
      placeholderText: '请输入新的单品名称',
      content: currentItem,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const updatedData = { ...wardrobeData };
          updatedData[currentCategory][index] = res.content.trim();
          
          this.setData({
            wardrobeData: updatedData
          });
          
          this.saveWardrobeData();
          
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 删除单品
  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    const { currentCategory, wardrobeData } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个单品吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedData = { ...wardrobeData };
          updatedData[currentCategory].splice(index, 1);
          
          this.setData({
            wardrobeData: updatedData
          });
          
          this.saveWardrobeData();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 保存衣橱数据
  saveWardrobeData() {
    const { genderMode, wardrobeData } = this.data;
    const storageKey = `wardrobeData_${genderMode}`;
    wx.setStorageSync(storageKey, wardrobeData);
  },

  // 设置身材信息
  setBodyInfo() {
    this.setData({
      showSettingsModal: true
    });
  },

  // 打开衣橱管理
  openWardrobe() {
    this.loadWardrobeData();
    this.setData({
      showWardrobeModal: true,
      currentCategory: 'tops', // 默认选择上衣
      categoryTitle: '上衣'
    });
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    const title = e.currentTarget.dataset.title;
    this.setData({
      currentCategory: category,
      categoryTitle: title
    });
  },

  // 隐藏衣橱管理弹窗
  hideWardrobeModal() {
    this.setData({
      showWardrobeModal: false
    });
  },

  // 更新衣橱物品数量
  updateWardrobeItemCount() {
    const { wardrobeData } = this.data;
    let total = 0;
    if (wardrobeData.tops) total += wardrobeData.tops.length;
    if (wardrobeData.bottoms) total += wardrobeData.bottoms.length;
    if (wardrobeData.shoes) total += wardrobeData.shoes.length;
    if (wardrobeData.accessories) total += wardrobeData.accessories.length;
    
    this.setData({
      wardrobeItemCount: total
    });
  },

  // 保存衣橱数据
  saveWardrobe() {
    // 使用统一的保存方法
    this.saveWardrobeData();
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    this.hideWardrobeModal();
  },

  // 加载衣橱数据
  loadWardrobeData() {
    const { genderMode } = this.data;
    const storageKey = `wardrobeData_${genderMode}`;
    const wardrobeData = wx.getStorageSync(storageKey) || {
      tops: [],
      bottoms: [],
      shoes: [],
      accessories: []
    };
    
    this.setData({
      wardrobeData
    });
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

  // 选择性别
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ genderMode: gender });
  },

  // 保存设置
  saveSettings() {
    const { userHeight, userWeight, genderMode } = this.data;
    
    // 验证身高体重
    if (userHeight && (userHeight < 100 || userHeight > 250)) {
      wx.showToast({
        title: '请输入合理的身高',
        icon: 'none'
      });
      return;
    }

    if (userWeight && (userWeight < 30 || userWeight > 200)) {
      wx.showToast({
        title: '请输入合理的体重',
        icon: 'none'
      });
      return;
    }

    // 保存到全局数据和本地存储（按性别分别保存）
    if (userHeight) {
      app.globalData.userHeight = parseInt(userHeight);
      wx.setStorageSync(`userHeight_${genderMode}`, parseInt(userHeight));
    }
    
    if (userWeight) {
      app.globalData.userWeight = parseInt(userWeight);
      wx.setStorageSync(`userWeight_${genderMode}`, parseInt(userWeight));
    }
    
    app.globalData.genderMode = genderMode;
    wx.setStorageSync('genderMode', genderMode);
    
    this.setData({ showSettingsModal: false });
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: 'AI穿搭助手 - 让AI为你打造完美搭配',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI穿搭助手 - 智能穿搭推荐',
      imageUrl: '/images/share.png'
    };
  }
});