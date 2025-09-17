class Select {
    constructor(selector, options = {}) {
        // 获取容器元素
        this.container = document.querySelector(selector);
        if (!this.container) {
            console.error(`Select容器不存在: ${selector}`);
            return;
        }
        
        // 合并默认选项和用户选项
        this.options = Object.assign({
            placeholder: '请选择',
            search: false,
            onChange: null
        }, options);
        
        // 获取DOM元素
        this.header = this.container.querySelector('.select-header');
        this.valueDisplay = this.container.querySelector('.select-value');
        this.placeholder = this.container.querySelector('.select-placeholder');
        this.optionsContainer = this.container.querySelector('.select-options');
        this.arrow = this.container.querySelector('.select-arrow');
        
        // 搜索相关元素
        this.searchInput = this.container.querySelector('input');
        
        // 初始化状态
        this.isOpen = false;
        this.selectedValue = null;
        this.selectedText = null;

        // 控制展开方向
        this.openTop = false;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 绑定事件
        this.bindEvents();
        
        // 初始化搜索功能
        if (this.options.search && this.searchInput) {
            this.initSearch();
        }
        
        // 设置初始选中项
        const selectedOption = this.container.querySelector('.select-option.selected');
        if (selectedOption) {
            this.selectOption(selectedOption);
        }
    }
    
    bindEvents() {
        // 点击头部展开/收起
        this.header.addEventListener('click', (e) => {
            // 如果点击事件的目标在选项容器内，则不执行任何操作
            if (this.optionsContainer.contains(e.target)) {
                return;
            }
            if (!this.container.classList.contains('select-disabled')) {
                this.toggle();
            }
        });
        
        // 点击选项
        const options = this.container.querySelectorAll('.select-option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectOption(option);
                this.close();
            });
        });
        
        // 点击文档其他区域收起下拉框
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.isOpen) {
                this.close();
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                this.handleKeydown(e);
            }
        });
    }
    
    initSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const searchText = e.target.value.toLowerCase();
            const options = this.optionsContainer.querySelectorAll('.select-option');
            
            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                if (text.includes(searchText)) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        });
        
        this.searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
         // 计算可用空间并决定展开方向
        this.calculatePosition();
    
        this.isOpen = true;
        this.header.classList.add('open');
        this.optionsContainer.classList.add('open');
    
        // 根据计算结果显示在上方或下方
        if (this.openTop) {
            this.header.classList.add('top');
            this.optionsContainer.classList.add('top');
        } else {
            this.header.classList.remove('top');
            this.optionsContainer.classList.remove('top');
        }
    
        // 如果有搜索框，打开时聚焦
        if (this.options.search && this.searchInput) {
            setTimeout(() => {
                this.searchInput.focus();
            }, 100);
        }
    }
    
    close() {
        this.isOpen = false;
        this.header.classList.remove('open');
        this.header.classList.remove('top'); // 移除上方展开样式
        this.optionsContainer.classList.remove('open');
        this.optionsContainer.classList.remove('top'); // 移除上方展开样式
    
        // 关闭时清空搜索框
        if (this.options.search && this.searchInput) {
            this.searchInput.value = '';
            // 恢复所有选项显示
            const options = this.optionsContainer.querySelectorAll('.select-option');
            options.forEach(option => {
                option.style.display = 'flex';
            });
        }
    }
    
    selectOption(option) {
        // 移除之前的选中状态
        const selected = this.container.querySelector('.select-option.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        
        // 设置新的选中状态
        option.classList.add('selected');
        
        // 更新显示的值
        this.selectedValue = option.getAttribute('data-value');
        this.selectedText = option.textContent.trim();
        
        if (this.valueDisplay) {
            this.valueDisplay.textContent = this.selectedText;
        }
        
        if (this.placeholder) {
            this.placeholder.style.display = 'none';
        }
        
        if (this.valueDisplay) {
            this.valueDisplay.style.display = 'inline';
        }
        
        // 调用回调函数
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(this.selectedValue, this.selectedText);
        }
    }

    calculatePosition() {
        const rect = this.header.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // 如果下方空间不足200px，且上方空间足够，则在上方展开
        if (spaceBelow < 200 && spaceAbove > 200) {
            this.openTop = true;
        } else {
            this.openTop = false;
        }
        
        console.log(`下方空间: ${spaceBelow}px, 上方空间: ${spaceAbove}px, 在上方展开: ${this.openTop}`);
    }
    
    
    handleKeydown(e) {
        const options = this.container.querySelectorAll('.select-option:not([style*="display: none"])');
        let currentIndex = -1;
        
        // 查找当前选中项的索引
        options.forEach((option, index) => {
            if (option.classList.contains('selected')) {
                currentIndex = index;
            }
        });
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < options.length - 1) {
                    this.highlightOption(options[currentIndex + 1]);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    this.highlightOption(options[currentIndex - 1]);
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    this.selectOption(options[currentIndex]);
                    this.close();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }
    
    highlightOption(option) {
        // 移除之前的高亮
        const highlighted = this.container.querySelector('.select-option.highlighted');
        if (highlighted) {
            highlighted.classList.remove('highlighted');
        }
        
        // 设置新的高亮
        option.classList.add('highlighted');
        
        // 滚动到可见区域
        option.scrollIntoView({ block: 'nearest' });
    }
    
    // 设置选中值
    setValue(value) {
        const option = this.container.querySelector(`.select-option[data-value="${value}"]`);
        if (option) {
            this.selectOption(option);
        }
    }
    
    // 获取当前选中值
    getValue() {
        return this.selectedValue;
    }
    
    // 禁用组件
    disable() {
        this.container.classList.add('select-disabled');
    }
    
    // 启用组件
    enable() {
        this.container.classList.remove('select-disabled');
    }
}