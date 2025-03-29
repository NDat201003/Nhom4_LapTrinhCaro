<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "./store/auth";

const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<style scoped>
#app {
  text-align: center;
}
nav {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: #007bff;
  color: white;
}
nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  margin: 0 10px;
}
nav button {
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
nav button:hover {
  background: darkred;
}
</style>
