<template>
  <div class="create-room">
    <h2>➕ Tạo phòng mới</h2>
    <input v-model="roomName" placeholder="Nhập tên phòng..." class="input" />
    <button @click="createRoom" class="btn">Tạo phòng</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { database } from "../firebase/config";
import { ref as dbRef, push } from "firebase/database";
import { useAuthStore } from "../store/auth";

const roomName = ref("");
const errorMessage = ref("");
const router = useRouter();
const authStore = useAuthStore();

const createRoom = async () => {
  if (!roomName.value.trim()) {
    errorMessage.value = "Tên phòng không được để trống!";
    return;
  }

  if (!authStore.user) {
    errorMessage.value = "Bạn phải đăng nhập để tạo phòng!";
    return;
  }

  try {
    const newRoomRef = push(dbRef(database, "rooms"), {
      name: roomName.value,
      host: authStore.user.uid,
      players: { [authStore.user.uid]: authStore.user.email },
      board: Array(20)
        .fill(null)
        .map(() => Array(20).fill("")),
      currentTurn: authStore.user.email,
      winner: null,
    });

    router.push(`/game/${newRoomRef.key}`);
  } catch (error) {
    errorMessage.value = "Lỗi khi tạo phòng. Vui lòng thử lại!";
    console.error(error);
  }
};
</script>

<style scoped>
.create-room {
  text-align: center;
  margin-top: 50px;
}

.input {
  width: 300px;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn:hover {
  background: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
