<template>
  <div class="auth-container">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mật khẩu" required />
      <button type="submit">Đăng nhập</button>
    </form>
    <p @click="goToRegister">Chưa có tài khoản? Đăng ký</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    router.push("/");
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
@import "../assets/auth.css";
</style>
