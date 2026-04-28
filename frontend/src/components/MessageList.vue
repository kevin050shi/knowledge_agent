<template>
  <div class="messages-list" ref="messagesListRef">
    <el-empty v-if="!messages || messages.length === 0" description="暂无消息" :image-size="100" />
    
    <div
      v-else
      v-for="msg in messages"
      :key="msg.id"
      class="message-item"
      :class="msg.role === 'user' ? 'user' : 'assistant'"
    >
      <div>
        <div class="message-role">{{ getRoleLabel(msg.role) }}</div>
        <div class="message-bubble">{{ msg.content }}</div>
        <div class="message-meta">{{ formatTime(msg.created_at) }}</div>
      </div>
    </div>

    <!-- 流式响应消息 -->
    <div v-if="streamingContent" class="message-item assistant streaming">
      <div>
        <div class="message-role">助手</div>
        <div class="message-bubble">
          {{ streamingContent }}
          <span class="cursor">|</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Message } from '@/types';
import { formatTime, getRoleLabel } from '@/utils/format';

const props = defineProps<{
  messages: Message[];
  streamingContent?: string;
}>();

const messagesListRef = ref<HTMLElement | null>(null);

// 监听消息变化，自动滚动到底部
watch(
  () => [props.messages, props.streamingContent],
  async () => {
    await nextTick();
    if (messagesListRef.value) {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.messages-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  margin-bottom: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message-role {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message-item.user .message-role {
  color: rgba(255, 255, 255, 0.8);
}

.message-item.assistant .message-role {
  color: #667eea;
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 18px 4px 12px 18px;
}

.message-item.assistant .message-bubble {
  background-color: #f0f0f0;
  color: #333;
  border-radius: 4px 18px 18px 12px;
}

.message-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 流式响应样式 */
.message-item.streaming .message-bubble {
  opacity: 0.9;
}

.cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #667eea;
  font-weight: bold;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
