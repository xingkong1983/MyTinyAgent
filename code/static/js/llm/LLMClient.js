class LLMClient {
  constructor({
    apiBase,
    model,
    token,
    botId = 'bot-007',
    eventBus = new EventBus() // 默认新建一个，也可外部传入共享实例
  }) {
    this.apiBase = apiBase;
    this.model = model;
    this.token = token;
    this.botId = botId;
    this.eventBus = eventBus;

    this.ctrl = null;
    this.curBlock = null;
    this.messages = []; // 历史记录，可选
  }


  reset() {
    // 1. 若正在输出，先停掉
    this.stop();

    // 2. 清空历史
    this.messages = [];

    // 3. 清空当前块指针
    this.curBlock = null;
  }


  async send(prompt) {
    if (!prompt) return;
    this.push('user', prompt);
    this.emit('chat-start');

    this.ctrl = new AbortController();
    try {
      const res = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          stream: true
        }),
        signal: this.ctrl.signal
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || res.statusText);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      this.curBlock = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') return;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content || '';
            this.handleDelta(delta);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      this.push('assistant', `**错误**：${e.message}`);
    } finally {
      this.emit('chat-done');
      this.ctrl = null;
      this.curBlock = null;
    }
  }

  stop() {
    this.ctrl?.abort();
  }

  push(role, text = '') {
    if (!this.curBlock || this.curBlock.role !== role) {
      this.curBlock = { role, content: text };
      this.messages.push(this.curBlock);
      this.emit('chat-add', { ...this.curBlock });
    } else {
      this.curBlock.content += text;
      this.emit('chat-update', { ...this.curBlock });
    }
  }

  handleDelta(delta) {
    this.push('assistant', delta);
  }

  // 统一加上 botId 后发到总线
  emit(type, detail = {}) {
    this.eventBus.emit(type, { ...detail, botId: this.botId });
  }
}
