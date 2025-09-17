from tool.ConfigTool import ConfigTool
from tool.LogTool import LogTool
import uvicorn
import time

log = LogTool.getLog(__name__)

if __name__ == "__main__":
    log.info("My Tiny AI Agent Start!!!")
    ConfigTool.printAll()
    print(int(time.time()))
    uvicorn.run(
        "biz.MyTinyAgentServer:app",
        host=ConfigTool.get("server", "host", "0.0.0.0"),
        port=ConfigTool.getInt("server", "port", 5800),
        reload=True,
    )