/* ===== logger.js ===== */
(function (global) {
  if (global.log) return;

  const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 };
  let currentLevel = LEVELS.INFO;

  const shouldLog = level => level >= currentLevel;

  // 借出 console 原生的方法，保证栈帧干净
  const nativeConsole = {
    debug: console.debug.bind(console),
    log:   console.log.bind(console),
    warn:  console.warn.bind(console),
    error: console.error.bind(console)
  };

  // 空函数，级别不够时用
  const noop = () => {};

  global.log = {
    setLevel(level) {
      if (typeof level === 'string') {
        level = LEVELS[level.toUpperCase()];
      }
      if (LEVELS.hasOwnProperty(level)) {
        currentLevel = level;
      }
    },

    // 直接返回原生方法或空函数
    get debug() { return shouldLog(LEVELS.DEBUG) ? nativeConsole.debug : noop; },
    get info()  { return shouldLog(LEVELS.INFO)  ? nativeConsole.log   : noop; },
    get warn()  { return shouldLog(LEVELS.WARN)  ? nativeConsole.warn  : noop; },
    get error() { return shouldLog(LEVELS.ERROR) ? nativeConsole.error : noop; }
  };

  // 让 TS/ESLint 识别为函数而非 getter
  ['debug', 'info', 'warn', 'error'].forEach(method => {
    global.log[method] = global.log[method];
  });
})(typeof window !== 'undefined' ? window : global);