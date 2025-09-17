from fastapi import Request
from fastapi.responses import StreamingResponse
from tool.LLMTool import LLMTool

from fastapi import APIRouter

router = APIRouter(prefix="/fakeLLM", tags=["Fake LLM"])

# 曹操《观沧海》
text_poem = """
<think>  
老大要我给出一首曹操的诗，我想《观沧海》比较合适。    
我将逐句输出原文，每两句进行换行，以符合老大的排版审美。
最后的注解采用引文格式，方便进行阅读。
</think>  
# 曹操《观沧海》  
东临碣石，以观沧海。  
水何澹澹，山岛竦峙。  
树木丛生，百草丰茂。  
秋风萧瑟，洪波涌起。  
日月之行，若出其中；  
星汉灿烂，若出其里。  
幸甚至哉，歌以咏志。 

《观沧海》是曹操北征乌桓得胜回师途中，登临碣石山望海所作。诗人以雄浑的笔触，勾勒出大海吞吐日月、包蕴星汉的壮阔景象，借秋风中汹涌的波涛，寄寓了自己统一天下、建功立业的豪迈志向。
""".strip()

async def fakeLLMGen(text=text_poem):
    # 逐字符流式返回
    async for chunk in LLMTool.putChar(text):
        yield chunk
    async for chunk in LLMTool.putEnd():
        yield chunk

@router.post("/v1/chat/completions")
async def fakeLLMStream(request: Request):
    return StreamingResponse(fakeLLMGen(), media_type="text/plain")