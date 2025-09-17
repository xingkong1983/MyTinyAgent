import time
import json
import asyncio
class LLMTool:
    @staticmethod
    async def putChar( text, id="fake-id",  model="fake-model",  sleepTime = 0.01):
        for ch in text:
            chunk = {
                "id": id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": model,
                "choices": [
                    {
                        "index": 0,
                        "delta": {"content": ch},
                        "finish_reason": None
                    }
                ]
            }
            yield f"data: {json.dumps(chunk)}\n\n"
            if sleepTime > 0:
                await asyncio.sleep(sleepTime)

    @staticmethod
    async def putLine(text, id="fake-id",  model="fake-model",  sleepTime = 0.01):
        for line in text.splitlines(keepends=True):   # keepends=True 保留原始换行
            chunk = {
                "id": id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": model,
                "choices": [
                    {
                        "index": 0,
                        "delta": {"content": line},
                        "finish_reason": None
                    }
                ]
            }
            yield f"data: {json.dumps(chunk)}\n\n"
            if sleepTime > 0:
                await asyncio.sleep(sleepTime)
            
    @staticmethod
    async def putEnd(id="fake-id",  model="fake-model"):
        end_chunk = {
            "id": id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": model,
            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]
        }
        yield f"data: {json.dumps(end_chunk)}\n\n"
        yield "data: [DONE]\n\n"


    @staticmethod
    def getStopJson(text, id="fake-id",  model="fake-model"):
        return {
            "choices": [
                {
                    "message": {"role": "assistant", "content": text},
                    "finish_reason": "stop",
                    "index": 0
                }
            ],
            "created": int(time.time()),
            "id": id,
            "model": model,
            "object": "chat.completion"
        }