(function () {
  // 1. 运行时错误（含普通 JS 错误、资源加载错误）
  window.addEventListener('error', function (event) {
    // 过滤掉跨域脚本错误（防止拿不到堆栈）
    const isCrossOrigin = event.message === 'Script error.';
    const info = {
      type: 'RuntimeError',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: isCrossOrigin ? 'CORS 脚本，无详细信息' : event.error?.stack || null,
      timestamp: new Date().toISOString()
    };
    console.error('❌ [RuntimeError]', info);
  }, true);   // 捕获阶段，确保拿到资源加载错误

  // 2. 未处理的 Promise 错误
  window.addEventListener('unhandledrejection', function (event) {
    const info = {
      type: 'UnhandledRejection',
      reason: event.reason,
      message: event.reason?.message || event.reason,
      stack: event.reason?.stack || null,
      timestamp: new Date().toISOString()
    };
    console.error('❌ [UnhandledRejection]', info);
    event.preventDefault(); // 阻止浏览器默认的红色提示
  });
})();