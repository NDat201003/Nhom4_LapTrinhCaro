<template>
  <div class="auth-container">
    <h2>Đăng ký</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Mật khẩu"
        required
      />
      <button type="submit">Đăng ký</button>
    </form>
    <p @click="goToLogin">Đã có tài khoản? Đăng nhập</p>
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

const handleRegister = async () => {
  try {
    await authStore.register(email.value, password.value);
    router.push("/");
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
@import "../assets/auth.css";
</style>
