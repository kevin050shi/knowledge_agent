from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

import uuid

def generate_uuid():
    return str(uuid.uuid4())

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = 'chat_session'

    id = Column(String(36), primary_key=True, index=True, default=generate_uuid)
    title = Column(String(200), nullable=False, default="New Chat Session")
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    # 定义一对多的关系
    messages= relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = 'chat_messages'

    id = Column(String(36), primary_key=True, index=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("chat_session.id", ondelete="CASCADE"), nullable=False, index=True)    
    role = Column(String(10), nullable=False)  # 'user' or 'assistant' or 'system' or 'tool'
    content = Column(Text, nullable=False)
    tool_calls = Column(Text, nullable=True, default="")  # 工具调用信息（JSON字符串）
    tool_results = Column(Text, nullable=True, default="")  # 工具执行结果（JSON字符串）
    created_at = Column(DateTime, nullable=False, default=func.now())

    session = relationship("ChatSession", back_populates="messages")