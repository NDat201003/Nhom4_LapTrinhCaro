<template>
  <div class="board-container">
    <h2>Phòng: {{ roomId }}</h2>
    <p v-if="gameData?.winner" class="winner-message">
      🎉 {{ gameData.winner }} đã thắng! 🎉
    </p>
    <p v-else class="turn-message">
      Lượt hiện tại: <strong>{{ gameData?.currentTurn }}</strong>
    </p>
    <p v-if="gameData?.players?.length < 2" class="waiting-message">
      ⏳ Đang đợi thêm người chơi...
    </p>

    <div class="game-area">
      <!-- Bàn cờ chỉ hiển thị khi đủ 2 người chơi -->
      <div class="board-wrapper">
        <div
          class="board"
          :class="{ disabled: gameData?.players?.length || 0 < 2 }"
        >
          <div
            v-for="(row, rowIndex) in gameData?.board"
            :key="rowIndex"
            class="row"
          >
            <div
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              class="cell"
              :class="{ 'cell-x': cell === 'X', 'cell-o': cell === 'O' }"
              @click="handleClick(rowIndex, colIndex)"
            >
              {{ cell }}
            </div>
          </div>
        </div>
      </div>
      <!-- Chat luôn hiển thị nếu phòng tồn tại -->
      <Chat v-if="roomExists" :roomId="roomId" class="chat-box" />
    </div>

    <button @click="router.push('/rooms')" class="btn-exit">
      🏠 Rời phòng
    </button>
    <button @click="resetGame" class="btn-restart" v-if="gameData?.winner">
      🔄 Chơi lại
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { database } from "../firebase/config";
import { ref as dbRef, onValue, update, remove } from "firebase/database";
import { useAuthStore } from "../store/auth";
import Chat from "./Chat.vue";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId as string;

const board = ref<string[][]>(
  Array(20)
    .fill(null)
    .map(() => Array(20).fill(""))
);
const gameData = ref<{
  currentTurn: string;
  winner: string | null;
  board: string[][];
  players: string[];
} | null>(null);
const roomRef = dbRef(database, `rooms/${roomId}`);
const roomExists = ref(true);

onMounted(() => {
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Firebase Data:", data); // Kiểm tra dữ liệu thật sự từ Firebase

    if (data) {
      if (
        data.players &&
        typeof data.players === "object" &&
        !Array.isArray(data.players)
      ) {
        data.players = Object.values(data.players);
      }

      gameData.value = {
        ...data,
        players: Array.isArray(data.players) ? data.players : [],
        board:
          data.board ||
          Array(20)
            .fill(null)
            .map(() => Array(20).fill("")),
        currentTurn: data.currentTurn || "",
        winner: data.winner || null,
      };
    } else {
      roomExists.value = false;
    }
  });

  // Lắng nghe sự kiện trước khi trang bị unload (tắt tab, reload,...)\n  // Đây chỉ là best effort vì không đảm bảo async hoàn tất\n  window.addEventListener(\"beforeunload\", handleBeforeUnload);
});

// // Sử dụng hook của router để rời phòng khi chuyển route
// onBeforeRouteLeave(async (to, from, next) => {
//   await leaveRoom();
//   next();
// });

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  leaveRoom();
});

async function leaveRoom() {
  if (!gameData.value || !authStore.user) return;

  const userEmail = authStore.user.email;
  const updatedPlayers = gameData.value.players.filter((p) => p !== userEmail);

  try {
    if (updatedPlayers.length === 0) {
      await remove(roomRef);
    } else {
      await update(roomRef, { players: updatedPlayers });
    }
  } catch (error) {
    console.error("Lỗi khi rời phòng:", error);
  }

  router.push("/rooms");
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  // Best effort: Gọi leaveRoom khi trang sắp bị unload\n  leaveRoom();
}

function handleClick(row: number, col: number) {
  if (
    !gameData.value ||
    !gameData.value.players ||
    gameData.value.board[row][col] !== "" ||
    gameData.value.currentTurn !== authStore.user?.email
  ) {
    return;
  }

  const symbol =
    gameData.value.currentTurn === gameData.value.players[0] ? "X" : "O";

  // 🛠 Clone mảng để Vue nhận diện thay đổi
  const newBoard = gameData.value.board.map((r) => [...r]);
  newBoard[row][col] = symbol;

  const winner = checkWinner(newBoard);
  console.log("zô tới đây");
  // 🛠 Gán lại toàn bộ board để Vue cập nhật UI
  gameData.value = {
    ...gameData.value,
    board: newBoard,
    currentTurn: gameData.value.players.find(
      (p) => p !== gameData.value?.currentTurn
    ),
    winner,
  };

  // 🔥 Cập nhật Firebase
  update(roomRef, {
    board: newBoard,
    currentTurn: gameData.value?.currentTurn,
    winner,
  });
}
async function resetGame() {
  if (!gameData.value || !gameData.value.players.length) return;

  // 🛠 Reset lại board trống
  const emptyBoard = Array(20)
    .fill(null)
    .map(() => Array(20).fill(""));

  // 🛠 Cập nhật Firebase
  await update(roomRef, {
    board: emptyBoard,
    currentTurn: gameData.value.players[0], // Người đầu tiên đánh
    winner: null,
  });

  // 🛠 Cập nhật state để Vue nhận diện thay đổi
  gameData.value = {
    ...gameData.value,
    board: emptyBoard,
    currentTurn: gameData.value.players[0],
    winner: null,
  };
}

function checkWinner(board: string[][]): string | null {
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      if (board[i][j] === "") continue;
      const player = board[i][j];
      if (
        j + 4 < 20 &&
        board[i][j + 1] === player &&
        board[i][j + 2] === player &&
        board[i][j + 3] === player &&
        board[i][j + 4] === player
      ) {
        return player;
      }
      if (
        i + 4 < 20 &&
        board[i + 1][j] === player &&
        board[i + 2][j] === player &&
        board[i + 3][j] === player &&
        board[i + 4][j] === player
      ) {
        return player;
      }
      if (
        i + 4 < 20 &&
        j + 4 < 20 &&
        board[i + 1][j + 1] === player &&
        board[i + 2][j + 2] === player &&
        board[i + 3][j + 3] === player &&
        board[i + 4][j + 4] === player
      ) {
        return player;
      }
      if (
        i - 4 >= 0 &&
        j + 4 < 20 &&
        board[i - 1][j + 1] === player &&
        board[i - 2][j + 2] === player &&
        board[i - 3][j + 3] === player &&
        board[i - 4][j + 4] === player
      ) {
        return player;
      }
    }
  }
  return null;
}
</script>

<style scoped>
.board-container {
  text-align: center;
}

.game-area {
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: flex-start;
}

.board-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  overflow: auto;
}

.board {
  display: grid;
  grid-template-columns: repeat(20, 30px);
  grid-template-rows: repeat(20, 30px);
  gap: 2px;
  background-color: #ddd;
  padding: 5px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.cell {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  border: 1px solid #aaa;
  background-color: #fff;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.cell:hover {
  background-color: #f0f0f0;
}

.cell-x {
  color: red;
}

.cell-o {
  color: blue;
}

.chat-box {
  width: 300px;
  height: 80vh !important;
}

.waiting-message {
  font-size: 16px;
  color: orange;
}

.winner-message {
  font-size: 20px;
  font-weight: bold;
  color: green;
}

.turn-message {
  font-size: 18px;
}

.btn-exit {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #ff5555;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-exit:hover {
  background-color: #ff2222;
}
</style>
