from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

import logging

from .database import create_tables

from .api import router as chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run before the application starts
    logger.info("Starting up...")
    create_tables() # 创建数据库和数据表
    yield
    # Code to run after the application shuts down
    logger.info("Shutting down...")

app = FastAPI(
    title="Knowledge Agent API",
    description="API for managing chat sessions and messages in the Knowledge Agent application.",
    version="1.0.0",
    lifespan=lifespan # 注册 lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源, 生产环境建议指定具体的前端URL(域名)
    allow_credentials=True,  # 允许携带凭证（如Cookies）
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

app.include_router(chat_router) # 注册聊天相关的API路由




# # crud: create/read/update/delete
# # api / endpoint / router
# @app.get("/")
# async def root():
#     return {"Hello": "FastAPI"}

# @app.get("/sessions")
# async def read_sessions():
#     return [
#         {"session_id": 1, "user": "Kevin"},
#         {"session_id": 2, "user": "Rob"}
#     ]