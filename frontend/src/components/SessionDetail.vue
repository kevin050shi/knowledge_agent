<template>
  <div class="session-detail" v-if="store.currentSession">
    <!-- 会话头部 -->
    <div class="session-header">
      <div class="header-title">
        <h2>{{ store.currentSession.title }}</h2>
        <span class="session-time">创建: {{ formatDateTime(store.currentSession.created_at) }}</span>
      </div>
      <div class="header-actions">
        <el-button text @click="showEditForm = true" title="编辑标题">
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button type="danger" text @click="handleDeleteSession" title="删除会话">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 编辑标题表单 -->
    <el-form v-if="showEditForm" class="edit-form" @submit.prevent="handleSaveTitle">
      <el-input
        v-model="editTitle"
        placeholder="输入新标题"
        @keyup.enter="handleSaveTitle"
      />
      <el-button type="primary" @click="handleSaveTitle">保存</el-button>
      <el-button @click="showEditForm = false">取消</el-button>
    </el-form>

    <!-- 消息列表 -->
    <MessageList 
      :messages="store.currentSession.messages || []" 
      :streaming-content="streamingContent"
    />

    <!-- 消息输入框 -->
    <MessageInput
      :session-id="store.currentSession.id"
      @message-sent="handleMessageSent"
      @stream-start="handleStreamStart"
      @stream-chunk="handleStreamChunk"
      @stream-end="handleStreamEnd"
    />

    <!-- 会话信息栏 -->
    <div class="session-meta-panel">
      <div class="session-info-bar">
        <div class="info-group">
          <label>会话ID</label>
          <span class="info-value">{{ store.currentSession.id }}</span>
        </div>
        <div class="info-group">
          <label>创建时间</label>
          <span class="info-value">{{ formatDateTime(store.currentSession.created_at) }}</span>
        </div>
        <div class="info-group">
          <label>更新时间</label>
          <span class="info-value">{{ formatDateTime(store.currentSession.updated_at) }}</span>
        </div>
        <div class="info-group">
          <label>消息数量</label>
          <span class="info-value">{{ store.currentSession.messages?.length || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';
import { formatDateTime } from '@/utils/format';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

const store = useSessionStore();

const showEditForm = ref(false);
const editTitle = ref('');
const streamingContent = ref(''); // 流式响应的累积内容
const isStreaming = ref(false); // 是否正在流式响应

// 显示编辑表单
function showEditFormHandler() {
  editTitle.value = store.currentSession?.title || '';
  showEditForm.value = true;
}

// 保存标题
async function handleSaveTitle() {
  if (!store.currentSessionId || !editTitle.value.trim()) {
    ElMessage.warning('标题不能为空');
    return;
  }

  try {
    await store.updateSessionTitle(store.currentSessionId, editTitle.value.trim());
    showEditForm.value = false;
    ElMessage.success('标题更新成功');
  } catch (error) {
    ElMessage.error('更新标题失败');
  }
}

// 删除会话
async function handleDeleteSession() {
  if (!store.currentSessionId) return;

  try {
    await ElMessageBox.confirm('确定删除该会话吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await store.deleteSession(store.currentSessionId);
    ElMessage.success('会话已删除');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除会话失败');
    }
  }
}

// 流式响应开始
function handleStreamStart() {
  isStreaming.value = true;
  streamingContent.value = '';
}

// 流式响应数据块
function handleStreamChunk(content: string) {
  streamingContent.value += content;
}

// 流式响应结束
function handleStreamEnd() {
  isStreaming.value = false;
  streamingContent.value = '';
}

// 消息发送后刷新
async function handleMessageSent() {
  if (store.currentSessionId) {
    await store.fetchSession(store.currentSessionId);
  }
}
</script>

<style scoped>
.session-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 24px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.header-title h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 4px 0;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 编辑表单 */
.edit-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

/* 会话信息面板 */
.session-meta-panel {
  margin-top: 12px;
  background-color: #f7f8fc;
  border: 1px solid #eef1f7;
  border-radius: 16px;
  padding: 14px;
}

.session-info-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e6e9f2;
  border-radius: 14px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-group label {
  font-size: 12px;
  font-weight: 700;
  color: #4f5b7a;
}

.info-value {
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #f7f8fc;
  color: #2f3a5b;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .session-info-bar {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .session-info-bar {
    grid-template-columns: 1fr;
  }
}
</style>
