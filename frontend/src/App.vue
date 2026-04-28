<script setup lang="ts">
import SessionList from './components/SessionList.vue';
import SessionDetail from './components/SessionDetail.vue';
import { useSessionStore } from '@/stores/session';

const sessionStore = useSessionStore();
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-info">
          <h1>🤖 学术问答智能体</h1>
          <p>AI驱动的研究助手，高效收集和分析信息</p>
        </div>
      </div>
    </header>

    <div class="container">
      <!-- 侧边栏：会话列表 -->
      <aside class="sidebar">
        <SessionList />
      </aside>

      <!-- 主区域：会话详情 -->
      <main class="main-content">
        <div v-if="!sessionStore.currentSessionId" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>选择或创建一个会话开始对话</p>
        </div>
        
        <SessionDetail v-else />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 顶部标题栏 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-info h1 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.header-info p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.container {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .app-header {
    padding: 16px;
  }

  .header-info h1 {
    font-size: 20px;
  }

  .header-info p {
    font-size: 12px;
  }

  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 35vh;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }

  .main-content {
    flex: 1;
    padding: 16px;
  }
}
</style>
