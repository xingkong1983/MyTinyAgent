/**
 * ChatBox: 只接受 ID 字符串，不再接受任意选择器
 * 构造参数：
 *   client     : LLMClient 实例
 *   ids        : {
 *         tips     : 提示
 *         chat    : 消息列表容器 id
 *         input   : 输入框 id
 *         sendBtn : 发送按钮 id
 *         stopBtn : 停止按钮 id
 *   }
 */
class ChatBox {
  constructor({ client, idList }) {
    this.client = client;
    this.bindDOM();
    this.bindEvent();
  }

  bindDOM(idList) {
    this.inp = document.getElementById(idList.input);
    this.chat = document.getElementById(idList.chat);
    this.send = document.getElementById(idList.sendBtn);
    this.stop = document.getElementById(idList.stopBtn);
    this.tips = document.getElementById(idList.tips);

    if (!this.chat || !this.inp || !this.send || !this.stop)
      throw new Error('ChatBox: 缺少必要 DOM ID');


  }

  bindEvent() {
    this.client.on('chat-start', () => this.setLoading(true));
    this.client.on('chat-done', () => this.setLoading(false));
    this.client.on('chat-new', ({ data }) => this.new(data));
    this.client.on('chat-update', ({ data }) => this.update(data));

    this.send.onclick = () => {
      this.send()
    };
    
    this.stop.onclick = () => {
      this.client.stop()
    };

    this.inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this._send();
    });
  }

  send() {
    const text = this.ui.inp.value.trim();
    if (!text) return;
    this.ui.inp.value = '';
    this.client.send(text);
  }

  setLoading(on) {
    this.ui.send.style.display = on ? 'none' : 'inline-block';
    this.ui.stop.style.display = on ? 'inline-block' : 'none';
    this.ui.box.classList.toggle('loading', on);
  }

  new({ role, content }) {

    if (!div) {
      div = document.createElement('div');
      div.className = `msg-content`;
      div.innerHTML = marked.parse(content);
      this.ui.chat.appendChild(div);
    }
    this.ui.chat.scrollTop = this.ui.chat.scrollHeight;
  }
  update({ role, content }) {
    // 获取最后的 div, 更新 div 
  }

}
