import axios from 'axios';
import type { Session, Message, CreateSessionRequest, UpdateSessionRequest } from '@/types';

// API 基础 URL
const API_BASE = 'http://localhost:8000/api/chat';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 会话相关 API
export const sessionApi = {
  // 获取所有会话
  getSessions: (): Promise<Session[]> => {
    return apiClient.get('/sessions').then(res => res.data);
  },

  // 获取单个会话（包含消息）
  getSession: (sessionId: string): Promise<Session> => {
    return apiClient.get(`/sessions/${sessionId}`).then(res => res.data);
  },

  // 创建会话
  createSession: (data: CreateSessionRequest): Promise<Session> => {
    return apiClient.post('/sessions', data).then(res => res.data);
  },

  // 更新会话
  updateSession: (sessionId: string, data: UpdateSessionRequest): Promise<Session> => {
    return apiClient.put(`/sessions/${sessionId}`, data).then(res => res.data);
  },

  // 部分更新会话
  patchSession: (sessionId: string, data: UpdateSessionRequest): Promise<Session> => {
    return apiClient.patch(`/sessions/${sessionId}`, data).then(res => res.data);
  },

  // 删除会话
  deleteSession: (sessionId: string): Promise<void> => {
    return apiClient.delete(`/sessions/${sessionId}`).then(res => res.data);
  },

  // 获取会话的消息列表
  getSessionMessages: (sessionId: string): Promise<Message[]> => {
    return apiClient.get(`/sessions/${sessionId}/messages`).then(res => res.data);
  },
};

// 聊天相关 API
export const chatApi = {
  // 非流式发送消息
  sendMessage: (message: string, sessionId: string): Promise<any> => {
    return apiClient.post('/message', {
      message,
      session_id: sessionId,
      stream: false
    }).then(res => res.data);
  },

  // 流式发送消息（返回 ReadableStream）
  sendStreamMessage: (message: string, sessionId: string): Promise<ReadableStream> => {
    return fetch(`${API_BASE}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        stream: true
      })
    }).then(res => {
      if (!res.body) {
        throw new Error('Response body is null');
      }
      return res.body;
    });
  },
};

// 后端状态检测
export const healthCheck = {
  checkBackendStatus: async (): Promise<boolean> => {
    try {
      await apiClient.get('/sessions');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default apiClient;
