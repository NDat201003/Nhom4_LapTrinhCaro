<template>
  <div class="rooms-container">
    <h2>Danh sách phòng chơi</h2>

    <div v-if="loading" class="loading">🔄 Đang tải danh sách phòng...</div>
    <div v-else-if="Object.keys(rooms).length === 0" class="no-rooms">
      🚫 Không tìm thấy phòng nào
    </div>

    <div v-else class="room-list">
      <div v-for="(room, roomId) in rooms" :key="roomId" class="room-card">
        <p class="room-title">Phòng {{ roomId }}</p>
        <p class="player-count">
          👥 {{ room.players ? room.players.length : 0 }}/2 người chơi
        </p>
        <button @click="joinRoom(roomId)" class="join-btn">Tham gia</button>
      </div>
    </div>

    <!-- <button @click="createRoom" class="create-room-btn">
      ➕ Tạo phòng mới
    </button> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { database } from "../firebase/config";
import { ref as dbRef, onValue, push, set, remove } from "firebase/database";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const rooms = ref<Record<string, any>>({});
const loading = ref(true);

// Lấy danh sách phòng từ Firebase và xử lý players
onMounted(() => {
  const roomsRef = dbRef(database, "rooms");
  onValue(roomsRef, (snapshot) => {
    const data = snapshot.val() || {};

    // Chuyển đổi players từ object thành array nếu cần và xóa phòng trống
    Object.entries(data).forEach(([roomId, roomData]: [string, any]) => {
      // Nếu players là object, chuyển thành array
      if (roomData.players && typeof roomData.players === "object") {
        roomData.players = Object.values(roomData.players);
      }

      // Xóa phòng nếu không còn người chơi
      if (!roomData.players || roomData.players.length === 0) {
        remove(dbRef(database, `rooms/${roomId}`));
      }
    });

    rooms.value = data;
    loading.value = false;
  });
});

// Tham gia phòng
const joinRoom = async (roomId: string) => {
  const roomRef = dbRef(database, `rooms/${roomId}`);
  const roomData = rooms.value[roomId];

  if (roomData?.players?.length < 2) {
    await set(roomRef, {
      ...roomData,
      players: [...roomData.players, authStore.user?.email],
    });
    router.push(`/game/${roomId}`);
  } else {
    alert("Phòng đã đầy!");
  }
};

// Tạo phòng mới
const createRoom = async () => {
  const roomsRef = dbRef(database, "rooms");
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key;

  await set(newRoomRef, {
    board: Array(20)
      .fill(null)
      .map(() => Array(20).fill("")),
    currentTurn: authStore.user?.email,
    players: { [authStore.user?.uid as string]: authStore.user?.email }, // Lưu dưới dạng object
    winner: null,
  });

  router.push(`/game/${roomId}`);
};
</script>

<style scoped>
.rooms-container {
  text-align: center;
  margin-top: 30px;
}

h2 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.loading,
.no-rooms {
  font-size: 18px;
  color: #666;
  margin-bottom: 15px;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.room-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  width: 250px;
  text-align: center;
  transition: transform 0.2s ease-in-out;
}

.room-card:hover {
  transform: translateY(-5px);
}

.room-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 5px;
}

.player-count {
  font-size: 14px;
  color: #555;
}

.join-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.join-btn:hover {
  background: #0056b3;
}

.create-room-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.create-room-btn:hover {
  background: #218838;
}
</style>
