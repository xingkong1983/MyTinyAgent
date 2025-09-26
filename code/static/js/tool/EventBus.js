class EventBus extends EventTarget {
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  // 语法糖，可读性更好
  on(type, handler) {
    this.addEventListener(type, handler);
    return () => this.removeEventListener(type, handler); // 返回卸载函数
  }

  off(type, handler) {
    this.removeEventListener(type, handler);
  }
}