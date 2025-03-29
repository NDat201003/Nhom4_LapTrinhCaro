import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index"; // Đúng đường dẫn
import "./style.css"; // Nếu có file CSS chung

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
