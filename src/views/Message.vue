<template>
  <div class="chat-layout">
    <div class="conversation-panel">
      <div class="panel-header">消息</div>
      <div class="conv-list" v-if="chatStore.conversations.length">
        <div
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          :class="['conv-item', conv.id === chatStore.currentConversationId ? 'active' : '']"
          @click="chatStore.selectConversation(conv.id)"
        >
          <el-badge :value="conv.unread || 0" :hidden="!conv.unread" class="conv-badge">
            <el-avatar :size="40" :src="conv.avatar" />
          </el-badge>
          <div class="conv-info">
            <div class="conv-name">{{ conv.nickname }}</div>
            <div class="conv-last">{{ conv.lastMsg || '暂无消息' }}</div>
          </div>
          <div class="conv-goods" v-if="conv.goodsTitle">
            <el-tag size="small" effect="plain">{{ conv.goodsTitle.slice(0, 8) }}{{ conv.goodsTitle.length > 8 ? '...' : '' }}</el-tag>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无会话" :image-size="60" />
    </div>

    <div class="chat-panel">
      <template v-if="chatStore.currentConversation || pendingConv">
        <div class="chat-header">
          <el-avatar :size="36" :src="chatStore.currentConversation?.avatar" />
          <span class="chat-partner">{{ chatStore.currentConversation?.nickname || '新会话' }}</span>
          <el-tag v-if="chatStore.currentConversation?.goodsTitle" size="small" type="info" effect="plain">
            {{ chatStore.currentConversation.goodsTitle }}
          </el-tag>
        </div>

        <div class="message-list" ref="msgListRef">
          <div
            v-for="msg in chatStore.messages"
            :key="msg.id"
            :class="['msg-item', msg.senderId === currentUserId ? 'self' : '']"
          >
            <el-avatar :size="32" :src="msg.senderAvatar" class="msg-avatar" />
            <div class="msg-content-wrapper">
              <div class="msg-sender">{{ msg.senderNickname }}</div>
              <div class="msg-bubble">{{ msg.content }}</div>
              <div class="msg-time">{{ formatTime(msg.createTime) }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            @keydown.enter.prevent="handleSend"
          />
          <div class="input-actions">
            <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">发送</el-button>
          </div>
        </div>
      </template>

      <el-empty v-else description="选择一个会话开始聊天" :image-size="80" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { sendMessageApi } from '@/api/chat'
import { ElMessage } from 'element-plus'

const route = useRoute()
const chatStore = useChatStore()
const userStore = useUserStore()
const msgListRef = ref(null)
const inputText = ref('')
const pendingConv = ref(null)

const currentUserId = computed(() => userStore.userId)

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return

  const conv = chatStore.currentConversation

  if (conv) {
    await chatStore.sendMessage({ conversationId: conv.id, content: text })
  } else if (pendingConv.value) {
    const res = await sendMessageApi({
      receiverId: pendingConv.value.targetId,
      goodsId: pendingConv.value.goodsId,
      content: text
    })
    if (res.code === 200) {
      await chatStore.fetchConversations()
      const newConv = chatStore.conversations.find(c =>
        c.targetId === pendingConv.value.targetId
      )
      if (newConv) {
        chatStore.selectConversation(newConv.id)
      }
    }
  } else {
    return
  }

  inputText.value = ''
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight
    }
  })
}

async function init() {
  chatStore.initSocket()
  await chatStore.fetchConversations()

  const targetId = route.query.targetId
  const goodsId = route.query.goodsId
  if (targetId) {
    const existing = chatStore.conversations.find(c => c.targetId === Number(targetId))
    if (existing) {
      chatStore.selectConversation(existing.id)
    } else {
      pendingConv.value = { targetId: Number(targetId), goodsId: goodsId ? Number(goodsId) : null }
      chatStore.messages = []
    }
  }
}

onMounted(init)
onUnmounted(() => {
  chatStore.destroySocket()
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: calc(100vh - 112px);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.conversation-panel {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.conv-list {
  flex: 1;
  overflow-y: auto;
}

.conv-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 12px;
}

.conv-item:hover {
  background: #f8fafc;
}

.conv-item.active {
  background: #f0f9ff;
}

.conv-badge :deep(.el-badge__content) {
  top: 4px;
  right: 4px;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  font-weight: 500;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 2px;
}

.conv-last {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-goods {
  flex-shrink: 0;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.chat-partner {
  font-size: 15px;
  color: #1e293b;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.msg-item {
  display: flex;
  gap: 10px;
  max-width: 70%;
}

.msg-item.self {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.msg-avatar {
  flex-shrink: 0;
  margin-top: 4px;
}

.msg-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.msg-sender {
  font-size: 11px;
  color: #94a3b8;
}

.msg-item.self .msg-sender {
  text-align: right;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  background: #f1f5f9;
  font-size: 14px;
  line-height: 1.5;
  color: #1e293b;
  word-break: break-word;
}

.msg-item.self .msg-bubble {
  background: #0ea5e9;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-item:not(.self) .msg-bubble {
  border-bottom-left-radius: 4px;
}

.msg-time {
  font-size: 11px;
  color: #cbd5e1;
  margin-top: 2px;
}

.msg-item.self .msg-time {
  text-align: right;
}

.chat-input-area {
  padding: 12px 20px;
  border-top: 1px solid #e2e8f0;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
