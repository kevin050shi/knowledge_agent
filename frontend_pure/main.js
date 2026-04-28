// API 基础 URL
const API_BASE = 'http://localhost:8000/api/chat';

// 当前选中的会话 ID
let currentSessionId = null;

// 后端状态检测定时器
let backendStatusCheckInterval = null;

// ======================== 初始化 ========================

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadSessions();
    startBackendStatusCheck();
});

// ======================== 事件监听 ========================

function initEventListeners() {
    // 新建会话
    document.getElementById('newSessionBtn').addEventListener('click', createNewSession);

    // 编辑标题
    document.getElementById('editTitleBtn').addEventListener('click', showEditForm);
    document.getElementById('cancelEditBtn').addEventListener('click', hideEditForm);
    document.getElementById('saveTitleBtn').addEventListener('click', saveTitle);

    // 删除会话
    document.getElementById('deleteSessionBtn').addEventListener('click', deleteCurrentSession);

    // 消息发送
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // 回车保存标题
    document.getElementById('titleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveTitle();
    });
}

// ======================== 会话管理 ========================

async function loadSessions() {
    try {
        const response = await fetch(`${API_BASE}/sessions`);
        if (!response.ok) throw new Error('加载会话失败');

        const sessions = await response.json();
        renderSessionList(sessions);
    } catch (error) {
        console.error('加载会话错误:', error);
        document.getElementById('sessionList').innerHTML = '<div class="loading">加载失败</div>';
    }
}

