const app = getApp();

Page({
  data: {
    genderMode: 'female',
    hasLogin: false,
    dailyCallCount: 0,
    maxDailyCalls: 10,
    userHeight: '',
    userWeight: '',
    showBodyModal: false,
    randomOutfits: [],
    selectedFemaleStyle: '甜酷风',
    selectedMaleStyle: '户外风',
    femaleStyles: [
      { key: 'sweet-cool', name: '甜酷风', icon: '🍭' },
      { key: 'light-mature', name: '轻熟风', icon: '🌿' },
      { key: 'salt-style', name: '盐系风', icon: '🧂' },
      { key: 'college', name: '学院风', icon: '🎓' },
      { key: 'avant-garde', name: '前卫风', icon: '⚡' },
      { key: 'japanese', name: '日系风', icon: '🌸' },
      { key: 'literary', name: '文艺风', icon: '📚' },
      { key: 'vintage', name: '复古风', icon: '🌹' },
      { key: 'korean', name: '韩系风', icon: '🇰🇷' },
      { key: 'tea-style', name: '茶系风', icon: '🍃' },
      { key: 'street', name: '街头风', icon: '🛹' },
      { key: 'fashionable', name: '时髦风', icon: '✨' },
      { key: 'chanel-style', name: '小香风', icon: '💎' },
      { key: 'gentle', name: '温柔风', icon: '🌙' },
      { key: 'spicy-girl', name: '辣妹风', icon: '🔥' },
      { key: 'niche', name: '小众', icon: '🦋' }
    ],
    maleStyles: [
      { key: 'outdoor', name: '户外风', icon: '🏔️' },
      { key: 'japanese', name: '日系风', icon: '🎌' },
      { key: 'korean', name: '韩系风', icon: '🎭' },
      { key: 'light-mature', name: '轻熟风', icon: '🌿' },
      { key: 'american', name: '美式风', icon: '🦅' },
      { key: 'sports', name: '运动风', icon: '⚽' }
    ],
    selectedColorScheme: '同类色',
    colorSchemes: [
      { key: 'monochromatic', name: '同类色' },
      { key: 'analogous', name: '邻近色' },
      { key: 'tonal', name: '同色呼应' },
      { key: 'complementary', name: '撞色穿搭' }
    ],
    weather: null, // 天气信息
    currentDate: '', // 当前日期
    hitokoto: '', // 一言
    hitokotoTimer: null, // 一言定时器
    locationTimer: null, // 位置刷新定时器
    isGenerating: false, // 是否正在生成
    wardrobeGenerating: false, // 衣橱搭配生成状态
    styleGenerating: false, // 风格搭配生成状态
    progressPercent: 0, // 进度百分比
    progressText: '' // 进度文本


  },

  onLoad() {
    this.initPageData();
    this.initCurrentDate();
    this.getWeatherInfo();
    this.getHitokoto();
    this.startHitokotoTimer();
    
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ hasLogin: true });
    }
    
    // 获取今日使用次数
    const today = new Date().toDateString();
    const lastCallDate = wx.getStorageSync('lastCallDate');
    if (lastCallDate !== today) {
      // 新的一天，重置次数
      wx.setStorageSync('dailyCallCount', 0);
      wx.setStorageSync('lastCallDate', today);
      this.setData({ dailyCallCount: 0 });
    } else {
      const count = wx.getStorageSync('dailyCallCount') || 0;
      this.setData({ dailyCallCount: count });
    }
    
    // 加载保存的风格选择
     const savedFemaleStyle = wx.getStorageSync('selectedFemaleStyle');
     const savedMaleStyle = wx.getStorageSync('selectedMaleStyle');
     const savedColorScheme = wx.getStorageSync('selectedColorScheme');
     if (savedFemaleStyle) {
       this.setData({ selectedFemaleStyle: savedFemaleStyle });
     }
     if (savedMaleStyle) {
       this.setData({ selectedMaleStyle: savedMaleStyle });
     }
     if (savedColorScheme) {
       this.setData({ selectedColorScheme: savedColorScheme });
     }
  },

  onShow() {
    this.initPageData();
  },

  onUnload() {
    // 清理一言定时器
    if (this.data.hitokotoTimer) {
      clearInterval(this.data.hitokotoTimer);
    }
    
    // 清理位置刷新定时器
    if (this.data.locationTimer) {
      clearTimeout(this.data.locationTimer);
    }
  },

  // 初始化页面数据
  initPageData() {
    // 从本地存储获取性别模式，确保与个人资料页面同步
    const genderMode = wx.getStorageSync('genderMode') || 'female';
    
    // 按性别加载身材信息
    const userHeight = wx.getStorageSync(`userHeight_${genderMode}`) || '';
    const userWeight = wx.getStorageSync(`userWeight_${genderMode}`) || '';
    
    this.setData({
      genderMode: genderMode,
      hasLogin: app.globalData.hasLogin,
      dailyCallCount: app.globalData.dailyCallCount,
      maxDailyCalls: app.globalData.maxDailyCalls,
      userHeight: userHeight,
      userWeight: userWeight
    });
  },

  // 初始化当前日期
  initCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    const dateString = `${year}年${month}月${day}日 ${weekday}`;
    this.setData({
      currentDate: dateString
    });
  },

  // 获取天气信息
  getWeatherInfo() {
    // 清除之前的定时器
    if (this.data.locationTimer) {
      clearTimeout(this.data.locationTimer);
    }
    
    // 获取用户位置
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        // 调用天气API
        this.fetchWeatherData(latitude, longitude);
         
        // 设置定时器，每10分钟自动刷新位置和天气信息
        const timer = setTimeout(() => {
          this.getWeatherInfo();
        }, 10 * 60 * 1000);
        
        this.setData({
          locationTimer: timer
        });
      },
      fail: () => {
        // 位置获取失败，使用默认天气数据
        this.setDefaultWeather();
         
        // 即使获取位置失败，也要设置定时器重试
        const timer = setTimeout(() => {
          this.getWeatherInfo();
        }, 10 * 60 * 1000);
        
        this.setData({
          locationTimer: timer
        });
      }
    });
  },

  // 获取天气数据
   fetchWeatherData(lat, lon) {
     // 先通过逆地理编码获取位置信息
     this.getLocationName(lat, lon);
     
     // 调用和风天气API获取城市信息和天气数据
     this.getQWeatherCityInfo(lat, lon);
   },

   // 获取和风天气城市信息
   getQWeatherCityInfo(lat, lon) {
     const apiKey = 'd5080373';
     const location = `${lon},${lat}`;
     const geoApiUrl = 'atherapip';
     
     wx.request({
       url: geoApiUrl,
       method: 'GET',
       data: {
         key: apiKey,
         location: location
       },
       success: (res) => {
         if (res.data && res.data.code === '200' && res.data.location && res.data.location.length > 0) {
           const cityInfo = res.data.location[0];
           const cityName = cityInfo.name || '当前位置';
           
           // 更新城市信息
           this.setData({
             'weather.city': cityName
           });
           
           // 使用城市ID获取天气数据
           this.getRealWeatherData(cityInfo.id || location);
         } else {
           // 城市查询失败，直接使用坐标获取天气
           this.getRealWeatherData(location);
         }
       },
       fail: () => {
         // 网络请求失败，直接使用坐标获取天气
         this.getRealWeatherData(location);
       }
     });
   },

   // 获取真实天气数据
   getRealWeatherData(location) {
     // 使用和风天气API接口
     const apiKey = '';
     const apiUrl = ``;
     
     wx.request({
       url: apiUrl,
       method: 'GET',
       data: {
         key: apiKey,
         location: location
       },
       success: (res) => {
         if (res.data && res.data.code === '200' && res.data.now) {
           const now = res.data.now;
           const weatherData = {
             city: this.data.weather?.city || '当前位置',
             temperature: parseInt(now.temp) || 22,
             description: now.text || '晴',
             icon: this.getWeatherIcon(now.text || '晴'),
             humidity: now.humidity ? `${now.humidity}%` : '50%',
             windDirection: now.windDir || '无风',
             windSpeed: now.windScale ? `${now.windScale}级` : '0级',
             feelsLike: parseInt(now.feelsLike) || parseInt(now.temp),
             pressure: now.pressure || '1013',
             visibility: now.vis || '10'
           };
           
           this.setData({
             weather: weatherData
           });
         } else {
           console.log('和风天气API调用失败:', res.data);
           // API调用失败，使用备用天气数据
           this.setDefaultWeather();
         }
       },
       fail: (error) => {
         console.log('和风天气API网络请求失败:', error);
         // 网络请求失败，使用备用天气数据
         this.setDefaultWeather();
       }
     });
   },

   // 根据天气描述获取对应图标
   getWeatherIcon(description) {
     const now = new Date();
     const hour = now.getHours();
     
     const iconMap = {
       '晴': hour >= 6 && hour <= 18 ? '☀️' : '🌙',
       '少云': '🌤️',
       '晴间多云': '⛅',
       '多云': '⛅',
       '阴': '☁️',
       '有风': '💨',
       '平静': '😌',
       '微风': '🍃',
       '和风': '🍃',
       '清风': '🍃',
       '强风/劲风': '💨',
       '疾风': '💨',
       '大风': '💨',
       '烈风': '💨',
       '风暴': '🌪️',
       '狂爆风': '🌪️',
       '飓风': '🌀',
       '热带风暴': '🌀',
       '霾': '😷',
       '中度霾': '😷',
       '重度霾': '😷',
       '严重霾': '😷',
       '阵雨': '🌦️',
       '雷阵雨': '⛈️',
       '雷阵雨伴有冰雹': '⛈️',
       '小雨': '🌧️',
       '中雨': '🌧️',
       '大雨': '🌧️',
       '暴雨': '🌧️',
       '大暴雨': '🌧️',
       '特大暴雨': '🌧️',
       '冻雨': '🧊',
       '雨雪天气': '🌨️',
       '雨夹雪': '🌨️',
       '阵雪': '🌨️',
       '小雪': '❄️',
       '中雪': '❄️',
       '大雪': '❄️',
       '暴雪': '❄️',
       '雾': '🌫️',
       '浓雾': '🌫️',
       '强浓雾': '🌫️',
       '轻雾': '🌫️',
       '大雾': '🌫️',
       '特强浓雾': '🌫️',
       '热': '🥵',
       '冷': '🥶',
       '未知': '❓'
     };
     
     return iconMap[description] || (hour >= 6 && hour <= 18 ? '☀️' : '🌙');
   },



   // 收藏搭配
   favoriteOutfit(e) {
     const index = e.currentTarget.dataset.index;
     const outfits = this.data.randomOutfits;
     outfits[index].isFavorite = !outfits[index].isFavorite;
     
     this.setData({
       randomOutfits: outfits
     });
     
     wx.showToast({
       title: outfits[index].isFavorite ? '已收藏' : '已取消收藏',
       icon: 'success',
       duration: 1500
     });
   },

   // 分享搭配
   shareOutfit(e) {
     const index = e.currentTarget.dataset.index;
     const outfit = this.data.randomOutfits[index];
     
     wx.showShareMenu({
       withShareTicket: true,
       menus: ['shareAppMessage', 'shareTimeline']
     });
     
     // 设置分享内容
     wx.onShareAppMessage(() => {
       return {
         title: `搭配方案 ${index + 1}`,
         path: '/pages/index/index',
         imageUrl: '', // 可以添加搭配图片
         desc: outfit.outfit
       };
     });
     
     wx.showToast({
       title: '点击右上角分享',
       icon: 'none',
       duration: 2000
     });
   },

   // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls.map(img => img.url);
    
    wx.previewImage({
      current: url,
      urls: urls
    });
  },




   // 获取位置名称
   getLocationName(lat, lon) {
     // 使用简化的位置描述
     const locationName = this.getLocationDescription(lat, lon);
     
     // 更新天气信息中的城市名称
     this.setData({
       'weather.city': locationName
     });
   },

   // 根据经纬度获取位置描述
   getLocationDescription(lat, lon) {
     // 简化的位置判断逻辑
     if (lat >= 39.8 && lat <= 40.2 && lon >= 116.2 && lon <= 116.6) {
       return '北京';
     } else if (lat >= 31.1 && lat <= 31.4 && lon >= 121.3 && lon <= 121.7) {
       return '上海';
     } else if (lat >= 22.4 && lat <= 22.8 && lon >= 113.8 && lon <= 114.5) {
       return '深圳';
     } else if (lat >= 30.4 && lat <= 30.8 && lon >= 104.0 && lon <= 104.2) {
       return '成都';
     } else if (lat >= 30.4 && lat <= 30.8 && lon >= 114.1 && lon <= 114.6) {
       return '武汉';
     } else {
       // 根据经纬度范围判断大致区域
       if (lat >= 35) {
         return '北方';
       } else if (lat >= 25) {
         return '中部';
       } else {
         return '南方';
       }
     }
   },

   // 设置默认天气
  setDefaultWeather() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const hour = now.getHours();
    
    let temperature = 20;
    let description = '晴';
    
    if (month >= 12 || month <= 2) {
      temperature = 5;
      description = '多云';
    } else if (month >= 6 && month <= 8) {
      temperature = 30;
      description = '晴';
    }
    
    this.setData({
      weather: {
        city: '未知位置',
        temperature: temperature,
        description: description,
        icon: hour >= 6 && hour <= 18 ? '☀️' : '🌙'
      }
    });
  },

   // 获取一言
   getHitokoto() {
     wx.request({
       url: 'https://v1.hitokoto.cn/',
       method: 'GET',
       success: (res) => {
         if (res.data && res.data.hitokoto) {
           this.setData({
             hitokoto: res.data.hitokoto
           });
         }
       },
       fail: (error) => {
         console.log('获取一言失败:', error);
         // 设置默认文案
         this.setData({
           hitokoto: '今天也要做最好的自己哦～'
         });
       }
     });
   },

   // 启动一言定时器
   startHitokotoTimer() {
     // 每10分钟刷新一次一言
     const timer = setInterval(() => {
       this.getHitokoto();
     }, 10 * 60 * 1000); // 10分钟 = 600000毫秒
     
     this.setData({
       hitokotoTimer: timer
     });
   },

   // 切换性别
  switchGender(e) {
    const gender = e.currentTarget.dataset.gender;
    
    // 保存当前性别的身材信息
    const currentGender = this.data.genderMode;
    if (this.data.userHeight || this.data.userWeight) {
      wx.setStorageSync(`userHeight_${currentGender}`, this.data.userHeight);
      wx.setStorageSync(`userWeight_${currentGender}`, this.data.userWeight);
    }
    
    // 加载新性别的身材信息
    const newHeight = wx.getStorageSync(`userHeight_${gender}`) || '';
    const newWeight = wx.getStorageSync(`userWeight_${gender}`) || '';
    
    app.globalData.genderMode = gender;
    this.setData({ 
      genderMode: gender,
      userHeight: newHeight,
      userWeight: newWeight
    });
    wx.setStorageSync('genderMode', gender);
  },

  // 选择风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    if (this.data.genderMode === 'female') {
      this.setData({
        selectedFemaleStyle: style
      });
      wx.setStorageSync('selectedFemaleStyle', style);
    } else {
      this.setData({
        selectedMaleStyle: style
      });
      wx.setStorageSync('selectedMaleStyle', style);
    }
  },

   // 选择色彩搭配
   selectColorScheme(e) {
     const scheme = e.currentTarget.dataset.scheme;
     const schemeName = this.data.colorSchemes.find(item => item.key === scheme)?.name || scheme;
     this.setData({
       selectedColorScheme: schemeName
     });
     wx.setStorageSync('selectedColorScheme', schemeName);
   },

   // 生成随机搭配（流式生成）
  // 根据衣橱信息生成搭配
  async generateWithWardrobe() {
    if (this.data.isGenerating || this.data.wardrobeGenerating) {
      wx.showToast({
        title: '正在生成中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    wx.showToast({
      title: '开始智能衣橱搭配',
      icon: 'none',
      duration: 1500
    });
    
    this.setData({
      wardrobeGenerating: true
    });
    
    try {
      await this.generateOutfits(true);
    } finally {
      this.setData({
        wardrobeGenerating: false
      });
    }
  },

  // 风格搭配生成
  async generateWithStyle() {
    if (this.data.isGenerating || this.data.styleGenerating) {
      wx.showToast({
        title: '正在生成中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    // 检查身高体重信息
    if (!this.data.userHeight || !this.data.userWeight) {
      wx.showModal({
        title: '需要身材信息',
        content: '风格搭配需要您的身高体重信息，请先完善基本信息',
        confirmText: '去设置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.showBodyInfoModal();
          }
        }
      });
      return;
    }
    
    wx.showToast({
      title: '开始时尚灵感搭配',
      icon: 'none',
      duration: 1500
    });
    
    this.setData({
      styleGenerating: true
    });
    
    try {
      await this.generateOutfits(false);
    } finally {
      this.setData({
        styleGenerating: false
      });
    }
  },

  // 通用生成方法
  async generateOutfits(useWardrobe = true) {
    if (this.data.isGenerating) {
      wx.showToast({
        title: '正在生成中，请稍候',
        icon: 'none'
      });
      return;
    }

    if (!app.canCallAI()) {
      wx.showToast({
        title: '今日AI分析次数已用完',
        icon: 'none'
      });
      return;
    }

    // 开始生成，显示进度条
    this.setData({
      randomOutfits: [],
      isGenerating: true,
      progressPercent: 0,
      progressText: '正在准备生成...'
    });

    // 模拟进度更新
    this.updateProgress(10, '分析用户偏好...');

    try {
      const genderText = this.data.genderMode === 'male' ? '男性' : '女性';
      
      // 调试信息 - 身材信息
      console.log('用户身材信息:', {
        genderMode: this.data.genderMode,
        userHeight: this.data.userHeight,
        userWeight: this.data.userWeight
      });
      
      const bodyInfo = this.data.userHeight && this.data.userWeight ? 
        `身高${this.data.userHeight}cm，体重${this.data.userWeight}kg` : '';
      
      const styleInfo = this.data.genderMode === 'female' ? 
         `，偏好${this.data.selectedFemaleStyle}风格` : 
         `，偏好${this.data.selectedMaleStyle}风格`;
      
      const colorSchemeInfo = `，色彩搭配要求：${this.data.selectedColorScheme}`;
      
      const weatherInfo = this.data.weather ? `当前天气：${this.data.weather.temperature}°C，${this.data.weather.description}` : '';
      
      // 根据是否使用衣橱信息生成不同的提示词
      let wardrobeInfo = '';
      let totalItems = 0;
      
      if (useWardrobe) {
        // 按性别获取衣橱信息
        const storageKey = `wardrobeData_${this.data.genderMode}`;
        const wardrobeData = wx.getStorageSync(storageKey) || {
          tops: [],
          bottoms: [],
          shoes: [],
          accessories: []
        };
        
        // 调试信息
        console.log('当前性别模式:', this.data.genderMode);
        console.log('存储键名:', storageKey);
        console.log('衣橱数据:', wardrobeData);
        
        // 检查是否有衣橱数据
        totalItems = (wardrobeData.tops?.length || 0) + 
                    (wardrobeData.bottoms?.length || 0) + 
                    (wardrobeData.shoes?.length || 0) + 
                    (wardrobeData.accessories?.length || 0);
        
        console.log('衣橱总数量:', totalItems);
        
        if (totalItems > 0) {
          let wardrobeDetails = [];
          if (wardrobeData.tops?.length > 0) wardrobeDetails.push(`上衣：${wardrobeData.tops.join('、')}`);
          if (wardrobeData.bottoms?.length > 0) wardrobeDetails.push(`下装：${wardrobeData.bottoms.join('、')}`);
          if (wardrobeData.shoes?.length > 0) wardrobeDetails.push(`鞋子：${wardrobeData.shoes.join('、')}`);
          if (wardrobeData.accessories?.length > 0) wardrobeDetails.push(`配饰：${wardrobeData.accessories.join('、')}`);
          
          wardrobeInfo = `，用户现有衣橱：${wardrobeDetails.join('；')}。请优先使用这些现有单品进行搭配推荐`;
        } else {
          // 如果没有衣橱数据，提示用户先添加衣物
          wx.showModal({
            title: '衣橱为空',
            content: '您的衣橱中还没有添加任何衣物，请先前往个人资料页面添加衣物后再使用智能衣橱搭配功能。',
            showCancel: false,
            confirmText: '去添加',
            success: (res) => {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/profile/profile'
                });
              }
            }
          });
          this.setData({
            wardrobeGenerating: false,
            isGenerating: false
          });
          return;
        }
      }
      
      let prompt = '';
      if (useWardrobe && totalItems > 0) {
        // 智能衣橱搭配：严格使用现有衣橱单品
        prompt = `请为${genderText}${bodyInfo}${styleInfo}${colorSchemeInfo}生成5个不同风格的今日穿搭建议。${weatherInfo}${wardrobeInfo}

**严格要求：**
#你是一个专业的穿搭推荐系统，你的任务是根据用户的身材信息、风格偏好、季节和天气，严格使用用户现有衣橱中的单品进行搭配，不得添加任何用户衣橱中没有的服装。
1. 只能使用用户现有衣橱中的单品进行搭配，不得添加任何用户衣橱中没有的服装
2. 每个搭配必须从现有衣橱单品中选择：上衣、下装、鞋子
3. 如果某个类别（如配饰）用户衣橱中有单品，也要包含在搭配中
4. 不得推荐购买新的服装或配饰
5. 搭配描述中明确标注使用的是用户现有的哪些单品
6. 为每个搭配提供主要颜色信息（基于现有单品的颜色）
7. 在搭配理由中说明为什么用户的身材信息适合这个搭配组合

请按以下JSON格式回答：
[
  {
    "outfit": "具体搭配描述（明确标注使用的现有单品）",
    "reason": "搭配理由说明（基于用户身材信息和现有单品的搭配效果）",
    "occasion": "适合的场合",
    "colors": [
      {"name": "颜色名称", "hex": "#颜色代码"},
      {"name": "颜色名称", "hex": "#颜色代码"}
    ]
  }
]`;
      } else {
        // 风格搭配：可以推荐新的服装
        prompt = `请为${genderText}${bodyInfo}${styleInfo}${colorSchemeInfo}生成5个不同风格的今日穿搭建议。${weatherInfo}

要求：
#你是一个专业的穿搭推荐系统，你的任务是根据用户的身材信息、风格偏好、季节和天气，生成5个不同风格的今日穿搭建议。
1. 每个搭配包含上衣、下装、鞋子的具体建议
2. 考虑当前天气和季节
3. 风格要有差异性
4. 为每个搭配提供搭配理由和适合场合
5. 为每个搭配提供主要颜色信息（包含颜色名称和十六进制色值）
6. 在搭配理由中说明为什么用户的身材信息和风格偏好适合这个搭配

请按以下JSON格式回答：
[
  {
    "outfit": "具体搭配描述",
    "reason": "搭配理由说明（包含为什么用户的身材和风格偏好适合这个搭配）",
    "occasion": "适合的场合",
    "colors": [
      {"name": "颜色名称", "hex": "#颜色代码"},
      {"name": "颜色名称", "hex": "#颜色代码"}
    ]
  }
]`;
      }

      // 开始流式生成
       await this.streamGenerateOutfits(prompt);
       
     } catch (error) {
       this.setData({
         isGenerating: false,
         progressPercent: 0,
         progressText: ''
       });
       wx.showToast({
         title: error.message || '生成失败',
         icon: 'none'
       });
     }
  },

  // 保留原方法以兼容
  async generateRandomOutfits() {
    await this.generateOutfits(true);
  },

   // 更新进度
   updateProgress(percent, text) {
     this.setData({
       progressPercent: percent,
       progressText: text
     });
   },

  // 流式生成搭配
   async streamGenerateOutfits(prompt) {
     try {
       // 更新进度：开始调用AI
       this.updateProgress(30, '正在调用AI接口，请耐心等待...');
       
       const result = await app.callAI(prompt);
       
       // 更新进度：解析结果
       this.updateProgress(60, '正在解析搭配方案...');
       
       const outfits = this.parseOutfits(result);
       
       // 更新进度：开始展示
       this.updateProgress(80, '正在生成搭配展示...');
       
       // 逐个展示搭配，模拟流式效果
       for (let i = 0; i < outfits.length; i++) {
         setTimeout(() => {
           const currentOutfits = this.data.randomOutfits.slice();
           currentOutfits.push(outfits[i]);
           this.setData({ randomOutfits: currentOutfits });
           
           // 更新进度
           const progress = 80 + (i + 1) * (20 / outfits.length);
           this.updateProgress(progress, `正在展示第${i + 1}套搭配...`);
           
           if (i === outfits.length - 1) {
             // 完成生成，隐藏进度条
             setTimeout(() => {
               this.setData({
                 isGenerating: false,
                 progressPercent: 0,
                 progressText: ''
               });
               wx.showToast({
                 title: '生成完成',
                 icon: 'success'
               });
             }, 500);
           }
         }, i * 800); // 每800ms展示一个搭配
       }
       
     } catch (error) {
       this.setData({
         isGenerating: false,
         progressPercent: 0,
         progressText: ''
       });
       wx.showToast({
         title: error.message || '生成失败',
         icon: 'none'
       });
     }
   },

  // 解析搭配结果
  parseOutfits(text) {
    try {
      // 尝试解析JSON格式
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const outfits = JSON.parse(jsonMatch[0]);
        // 为每个搭配添加收藏状态
        return outfits.slice(0, 5).map(outfit => ({
          ...outfit,
          isFavorite: false
        }));
      }
    } catch (error) {
      console.log('JSON解析失败，使用备用解析方法');
    }
    
    // 备用解析方法：解析文本格式
    const lines = text.split('\n').filter(line => line.trim());
    const outfits = [];
    let currentOutfit = { outfit: '', reason: '', occasion: '', colors: [] };
    let section = 'outfit';
    
    // 默认颜色方案
    const defaultColors = [
      { name: '黑色', hex: '#000000' },
      { name: '白色', hex: '#FFFFFF' },
      { name: '灰色', hex: '#808080' }
    ];
    
    for (let line of lines) {
      line = line.trim();
      if (line.match(/^[1-5][\.、]/) || line.includes('搭配')) {
        if (currentOutfit.outfit) {
          // 如果没有颜色信息，使用默认颜色
          if (!currentOutfit.colors || currentOutfit.colors.length === 0) {
            currentOutfit.colors = defaultColors.slice(0, 2);
          }
          outfits.push({ ...currentOutfit });
        }
        currentOutfit = { 
          outfit: line.replace(/^[1-5][\.、]\s*/, ''), 
          reason: '经典搭配，简约时尚', 
          occasion: '日常出行',
          colors: defaultColors.slice(0, 2),
          isFavorite: false
        };
        section = 'outfit';
      } else if (line.includes('理由') || line.includes('原因')) {
        section = 'reason';
      } else if (line.includes('场合') || line.includes('适合')) {
        section = 'occasion';
      } else if (line && currentOutfit.outfit) {
        if (section === 'reason') {
          currentOutfit.reason = line;
        } else if (section === 'occasion') {
          currentOutfit.occasion = line;
        } else {
          currentOutfit.outfit += ' ' + line;
        }
      }
    }
    
    if (currentOutfit.outfit) {
      // 如果没有颜色信息，使用默认颜色
      if (!currentOutfit.colors || currentOutfit.colors.length === 0) {
        currentOutfit.colors = defaultColors.slice(0, 2);
      }
      // 确保有收藏状态
      if (!currentOutfit.hasOwnProperty('isFavorite')) {
        currentOutfit.isFavorite = false;
      }
      outfits.push(currentOutfit);
    }
    
    return outfits.slice(0, 3);
  },





  // 导航到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
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

    app.globalData.userHeight = parseInt(userHeight);
    app.globalData.userWeight = parseInt(userWeight);
    
    // 按性别保存身材信息，与个人资料页面保持一致
    wx.setStorageSync(`userHeight_${genderMode}`, parseInt(userHeight));
    wx.setStorageSync(`userWeight_${genderMode}`, parseInt(userWeight));
    
    this.setData({ showBodyModal: false });
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
});