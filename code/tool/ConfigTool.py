import os
from pathlib import Path
from configparser import ConfigParser

class ConfigTool:
    # 静态配置类，只加载一次
    _cfg = None

    @classmethod
    def _load(cls) -> ConfigParser:
        if cls._cfg is None:
            env = os.getenv("ENV", "dev")
            cfg_file = Path(__file__).parent.parent.parent / f"config/config-{env}.ini"
            if not cfg_file.exists():
                raise FileNotFoundError(cfg_file)
            cls._cfg = ConfigParser(interpolation=None)
            cls._cfg.read(cfg_file, encoding="utf-8")
        return cls._cfg

    @classmethod
    def get(cls, section: str, key: str, fallback=None):
        return cls._load().get(section, key, fallback=fallback)

    @classmethod
    def getInt(cls, section: str, key: str, fallback=0):
        return cls._load().getint(section, key, fallback=fallback)

    @classmethod
    def getBoolean(cls, section: str, key: str, fallback=False):
        return cls._load().getboolean(section, key, fallback=fallback)
    
    @classmethod
    def printAll(cls):
        # 将所有配置逐行打印到控制台 
        print("================================\r\n")
        print("     load config                \r\n")
        print("================================\r\n")
        cfg = cls._load()
        for section_name in cfg.sections():
            print(f"[{section_name}]")
            for key, value in cfg.items(section_name):
                print(f"{key} = {value}")
            print()  # 空行分隔 section
        print("================================\r\n")