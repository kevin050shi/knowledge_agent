from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

from app.config import settings

engine = create_engine(
    settings.database_url, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 可以多次被调用，首次调用时会创建数据库和数据表，之后的调用会检测到数据库和数据表已经存在，因此不会重复创建或覆盖现有的数据
# 这在应用启动时调用一次即可，后续的 CRUD 操作会使用已经存在的数据库和数据表
# 这种方式简单直接，适合小型应用或开发阶段使用
# 对于生产环境或大型应用，可能需要更复杂的数据库迁移工具（如 Alembic）来管理数据库模式的变化
# 但对于这个项目来说，直接在应用启动时创建数据库和数据表是足够的
# 注意：如果数据库文件已经存在，create_all 不会覆盖现有的表结构，因此不会丢失数据
# 但是如果模型发生了变化（如添加了新的字段），需要手动删除数据库文件或使用迁移工具来更新表结构
# 这种方式的优点是简单易用，缺点是无法自动处理数据库模式的变化（如添加新字段），需要手动管理数据库文件或使用迁移工具来更新表结构
# 适合开发阶段使用，生产环境建议使用迁移工具来管理数据库模式的变化
def create_tables():    
    Base.metadata.create_all(bind=engine)
