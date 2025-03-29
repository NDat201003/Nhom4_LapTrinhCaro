<template>
  <div class="chat-container">
    <h2>💬 Chat</h2>

    <!-- Danh sách tin nhắn -->
    <div ref="chatBox" class="chat-box">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="chat-message"
        :class="{ 'my-message': msg.user === authStore.user?.email }"
      >
        <img v-if="msg.avatar" :src="msg.avatar" class="avatar" alt="Avatar" />
        <div class="message-content">
          <strong>{{ msg.user }}:</strong>
          <p>{{ msg.text }}</p>
        </div>
      </div>
    </div>

    <!-- Ô nhập tin nhắn -->
    <div class="chat-input">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Nhập tin nhắn..." />
      <button @click="sendMessage">Gửi</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { database } from "../firebase/config";
import { ref as dbRef, push, onValue } from "firebase/database";
import { useAuthStore } from "../store/auth";

const authStore = useAuthStore();
const messages = ref<{ user: string; text: string; avatar?: string }[]>([]);
const newMessage = ref("");
const chatBox = ref<HTMLElement | null>(null);

const messagesRef = dbRef(database, "chat");

// Lắng nghe tin nhắn mới từ Firebase
onMounted(() => {
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    messages.value = data ? Object.values(data) : [];
    nextTick(() => {
      if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight;
      }
    });
  });
});

// Gửi tin nhắn lên Firebase
function sendMessage() {
  if (newMessage.value.trim() !== "") {
    push(messagesRef, {
      user: authStore.user?.email || "Ẩn danh",
      text: newMessage.value,
      avatar: authStore.user?.photoURL || "https://i.pravatar.cc/40",
    });
    newMessage.value = "";
  }
}
</script>

<style scoped>
.chat-container {
  width: 320px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-box {
  overflow-y: auto;
  padding: 5px;
  display: flex;
  flex-direction: column;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.my-message {
  flex-direction: row-reverse;
  text-align: right;
}

.message-content {
  max-width: 75%;
  background: #f1f1f1;
  padding: 8px;
  border-radius: 10px;
}

.my-message .message-content {
  background: #007bff;
  color: white;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 10px;
}

.chat-input {
  display: flex;
}

.chat-input input {
  flex: 1;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.chat-input button {
  margin-left: 5px;
  padding: 5px 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #0056b3;
}
</style>
