import { createApp } from "vue";
import { createPinia } from "pinia";
import "spectre.css/dist/spectre.min.css";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
