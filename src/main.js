import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import Antd from "ant-design-vue";
import router from "./plugins/router.js";
import CSInterfacePlugin from "./plugins/interface.js";

import "ant-design-vue/dist/antd.css";

const app = createApp(App);
app.use(Antd);
app.use(router);
app.use(CSInterfacePlugin);
app.mount("#app");
