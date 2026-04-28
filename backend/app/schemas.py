# backend / app / schemas.py
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# 消息基类
class MessageBase(BaseModel):
    role: str  # 'user' or 'assistant' or 'system' or 'tool'
    content: str
    session_id: str

    # 允许从ORM实例(SQLAlchemy模型)对象创建Pydantic模型
    model_config = ConfigDict(from_attributes=True)

# 创建消息的请求体 (输入)
class MessageCreate(MessageBase):
    tool_calls: Optional[str] = None
    tool_results: Optional[str] = None

# 消息响应模型 （输出）
class MessageResponse(MessageBase):
    id: str
    created_at: datetime

class SessionBase(BaseModel):
    title: Optional[str] = "New Chat Session"

    # 允许从ORM实例(SQLAlchemy模型)对象创建Pydantic模型
    model_config = ConfigDict(from_attributes=True)

# 创建会话的请求体 (输入)
class SessionCreate(SessionBase):
    pass

# 更新会话的请求体 (输入)
class SessionUpdate(SessionBase):
    pass

# 会话响应模型 （输出）
class SessionResponse(SessionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []  # 包含会话中的消息列表

# 聊天请求
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    stream: Optional[bool] = False
    
# 聊天响应
class ChatResponse(BaseModel):
    session_id: str
    message: MessageResponse
    is_complete: bool = True

# 流式响应块
class ChatStreamChunk(BaseModel):
    content: str
    is_final: bool = False
    tool_calls: Optional[List[Dict[str, Any]]] = None
