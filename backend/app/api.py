# backend / app / api.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import json
import logging

from app.services import agent_service

logger = logging.getLogger(__name__)

from .database import get_db
from . import crud
from .schemas import(
    SessionCreate,     
    SessionUpdate,
    SessionResponse,
    MessageCreate,
    MessageResponse,
    ChatRequest,
    ChatResponse    
)

router = APIRouter(prefix="/api/chat", tags=["chat"])

# ============================== 会话管理 ==============================

## CRUD: Create/Read/Update/Delete

# psot => create
@router.post("/sessions", response_model=SessionResponse)
async def create_chat_session(
    session_data: SessionCreate, 
    db: Session = Depends(get_db)
):
    """创建新的聊天会话"""
    session = crud.create_session(db, session_data)
    return session

@router.get("/sessions", response_model=list[SessionResponse])
async def get_sessions(
    db: Session = Depends(get_db)
):
    """获取所有聊天会话"""
    sessions = crud.get_sessions(db)
    return sessions

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """获取特定的聊天会话"""
    session = crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 获取会话消息  
    messages = crud.get_messages_by_session(db, session_id)
    session.messages = messages    

    return session

# put => update
@router.put("/sessions/{session_id}", response_model=SessionResponse)
async def update_chat_session(
    session_id: str,
    update_data: SessionUpdate,
    db: Session = Depends(get_db)
):
    """更新会话的信息"""

    # 检查会话是否存在
    session = crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 更新会话信息
    update_chat_session = crud.update_session(db, session_id, update_data)
    if not update_chat_session:
        raise HTTPException(status_code=500, detail="Failed to update session")
    
    # 获取会话消息  
    messages = crud.get_messages_by_session(db, session_id)
    update_chat_session.messages = messages    

    return update_chat_session

@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def patch_chat_session(
    session_id: str,
    update_data: SessionUpdate,
    db: Session = Depends(get_db)
):
    """部分更新会话的信息(PATCH方法)"""
    # 复用 update_chat_session 函数，因为它已经处理了过滤 None 值的逻辑
    return await update_chat_session(session_id, update_data, db)

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """删除聊天会话"""
    success = crud.delete_session(db, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}

@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_messages_by_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """获取指定会话中的所有消息"""
    # 确保会话存在
    session = crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = crud.get_messages_by_session(db, session_id)
    return messages

# ====================== 消息处理 ======================

@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """发送消息（非流式）"""
    logger.info("api.py - send_message - 用户发送非流式消息")
    logger.info(f"ChatRequest: {chat_request}")
    
    if chat_request.stream:
        raise HTTPException(status_code=400, detail="Use /stream endpoint for streaming")
    
    session_id = chat_request.session_id
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id不能为空")
    
    # 获取历史消息
    history_messages = crud.get_messages_by_session(db, session_id)
    history = []
    for msg in history_messages:
        history.append({
            "role": msg.role,
            "content": msg.content,
            "tool_calls": msg.tool_calls,
            "tool_results": msg.tool_results
        })
    logger.info(f"本会话历史消息数量: {len(history)}")
    
    # 保存用户消息
    logger.info("保存用户消息到数据库")
    user_message = crud.create_message(db, MessageCreate(
        session_id=session_id,
        role="user",
        content=chat_request.message
    ))
    
    # 使用Agent处理消息
    logger.info("调用Agent处理消息")
    agent_response = await agent_service.process_message(
        chat_request.message, 
        history
    )
    
    # 保存Assistant消息
    logger.info("保存Assistant消息到数据库")
    assistant_message = crud.create_message(db, MessageCreate(
        session_id=session_id,
        role="assistant",
        content=agent_response["content"],
        tool_calls=agent_response["tool_calls"],
        tool_results=agent_response["tool_results"]
    ))
    logger.info("Assistant消息保存完成")
    return ChatResponse(
        session_id=session_id,
        message=assistant_message,
        is_complete=True
    )

@router.post("/stream")
async def stream_message_post(
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """流式发送消息（POST方法）- 真正的流式处理"""
    logger.info("Received streaming chat request via POST")
    logger.info(f"ChatRequest: {chat_request}")
    
    if not chat_request.message:
        raise HTTPException(status_code=400, detail="消息不能为空")
    
    session_id = chat_request.session_id
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id不能为空")
    
    # 检查会话是否存在
    session = crud.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 保存用户消息
    user_message = crud.create_message(db, MessageCreate(
        session_id=session_id,
        role="user",
        content=chat_request.message
    ))
    
    # 获取历史消息（排除刚添加的用户消息）
    history_messages = crud.get_messages_by_session(db, session_id)
    history = []
    for msg in history_messages[:-1]:  # 排除刚添加的用户消息
        history.append({
            "role": msg.role,
            "content": msg.content,
            "tool_calls": msg.tool_calls,
            "tool_results": msg.tool_results
        })
    
    async def generate():
        logger.info("Starting real stream generation")
        logger.info(f"消息: {chat_request.message}")
        logger.info(f"会话ID: {session_id}")
        logger.info(f"历史消息数量: {len(history)}")
        
        try:
            full_content = ""
            tool_calls_data = None
            
            logger.info("开始调用agent_service.process_stream...")
            
            # 使用真正的流式处理
            async for chunk in agent_service.process_stream(
                chat_request.message, 
                history
            ):
                if chunk["is_final"]:
                    # 最终块，包含工具调用信息
                    tool_calls_data = chunk.get("tool_calls")
                    logger.info(f"收到最终块，工具调用: {tool_calls_data}")
                    
                    # 保存完整的Assistant消息到数据库
                    if full_content:
                        assistant_message = crud.create_message(db, MessageCreate(
                            session_id=session_id,
                            role="assistant",
                            content=full_content,
                            tool_calls=json.dumps(tool_calls_data) if tool_calls_data else None
                        ))
                        logger.info(f"Assistant消息保存成功，ID: {assistant_message.id}")
                    
                    # 发送最终消息
                    final_data = {
                        "content": "",
                        "is_final": True,
                        "tool_calls": tool_calls_data
                    }
                    yield f"data: {json.dumps(final_data)}\n\n"
                else:
                    # 内容块
                    content_chunk = chunk.get("content", "")
                    if content_chunk:
                        full_content += content_chunk
                        
                        # 发送内容块
                        chunk_data = {
                            "content": content_chunk,
                            "is_final": False
                        }
                        yield f"data: {json.dumps(chunk_data)}\n\n"
                
        except Exception as e:
            logger.error(f"流式处理异常: {e}", exc_info=True)
            error_data = {
                "content": f"错误: {str(e)}",
                "is_final": True,
                "tool_calls": None
            }
            yield f"data: {json.dumps(error_data)}\n\n"
        finally:
            # 确保发送结束标记
            yield "data: [DONE]\n\n"
            logger.info("流式响应结束")
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*"
        }
    )

# @router.post("/sessions/{session_id}/messages", response_model=MessageResponse)
# async def create_message(
#     session_id: str,
#     message_data: MessageCreate,
#     db: Session = Depends(get_db)
# ):
#     """创建新消息"""
#     # 验证会话是否存在
#     session = crud.get_session(db, session_id)
#     if not session:
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     message = crud.create_message(db, message_data)
#     return message