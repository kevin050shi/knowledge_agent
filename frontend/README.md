# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


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