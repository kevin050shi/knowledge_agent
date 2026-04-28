<template>
  <div class="message-input-container">
    <!-- 角色选择器和流式开关 -->
    <div class="controls-bar">
      <div class="control-group">
        <div class="control-label">角色</div>
        <el-select v-model="selectedRole" placeholder="选择角色" style="width: 140px">
          <el-option label="用户" value="user" />
          <el-option label="助手" value="assistant" />
          <el-option label="系统" value="system" />
          <el-option label="工具" value="tool" />
        </el-select>
      </div>
      
      <div class="control-group">
        <el-switch
          v-model="enableStream"
          active-text="流式响应"
          inactive-text="普通响应"
          inline-prompt
        />
      </div>
    </div>

    <!-- 消息输入框 -->
    <div class="input-area">
      <el-input
        v-model="messageContent"
        type="textarea"
        :rows="3"
        placeholder="输入消息...（Shift+Enter换行）"
        resize="none"
        @keydown="handleKeydown"
      />
      <el-button
        type="primary"
        class="btn-send"
        :loading="sending"
        :disabled="!messageContent.trim()"
        @click="handleSendMessage"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { MessageRole } from '@/types';
import { chatApi } from '@/api/chat';

const props = defineProps<{
  sessionId: string;
}>();

const emit = defineEmits<{
  (e: 'messageSent'): void;
  (e: 'streamStart'): void;
  (e: 'streamChunk', content: string): void;
  (e: 'streamEnd'): void;
}>();

const selectedRole = ref<MessageRole>('user');
const messageContent = ref('');
const sending = ref(false);
const enableStream = ref(true); // 默认开启流式响应

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
}

// 发送消息
async function handleSendMessage() {
  if (!props.sessionId || !messageContent.value.trim()) {
    return;
  }

  const message = messageContent.value.trim();
  messageContent.value = '';
  sending.value = true;

  try {
    if (enableStream.value) {
      // 流式响应
      await handleStreamMessage(message);
    } else {
      // 非流式响应
      await handleNormalMessage(message);
    }
  } catch (error: any) {
    ElMessage.error('发送消息失败');
    console.error('发送消息错误:', error);
  } finally {
    sending.value = false;
  }
}

// 非流式发送
async function handleNormalMessage(message: string) {
  await chatApi.sendMessage(message, props.sessionId);
  emit('messageSent');
}

// 流式发送
async function handleStreamMessage(message: string) {
  emit('streamStart');
  
  try {
    const stream = await chatApi.sendStreamMessage(message, props.sessionId);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        emit('streamEnd');
        emit('messageSent');
        break;
      }

      // 解码数据块
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            emit('streamEnd');
            emit('messageSent');
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content && !parsed.is_final) {
              emit('streamChunk', parsed.content);
            }
          } catch (e) {
            console.warn('解析流式数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('流式处理错误:', error);
    throw error;
  }
}
</script>

<style scoped>
.message-input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #e6e9f2;
  border-radius: 12px;
  box-shadow: inset 0 1px 2px rgba(102, 126, 234, 0.06);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-label {
  font-size: 13px;
  color: #4f5b7a;
  font-weight: 600;
  min-width: 44px;
}

.input-area {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-area :deep(.el-textarea__inner) {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  max-height: 120px;
  transition: all 0.2s ease;
}

.input-area :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-send {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  min-width: 80px;
  height: fit-content;
}

.btn-send:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.btn-send:active {
  transform: translateY(0);
}
</style>
