import { createApp, ref, reactive } from "vue";
import App from "./App.vue";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from '@fortawesome/free-regular-svg-icons';
import { userState } from "./clients/supabase";
export const disponible = ref();
disponible.value = true;


export const state = reactive({
  headerKey: 0
});

export function reloadHeader() {
  state.headerKey += 1;
}

export const usandoMovil = ref();
async function init() {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    usandoMovil.value = true;
  } else {
    usandoMovil.value = false;
  }
  await userState();
  library.add(fas);
  library.add(fab);
  library.add(far);
  const app = createApp(App);
  app.use(router);
  app.mount('#app');
}

init();