import { defineStore } from "pinia";
import { ref } from "vue";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(auth.currentUser);

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi chạy
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });

  // Đăng ký tài khoản
  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user.value = userCredential.user;
  };

  // Đăng nhập
  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    user.value = userCredential.user;
  };

  // Đăng xuất
  const logout = async () => {
    await signOut(auth);
    user.value = null;
  };

  // Kiểm tra trạng thái đăng nhập
  const isAuthenticated = () => !!user.value;

  return { user, register, login, logout, isAuthenticated };
});
