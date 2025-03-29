import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import RoomSelection from "../components/RoomSelection.vue";
import CreateRoom from "../components/CreateRoom.vue";
import GameBoard from "../components/GameBoard.vue";
import { useAuthStore } from "../store/auth";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/rooms", component: RoomSelection, meta: { requiresAuth: true } },
  { path: "/create-room", component: CreateRoom, meta: { requiresAuth: true } },
  { path: "/game/:roomId", component: GameBoard, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Bảo vệ route, nếu chưa đăng nhập thì chuyển hướng đến login
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.user) {
    next("/login");
  } else {
    next();
  }
});

export default router;
