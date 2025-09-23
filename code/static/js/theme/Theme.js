class Theme {
  constructor(themes=['light','dark','blue'],defaultTheme='light'){
    this.themes=themes;this.default=defaultTheme;this.current=this.load()||defaultTheme;
    this.init();
  }
  init(){
    this.bind();               // 绑定事件
    this.apply(this.current);  // 应用保存的主题
    this.updateUI(this.current);
  }
  bind(){
    document.querySelectorAll('.theme-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const t=btn.dataset.theme;
        if(this.themes.includes(t)) this.set(t);
      });
    });
  }
  set(theme){
    this.current=theme;
    this.apply(theme);
    this.save(theme);
    this.updateUI(theme);
  }
  apply(theme){document.body.setAttribute('data-theme',theme)}
  save(theme){try{localStorage.setItem('preferred-theme',theme)}catch{}}
  load(){try{return localStorage.getItem('preferred-theme')}catch{return null}}
  updateUI(theme){
    document.querySelectorAll('.theme-btn').forEach(b=>{
      b.classList.toggle('active',b.dataset.theme===theme);
    });
  }
}
/* 自动实例化 */
new Theme();