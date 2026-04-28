前提：
# 安装 nodejs, https://nodejs.org/

步骤：
1. 生成 node 项目文件： package.json， 并适当修改
npm init -y

2. 安装 ts 支持模块（全局安装）

npm install -g typescript ts-node

C:\Users\kevin\AppData\Roaming\npm
+-- @wucai/wucai-code@0.0.59
+-- ts-node@10.9.2
`-- typescript@6.0.3

两个工具：
tsc: .tx => .js
ts-node: .ts => .js => 运行 js, node xx.js

3. 创建tsc配置文件，tsconfig.json，并适当修改；添加tsconfig.node.json
tsc --init

4. 安装 vue 和 vite 相关组件
npm install vue  # -D不需要，因为它不需要开发以来
npm -D install vite
npm -D install @vue/tsconfig
npm -D install @vitejs/plugin-vue

5. 编写代码
index.html => main.js => App.vue => components/Counter.vue => global.css

6. vite.config.ts => npm run dev

