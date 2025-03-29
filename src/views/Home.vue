<template>
  <div class="home">
    <h1>Chào mừng đến với Cờ Caro Online 🎉</h1>

    <div v-if="!authStore.user" class="auth-message">
      <p>Bạn cần đăng nhập để chơi game!</p>
      <router-link to="/login" class="btn">Đăng nhập</router-link>
      <router-link to="/register" class="btn">Đăng ký</router-link>
    </div>

    <div v-else class="game-options">
      <p>Xin chào, {{ authStore.user.email }}! Bạn muốn làm gì?</p>
      <router-link to="/rooms" class="btn">🔍 Tìm phòng</router-link>
      <router-link to="/create-room" class="btn">➕ Tạo phòng</router-link>
      <button class="btn logout" @click="handleLogout">🚪 Đăng xuất</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../store/auth";

const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
}
.auth-message {
  color: red;
  font-size: 18px;
  margin-top: 20px;
}
.game-options {
  margin-top: 20px;
}
.btn {
  display: inline-block;
  margin: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn:hover {
  background: #0056b3;
}
.logout {
  background: red;
}
.logout:hover {
  background: darkred;
}
</style>
