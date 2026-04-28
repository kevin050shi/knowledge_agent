import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Session } from '@/types';
import { sessionApi } from '@/api/chat';

export const useSessionStore = defineStore('session', () => {
  // 状态
  const sessions = ref<Session[]>([]);
  const currentSessionId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null;
    return sessions.value.find(s => s.id === currentSessionId.value) || null;
  });

  const isBackendOnline = ref(false);

  // Actions
  // 加载所有会话
  async function loadSessions() {
    loading.value = true;
    error.value = null;
    try {
      const data = await sessionApi.getSessions();
      sessions.value = data;
      isBackendOnline.value = true;
    } catch (err: any) {
      error.value = err.message || '加载会话失败';
      isBackendOnline.value = false;
      console.error('加载会话错误:', err);
    } finally {
      loading.value = false;
    }
  }

  // 获取单个会话详情
  async function fetchSession(sessionId: string) {
    loading.value = true;
    error.value = null;
    try {
      const session = await sessionApi.getSession(sessionId);
      
      // 更新会话列表中的该会话
      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        sessions.value[index] = session;
      } else {
        sessions.value.unshift(session);
      }
      
      currentSessionId.value = sessionId;
      isBackendOnline.value = true;
      return session;
    } catch (err: any) {
      error.value = err.message || '获取会话失败';
      isBackendOnline.value = false;
      console.error('获取会话错误:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 选择会话
  async function selectSession(sessionId: string) {
    await fetchSession(sessionId);
  }

  // 创建新会话
  async function createSession(title?: string) {
    loading.value = true;
    error.value = null;
    try {
      const newSession = await sessionApi.createSession({
        title: title || 'New Chat Session',
      });
      sessions.value.unshift(newSession);
      currentSessionId.value = newSession.id;
      isBackendOnline.value = true;
      return newSession;
    } catch (err: any) {
      error.value = err.message || '创建会话失败';
      isBackendOnline.value = false;
      console.error('创建会话错误:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 更新会话标题
  async function updateSessionTitle(sessionId: string, title: string) {
    loading.value = true;
    error.value = null;
    try {
      const updatedSession = await sessionApi.updateSession(sessionId, { title });
      
      // 更新本地状态
      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        sessions.value[index] = updatedSession;
      }
      
      isBackendOnline.value = true;
      return updatedSession;
    } catch (err: any) {
      error.value = err.message || '更新会话失败';
      isBackendOnline.value = false;
      console.error('更新会话错误:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 删除会话
  async function deleteSession(sessionId: string) {
    loading.value = true;
    error.value = null;
    try {
      await sessionApi.deleteSession(sessionId);
      
      // 从列表中移除
      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        sessions.value.splice(index, 1);
      }
      
      // 如果删除的是当前会话，清空当前会话ID
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = null;
      }
      
      isBackendOnline.value = true;
    } catch (err: any) {
      error.value = err.message || '删除会话失败';
      isBackendOnline.value = false;
      console.error('删除会话错误:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 清空当前会话
  function clearCurrentSession() {
    currentSessionId.value = null;
  }

  // 检测后端状态
  async function checkBackendStatus() {
    try {
      const response = await fetch('http://localhost:8000/api/chat/sessions');
      isBackendOnline.value = response.ok;
    } catch (error) {
      isBackendOnline.value = false;
    }
  }

  return {
    // 状态
    sessions,
    currentSessionId,
    currentSession,
    loading,
    error,
    isBackendOnline,
    
    // Actions
    loadSessions,
    fetchSession,
    selectSession,
    createSession,
    updateSessionTitle,
    deleteSession,
    clearCurrentSession,
    checkBackendStatus,
  };
});
