import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # DeepSeek配置
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_model: str = os.getenv("DEEPSEEK_MODEL", "")
    deepseek_base_url: str = os.getenv("DEEPSEEK_BASE_URL", "")

    # BAILIAN配置
    bailian_api_key: str = os.getenv("BAILIAN_API_KEY", "")
    bailian_model: str = os.getenv("BAILIAN_MODEL", "")
    bailian_base_url: str = os.getenv("BAILIAN_BASE_URL", "")
    
    # Tavily搜索配置
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "")
    
    # 数据库配置
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./knowledge_agent.db")
    
    # 服务器配置
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Agent配置
    agent_temperature: float = float(os.getenv("AGENT_TEMPERATURE", "0.1"))
    agent_max_tokens: int = int(os.getenv("AGENT_MAX_TOKENS", "2000"))
    agent_timeout: int = int(os.getenv("AGENT_TIMEOUT", "30"))
    agent_max_retries: int = int(os.getenv("AGENT_MAX_RETRIES", "2"))
    
    class Config:
        env_file = ".env"

settings = Settings()