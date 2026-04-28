<template>
  <div class="session-list-container">
    <!-- 新建会话按钮 -->
    <div class="sidebar-header">
      <div class="sidebar-title-group">
        <span class="sidebar-icon">💬</span>
        <h2>聊天会话</h2>
      </div>
      <el-button type="primary" class="btn-new-chat" @click="handleCreateSession">
        <el-icon><Plus /></el-icon>
        新会话
      </el-button>
    </div>

    <!-- 会话列表 -->
    <div class="session-list" v-loading="store.loading">
      <el-empty v-if="!store.loading && store.sessions.length === 0" description="暂无会话" :image-size="80" />
      
      <div
        v-else
        v-for="session in store.sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === store.currentSessionId }"
        @click="handleSelectSession(session.id)"
      >
        <span class="session-item-title">{{ session.title }}</span>
        <div class="session-item-actions" @click.stop>
          <el-button
            type="danger"
            size="small"
            text
            @click="handleDeleteSession(session.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 后端状态显示 -->
    <div class="sidebar-footer">
      <div class="status-indicator">
        <span class="status-dot" :class="store.isBackendOnline ? 'online' : 'offline'"></span>
        <span class="status-text" :style="{ color: store.isBackendOnline ? '#4caf50' : '#f44336' }">
          {{ store.isBackendOnline ? '后端已连接' : '后端未连接' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';

const store = useSessionStore();

// 定时器
let statusCheckInterval: number | null = null;

// 加载会话列表
onMounted(() => {
  store.loadSessions();
  startBackendStatusCheck();
});

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
});

// 开始后端状态检测
function startBackendStatusCheck() {
  store.checkBackendStatus();
  statusCheckInterval = window.setInterval(() => {
    store.checkBackendStatus();
  }, 3000);
}

// 选择会话
async function handleSelectSession(sessionId: string) {
  try {
    await store.selectSession(sessionId);
  } catch (error) {
    ElMessage.error('选择会话失败');
  }
}

// 创建新会话
async function handleCreateSession() {
  try {
    const { value } = await ElMessageBox.prompt('输入新会话标题 (可选):', '新建会话', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '标题不能为空',
    });
    
    await store.createSession(value || undefined);
    ElMessage.success('会话创建成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('创建会话失败');
    }
  }
}

// 删除会话
async function handleDeleteSession(sessionId: string) {
  try {
    await ElMessageBox.confirm('确定删除该会话吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await store.deleteSession(sessionId);
    ElMessage.success('会话已删除');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除会话失败');
    }
  }
}
</script>

<style scoped>
.session-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar-icon {
  font-size: 20px;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn-new-chat {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-new-chat:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.session-item {
  padding: 12px 16px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 4px 8px;
  border-radius: 4px;
}

.session-item:hover {
  background-color: #f8f9fa;
}

.session-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left-color: #667eea;
}

.session-item-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 500;
}

.session-item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-item-actions {
  opacity: 1;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot.online {
  background-color: #4caf50;
}

.status-dot.offline {
  background-color: #f44336;
  animation: none;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
