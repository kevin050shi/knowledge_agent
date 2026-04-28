// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// 消息接口
export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

// 会话接口
export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

// 创建会话请求
export interface CreateSessionRequest {
  title?: string;
}

// 更新会话请求
export interface UpdateSessionRequest {
  title?: string;
}

// 创建消息请求
export interface CreateMessageRequest {
  session_id: string;
  role: MessageRole;
  content: string;
}