function renderSessionList(sessions) {
    const list = document.getElementById('sessionList');

    if (sessions.length === 0) {
        list.innerHTML = '<div class="loading">暂无会话</div>';
        return;
    }

    list.innerHTML = sessions.map(session => {
        const time = new Date(session.updated_at);
        const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="session-item ${session.id === currentSessionId ? 'active' : ''}" 
                 data-session-id="${session.id}">
                <span class="session-item-title">${escapeHtml(session.title)}</span>
                <div class="session-item-actions">
                    <button class="delete-btn" data-session-id="${session.id}">删除</button>
                </div>
            </div>
        `;
    }).join('');

    // 事件委托：会话项点击
    list.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                selectSession(item.dataset.sessionId);
            }
        });
    });

    // 删除按钮
    list.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSession(btn.dataset.sessionId);
        });
    });
}

async function selectSession(sessionId) {
    currentSessionId = sessionId;

    try {
        const response = await fetch(`${API_BASE}/sessions/${sessionId}`);
        if (!response.ok) throw new Error('获取会话失败');

        const session = await response.json();
        renderSessionDetail(session);
        loadSessions();
    } catch (error) {
        console.error('选择会话错误:', error);
        alert('获取会话失败');
    }
}

function renderSessionDetail(session) {
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('sessionDetail').style.display = 'flex';
    document.getElementById('editTitleForm').style.display = 'none';

    // 更新标题和元数据
    document.getElementById('sessionTitle').textContent = session.title;
    const created = new Date(session.created_at).toLocaleString('zh-CN');
    document.getElementById('sessionTime').textContent = `创建: ${created}`;

    // 更新会话信息栏
    document.getElementById('infoSessionId').textContent = session.id;
    document.getElementById('infoCreatedAt').textContent = new Date(session.created_at).toLocaleString('zh-CN');
    document.getElementById('infoUpdatedAt').textContent = new Date(session.updated_at).toLocaleString('zh-CN');
    document.getElementById('infoMessageCount').textContent = session.messages ? session.messages.length : 0;

    // 渲染消息列表
    renderMessages(session.messages || []);

    // 焦点到输入框
    document.getElementById('messageInput').focus();
}

function renderMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    
    if (!messages || messages.length === 0) {
        messagesList.innerHTML = '<p class="empty-messages">暂无消息</p>';
        return;
    }

    messagesList.innerHTML = messages.map(msg => {
        const time = new Date(msg.created_at).toLocaleTimeString('zh-CN');
        const roleLabels = {
            'user': '用户',
            'assistant': '助手',
            'system': '系统',
            'tool': '工具'
        };
        const roleLabel = roleLabels[msg.role] || msg.role;
        const isUser = msg.role === 'user';
        return `
            <div class="message-item ${isUser ? 'user' : 'assistant'}">
                <div>
                    <div class="message-role">${roleLabel}</div>
                    <div class="message-bubble">${escapeHtml(msg.content)}</div>
                    <div class="message-meta">${time}</div>
                </div>
            </div>
        `;
    }).join('');

    // 滚动到底部
    messagesList.scrollTop = messagesList.scrollHeight;
}

async function createNewSession() {
    const title = prompt('输入新会话标题 (可选):');
    if (title === null) return;

    try {
        const response = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title || 'New Chat Session'
            })
        });

        if (!response.ok) throw new Error('创建会话失败');

        const newSession = await response.json();
        loadSessions();
        selectSession(newSession.id);
    } catch (error) {
        console.error('创建会话错误:', error);
        alert('创建会话失败');
    }
}

async function deleteCurrentSession() {
    if (!currentSessionId) return;
    if (!confirm('确定删除该会话吗？')) return;

    await deleteSession(currentSessionId);
}

async function deleteSession(sessionId) {
    try {
        const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('删除会话失败');

        currentSessionId = null;
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('sessionDetail').style.display = 'none';
        loadSessions();
    } catch (error) {
        console.error('删除会话错误:', error);
        alert('删除会话失败');
    }
}

// ======================== 标题编辑 ========================

function showEditForm() {
    document.getElementById('editTitleForm').style.display = 'flex';
    document.getElementById('titleInput').value = document.getElementById('sessionTitle').textContent;
    document.getElementById('titleInput').focus();
}

function hideEditForm() {
    document.getElementById('editTitleForm').style.display = 'none';
}

async function saveTitle() {
    if (!currentSessionId) return;

    const newTitle = document.getElementById('titleInput').value.trim();
    if (!newTitle) {
        alert('标题不能为空');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/sessions/${currentSessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
        });

        if (!response.ok) throw new Error('更新会话失败');

        const updatedSession = await response.json();
        renderSessionDetail(updatedSession);
        hideEditForm();
        loadSessions();
    } catch (error) {
        console.error('更新会话错误:', error);
        alert('更新会话失败');
    }
}

// ======================== 消息处理 ========================

async function sendMessage() {
    if (!currentSessionId) {
        alert('请先选择或创建一个会话');
        return;
    }

    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) {
        return;
    }

    // 禁用发送按钮
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    try {
        // 获取选择的角色
        const roleSelect = document.getElementById('roleSelect');
        const selectedRole = roleSelect.value;

        // 发送消息
        const response = await fetch(`${API_BASE}/sessions/${currentSessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: selectedRole,
                content: content,
                session_id: currentSessionId
            })
        });

        if (!response.ok) throw new Error('发送消息失败');

        // 清空输入框
        messageInput.value = '';

        // 刷新会话详情
        const sessionResponse = await fetch(`${API_BASE}/sessions/${currentSessionId}`);
        if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            renderMessages(session.messages || []);
        }
    } catch (error) {
        console.error('发送消息错误:', error);
        alert('发送消息失败');
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// ======================== 工具函数 ========================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ======================== 后端状态检测 ========================

function startBackendStatusCheck() {
    // 立即检测一次
    checkBackendStatus();
    
    // 每3秒检测一次
    backendStatusCheckInterval = setInterval(checkBackendStatus, 3000);
}

async function checkBackendStatus() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE}/sessions`, {
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
            updateBackendStatus(true);
        } else {
            updateBackendStatus(false);
        }
    } catch (error) {
        updateBackendStatus(false);
    }
}

function updateBackendStatus(isOnline) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (isOnline) {
        statusDot.classList.remove('offline');
        statusDot.classList.add('online');
        statusText.textContent = '后端已连接';
        statusText.style.color = '#4caf50';
    } else {
        statusDot.classList.remove('online');
        statusDot.classList.add('offline');
        statusText.textContent = '后端未连接';
        statusText.style.color = '#f44336';
    }
}
