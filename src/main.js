import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);

// Pinia 등록
const pinia = createPinia();
app.use(pinia);

app.mount('#app');
