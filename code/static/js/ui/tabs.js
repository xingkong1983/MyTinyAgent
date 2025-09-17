
class Tabs {
  constructor(selector, options = {}) {
    // 获取容器元素
    this.container = document.querySelector(selector);
    if (!this.container) {
      console.error(`Tabs容器不存在: ${selector}`);
      return;
    }

    // 合并默认选项和用户选项
    this.options = Object.assign(
      {
        initialTab: 0,
        animation: true,
        showCloseButton: true,  // 添加关闭按钮显示控制选项，默认为true
        onChange: null,
      },
      options
    );

    // 获取标签按钮和内容面板
    this.tabButtons = this.container.querySelectorAll(".tab-btn");
    this.tabPanes = this.container.querySelectorAll(".tab-pane");

    // 初始化
    this.init();
  }

  init() {
    // 检查元素数量是否匹配
    if (this.tabButtons.length !== this.tabPanes.length) {
      console.error("标签按钮和内容面板数量不匹配");
      return;
    }

    // 为每个标签按钮添加关闭按钮
    this.addCloseButtons();

    // 设置初始状态
    this.currentIndex = -1;

    // 绑定事件
    this.bindEvents();

    // 切换到初始标签页
    if (
      this.options.initialTab >= 0 &&
      this.options.initialTab < this.tabButtons.length
    ) {
      this.switchTo(this.options.initialTab);
    } else {
      // 默认切换到第一个标签页
      this.switchTo(0);
    }
  }

  // 为每个标签按钮添加关闭按钮
  addCloseButtons() {
    // 只有当showCloseButton选项为true时才添加关闭按钮
    if (this.options.showCloseButton) {
      this.tabButtons.forEach((button, index) => {
        // 创建关闭按钮元素
        const closeBtn = document.createElement("span");
        closeBtn.className = "tab-close-btn";
        closeBtn.innerHTML = "×";
        closeBtn.setAttribute("data-index", index);
        
        // 将关闭按钮添加到标签按钮中
        button.appendChild(closeBtn);
      });
    }
  }

  bindEvents() {
    // 为每个标签按钮添加点击事件
    this.tabButtons.forEach((button, index) => {
      button.addEventListener("click", (e) => {
        // 检查点击的是否是关闭按钮
        if (e.target.classList.contains("tab-close-btn")) {
          // 阻止事件冒泡，避免触发标签切换
          e.stopPropagation();
          // 获取要关闭的标签页索引
          const closeIndex = parseInt(e.target.getAttribute("data-index"));
          // 关闭标签页
          this.closeTab(closeIndex);
        } else if (!button.classList.contains("disabled")) {
          this.switchTo(index);
        }
      });
    });
  }

  switchTo(index) {
    // 检查索引是否有效
    if (index < 0 || index >= this.tabButtons.length) {
      console.error(`无效的标签页索引: ${index}`);
      return;
    }

    // 检查是否已被禁用
    if (this.tabButtons[index].classList.contains("disabled")) {
      console.warn(`标签页已被禁用: ${index}`);
      return;
    }

    // 如果已经是当前标签页，则不执行操作
    if (index === this.currentIndex) {
      return;
    }

    // 移除之前的活动状态
    if (this.currentIndex >= 0) {
      this.tabButtons[this.currentIndex].classList.remove("active");
      this.tabPanes[this.currentIndex].classList.remove("active");
    }

    // 添加新的活动状态
    this.tabButtons[index].classList.add("active");
    this.tabPanes[index].classList.add("active");

    // 更新当前索引
    this.currentIndex = index;

    // 调用回调函数
    if (typeof this.options.onChange === "function") {
      this.options.onChange(index);
    }
  }

