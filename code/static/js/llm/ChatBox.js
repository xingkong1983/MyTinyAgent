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
    this.bindDOM(idList);
    this.bindEvent();
  }

  bindDOM(idList) {
    this.inp = document.getElementById(idList.input);
    this.chat = document.getElementById(idList.chat);
    this.sendBtn = document.getElementById(idList.sendBtn);
    this.stopBtn = document.getElementById(idList.stopBtn);
    this.tips = document.getElementById(idList.tips);

    if (!this.chat || !this.inp || !this.sendBtn || !this.stopBtn)
      throw new Error('ChatBox: 缺少必要 DOM ID');


  }

  bindEvent() {
    this.client.addEventListener('chat-start', () => this.setLoading(true));
    this.client.addEventListener('chat-done', () => this.setLoading(false));
    this.client.addEventListener('chat-add', e => this.addChat(e));
    this.client.addEventListener('chat-update', e => this.updateChat(e));

    this.sendBtn.onclick = () => {
      this.send()
    };
    
    this.stopBtn.onclick = () => {
      this.client.stop()
    };

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
    if(e.detail.role === "user"){
      section.innerHTML += `
        <div class="msg-header">
          <img class="icon20" src="/static/img/avatar/user.svg"></img>
          <div>用户</div>
        </div>
        <div class="msg-content">
          ${e.detail.content}
        </div>
      `;
    } else {
      section.innerHTML = `
        <div class="msg-header">
          <img class="icon20" src="/static/img/avatar/assistant.svg"></img>
          <div>Qwen32b</div>
        </div>
        <div class="msg-content">
          ${e.detail.content}
        </div>
      `
    }

    this.chat.appendChild(section);

  }

  updateChat(e) {
   const contentDiv = document.querySelector(
    'div section:last-of-type .msg-content:last-of-type'
  );
    contentDiv.innerHTML = marked.parse(e.detail.content);
  }

}
