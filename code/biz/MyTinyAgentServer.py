from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from tool.LogTool import LogTool
from tool.LLMTool import LLMTool
from biz.llm.FakeLLMApi  import router as fakeLLMRouter

log = LogTool.getLog(__name__)

# 定义路由收集相关模块路由
routerList = [
    fakeLLMRouter
]

# 生命周期
@asynccontextmanager
async def lifespan(app: FastAPI):
  yield
  log.info("lifespan")


# FastAPI 实例
app = FastAPI(
    title="LLM Server",
    version="0.1.0",
    lifespan=lifespan,
)

# 加载其它路由
for curRouter in routerList:
    app.include_router(curRouter)

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")

# 重定向到静态首页
@app.get("/")
async def redirect_to_static():
    return RedirectResponse(url="/static/index.html")