  // 关闭标签页
  closeTab(index) {
    // 检查索引是否有效
    if (index < 0 || index >= this.tabButtons.length) {
      console.error(`无效的标签页索引: ${index}`);
      return;
    }

    // 如果只有一个标签页，不允许关闭
    if (this.tabButtons.length <= 1) {
      console.warn("至少需要保留一个标签页");
      return;
    }

    // 如果关闭的是当前激活的标签页，需要先切换到其他标签页
    if (index === this.currentIndex) {
      // 查找下一个可用的标签页
      let nextIndex = -1;
      
      // 优先选择后面的标签页
      for (let i = index + 1; i < this.tabButtons.length; i++) {
        if (i !== index && !this.tabButtons[i].classList.contains("disabled")) {
          nextIndex = i;
          break;
        }
      }
      
      // 如果后面没有可用的标签页，选择前面的标签页
      if (nextIndex === -1) {
        for (let i = index - 1; i >= 0; i--) {
          if (i !== index && !this.tabButtons[i].classList.contains("disabled")) {
            nextIndex = i;
            break;
          }
        }
      }
      
      // 如果找到了下一个标签页，先切换到它
      if (nextIndex !== -1) {
        this.switchTo(nextIndex);
      }
    }

    // 从DOM中移除对应的标签按钮和内容面板
    this.tabButtons[index].remove();
    this.tabPanes[index].remove();

    // 更新内部状态
    this.updateStateAfterClose(index);
  }

  // 关闭标签页后更新内部状态
  updateStateAfterClose(closedIndex) {
    // 重新获取标签按钮和内容面板
    this.tabButtons = this.container.querySelectorAll(".tab-btn");
    this.tabPanes = this.container.querySelectorAll(".tab-pane");
    
    // 更新当前索引
    if (closedIndex < this.currentIndex) {
      // 如果关闭的标签页在当前激活标签页之前，当前索引需要减1
      this.currentIndex--;
    } else if (closedIndex === this.currentIndex) {
      // 如果关闭的就是当前激活的标签页，重置当前索引
      this.currentIndex = -1;
    }
    
    // 重新绑定事件监听器
    this.bindEvents();
  }

  disable(index) {
    if (index >= 0 && index < this.tabButtons.length) {
      this.tabButtons[index].classList.add("disabled");

      // 如果禁用的是当前标签页，切换到下一个可用标签页
      if (index === this.currentIndex) {
        let nextAvailable = this.findNextAvailable(index);
        if (nextAvailable !== -1) {
          this.switchTo(nextAvailable);
        }
      }
    }
  }

  enable(index) {
    if (index >= 0 && index < this.tabButtons.length) {
      this.tabButtons[index].classList.remove("disabled");
    }
  }

  findNextAvailable(currentIndex) {
    // 向后查找
    for (let i = currentIndex + 1; i < this.tabButtons.length; i++) {
      if (!this.tabButtons[i].classList.contains("disabled")) {
        return i;
      }
    }

    // 向前查找
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.tabButtons[i].classList.contains("disabled")) {
        return i;
      }
    }

    // 没有可用的标签页
    return -1;
  }

  // 获取当前活动标签页的索引
  getActiveIndex() {
    return this.currentIndex;
  }
}


/**
 * 功能需求分析
 * 基本结构
 * 标签头（Tab Headers）：用于切换不同内容面板
 * 内容面板（Tab Panels）：显示对应标签的内容
 * 
 * 核心功能
 * 标签切换：点击标签头切换显示对应内容
 * 默认选中：支持设置默认激活的标签页
 * 禁用状态：支持禁用特定标签页
 * 动画效果：支持切换时的过渡动画
 * 
 * API设计
 * 初始化配置选项
 * 切换标签页方法
 * 启用/禁用标签页方法
 * 事件回调支持
 * 
 * 响应式设计
 * 适配不同屏幕尺寸
 * 移动端友好体验
 * 
 * 如何使用
   const tabs = new Tabs('#myTabs', {
       initialTab: 0,          // 初始显示的标签页索引
       animation: true,        // 启用动画
       showCloseButton: true,  // 是否显示关闭按钮，默认为true
       onChange: (index) => {  // 切换回调
           console.log(`切换到标签页: ${index}`);
       }
   });

    // 切换到指定标签页
    tabs.switchTo(2);
    // 禁用指定标签页
    tabs.disable(3);
    // 启用指定标签页
    tabs.enable(3);
 **/