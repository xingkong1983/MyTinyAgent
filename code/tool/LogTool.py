"""
日志库，提供 getLog(name) 函数获取日志器。
内部所有配置均通过 tool.ConfigTool 读取。
"""
import logging
import logging.config
import os
from typing import Dict, Any
from tool.ConfigTool import ConfigTool

class LogTool:
    # ---------- 内部工具 ----------
    @classmethod
    def _ensureDir(cls, path: str) -> None:
        """确保目录存在"""
        if not os.path.isdir(path):
            os.makedirs(path, exist_ok=True)

    @classmethod
    def _buildConfig(cls) -> Dict[str, Any]:
        """
        根据 ConfigTool 中的配置生成 logging.dictConfig 所需的字典。
        仅保留最常用配置：
            log.level     全局日志级别
            log.format    日志格式
            log.path      日志文件路径（留空则只输出到控制台）
        """
        level = ConfigTool.get("log", "level", "INFO").upper()
        fmt = ConfigTool.get(
            "log","format",
            "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] %(message)s"
        )
        logPath = ConfigTool.get("log","path", "").strip()
        print(logPath)
        handlers: Dict[str, Any] = {}
        # 控制台处理器
        handlers["console"] = {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": level,
            "stream": "ext://sys.stdout"
        }

        # 文件处理器（仅在 log.path 非空时启用）
        if logPath:
            cls._ensureDir(os.path.dirname(logPath))
            handlers["file"] = {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "default",
                "level": level,
                "filename": logPath+"/app.log",
                "maxBytes": 10 * 1024 * 1024,  # 10 MB
                "backupCount": 3,
                "encoding": "utf-8"
            }

        config = {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": fmt
                }
            },
            "handlers": handlers,
            "root": {
                "level": level,
                "handlers": list(handlers.keys())
            }
        }
        config.setdefault("loggers", {}).update({
            # 这里填需要被过滤的 logger name
            "httpcore":     {"level": "ERROR", "handlers": [], "propagate": False},
            "httpx":     {"level": "ERROR", "handlers": [], "propagate": False},
            "asyncio":     {"level": "ERROR", "handlers": [], "propagate": False}
        })
        return config

    # ---------- 全局只初始化一次 ----------
    _setupDone: bool = False

    @classmethod
    def _setupOnce(cls) -> None:
        """确保 logging 配置只初始化一次"""
        if cls._setupDone:
            return
        logging.config.dictConfig(cls._buildConfig())
        cls._setupDone = True

    # ---------- 对外接口 ----------
    @classmethod
    def getLog(cls, name: str) -> logging.Logger:
        """
        获取日志器。
        参数:
            name 通常传入 __name__
        返回:
            logging.Logger 实例
        """
        cls._setupOnce()
        return logging.getLogger(name)