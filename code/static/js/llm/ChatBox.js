/**
 * ChatBox: 只接受 ID 字符串，不再接受任意选择器
 * 构造参数：
 *   client     : LLMClient 实例（内部已带 eventBus）
 *   idList     : {
 *         tips     : 提示
 *         chat     : 消息列表容器 id
 *         input    : 输入框 id
 *         sendBtn  : 发送按钮 id
 *         stopBtn  : 停止按钮 id
 *   }
 *   eventBus   : （可选）外部传入的 EventBus 实例，缺省使用 client.eventBus
 */
class ChatBox {
  constructor({ client, idList, eventBus = null }) {
    this.client = client;
    this.eventBus = eventBus || client.eventBus; // 取外部总线或默认总线
    this.chartRenderer = new ChartRenderer(); 
    this.bindDOM(idList);
    this.bindEvent();
  }

  bindDOM(idList) {
    this.inp       = document.getElementById(idList.input);
    this.chat      = document.getElementById(idList.chat);
    this.sendBtn   = document.getElementById(idList.sendBtn);
    this.stopBtn   = document.getElementById(idList.stopBtn);
    this.tips      = document.getElementById(idList.tips);

    if (!this.chat || !this.inp || !this.sendBtn || !this.stopBtn) {
      throw new Error('ChatBox: 缺少必要 DOM ID');
    }
  }

  bindEvent() {
    // 统一通过 eventBus 监听
    this.eventBus.on('chat-start',  () => this.setLoading(true));
    this.eventBus.on('chat-done',   () => this.setLoading(false));
    this.eventBus.on('chat-add',    e => this.addChat(e));
    this.eventBus.on('chat-update', e => this.updateChat(e));

    this.sendBtn.onclick = () => this.send();
    this.stopBtn.onclick = () => this.client.stop();

    this.inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this.send();
    });
  }

  send() {
    const text = this.inp.value.trim();
    if (!text) return;
    this.inp.value = '';
    this.client.send(text);
  }

  setLoading(on) {
    this.sendBtn.style.display = on ? 'none' : 'inline-block';
    this.stopBtn.style.display = on ? 'inline-block' : 'none';
    this.tips.classList.toggle('loading', on);
  }

  addChat(e) {
    console.log('新建聊天块', e);
    const section = document.createElement('section');
    if (e.detail.role === 'user') {
      section.innerHTML = `
        <div class="msg-header">
          <img class="icon20" src="/static/img/avatar/user.svg">
          <div>用户</div>
        </div>
        <div class="msg-content markdown-body">
          ${e.detail.content}
        </div>`;
    } else {
      section.innerHTML = `
        <div class="msg-header">
          <img class="icon20" src="/static/img/avatar/assistant.svg">
          <div>Qwen32b</div>
        </div>
        <div class="msg-content markdown-body">
          ${e.detail.content}
        </div>`;
    }
    this.chat.appendChild(section);
    this.chat.scrollTop = this.chat.scrollHeight;
  }

  updateChat(e) {
    const contentDiv = this.chat.querySelector(
      'section:last-of-type .msg-content'
    );
    if (contentDiv) contentDiv.innerHTML = marked.parse(e.detail.content);
    this.chartRenderer.render();
    this.chat.scrollTop = this.chat.scrollHeight;
  }
}