
###### 多会话单智能体（学术问答智能体）**全栈开发**

前端技术栈（PC浏览器）： UI： 展示/交互
	HTML+CSS+JS HTML+CSS:UI = View,   JS: model/state/logic => HTTP => 浏览器（Document Tree/DOM）JS 找
      
   Type Script(TS) JS 补充：类型增强。 .ts tsc => .js  web server: apache/nginx
   ElementPlus：元素组件
	VUE3：前端应用框架/单页面应用： M-V， component （.vue）
	VITE：前端服务框架（web服务/build工具）开发用， 真正的web服务器：apche，nginx
	Pinia：状态管理（基于ts）

后端技术栈（基于 python）：  Java/nodejs/python
	FASTApi：基于 python 后端应用框架
	Uvicorn：后端服务框架（web服务/Restfull 应用服务）
	SQLAlchemy：ORM（对象关系映射）+SQLlite
	Pydantic：类型验证 (Python语言) 用户定义的类的类型
	langchain1.X： agent 开发

部署， docker


全栈：起点：技术栈；
终点： 业务逻辑 
         => 应用架构设计模块化设计（OOD）
         => 状态和时序(并发)
         => 架构师

前置条件，在 windows：
	1. python
	2. anaconda
	3. node.js
	4. git


==============================================================
2

后端环境搭建

1. 搭建conda 环境
   Anaconda promt =>
   conda create -n py314-knowledge-agent python=3.14
   conda activate py314-knowledge-agent
2. 工作目录
   D:\Kevin\ai-ide-work-space\knowledge_agent
   code .

3. 安装python包
   pip install fastapi
   pip install uvicorn
   写一个简单的hello fastapi 程序
   app/main.py

   pip install sqlalchemy
   pip install langchain langchain-community langchain-deepseek
   pip install arxiv langchain-arxiv
   
   pip install -r requirements.txt

   启动后端：uvicorn app.main:app --reload --host 0.0.0.0 
   --port 8000
   调试： uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
   验证后端：http://localhost:8000/
            http://localhost:8000/docs/
  
==============================================================
3

数据结构定义和数据库自动生成

app/models.py:
会话：ChatSession：id，title, created_at
消息：ChatMessage：id, sesion_id, role, content, created_at

app/database.py:
获取 get_db
创建所有数据表 create_tables

==============================================================
4

数据操作, 后端 api （endpoint） 
api.py: 定义所有供前端调用的接口
crud.py: 封装是所有的数据库操作
schemas.py: 定义接口数据的( pydantic 类型验证)


==============================================================
5

会话管理前端实现 - 纯 HTML+CSS+JS 实现
文件：
index.html
style.css
main.js

启动live server

prompt: 请仔细一下backend/app 文件夹下的6个py 文件代码，根据后端API定义，生成前端知识库会话管理代码，纯三大件实现，包括三个文件： index.hetml, mian.js, style.css， 不使用额外的组件，将生成的3个文件放入frontend_pure文件夹下。
后端启动脚本是： uvicorn app.main:app --reload --host 0.0.0.0 
   --port 8000
   注意：尽力做简单实现，不要太复杂

prompt2: 给你的建议：没有输入框，请你参考这个界面吧：名称就叫“学术问答智能体”，主题颜色选择商务渐变色调，你自己的发挥

==============================================================
6

VUE 手动脚手架


==============================================================
7

VUE 自动脚手架
### 前端
cd frontend
npm create vite@latest . -- --template vue-ts

npm install
npm install pinia vue-router@4 axios
npm install element-plus @element-plus/icons-vue
npm install vuedraggable
npm install marked


prompt: 
1. 请你读取并理解 目录backend/app 下的所有py文件
2. 好的， 根据后端API定义，生成前端知识库会话管理代码，技术栈为Vue3+vite+elementplus+pinor实现，将所有生成的前端代码放在frontend文件夹下，如果需要覆盖的话可以询问我； 建议： 前端页面布局和样式风格以及功能方面可以参考frontend_pure下的页面布局和样式风格
3. 继续

==============================================================
8

VUE 实现前端会话管理
### 前端
cd frontend
npm create vite@latest . -- --template vue-ts

npm install
npm install pinia vue-router@4 axios
npm install element-plus @element-plus/icons-vue
npm install vuedraggable
npm install marked


prompt: 
1. 请你读取并理解 目录backend/app 下的所有py文件
2. 好的， 根据后端API定义，生成前端知识库会话管理代码，技术栈为Vue3+vite+elementplus+pinor实现，将所有生成的前端代码放在frontend文件夹下，如果需要覆盖的话可以询问我； 建议： 前端页面布局和样式风格以及功能方面可以参考frontend_pure下的页面布局和样式风格
3. 继续
4. uvicorn app.main:app --reload --host 0.0.0.0 
5. npm run dev
==============================================================
9

后端学术智能体实现，包括：services.py/api.py/schemas.py/config.py/.env
前端问答实现，问答/通话：流式（request/websocket）/非流式（容易，request/response）