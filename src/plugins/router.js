import * as VueRouter from "vue-router";
import home from "@/views/Home.vue";
import about from "@/views/About.vue";

const routes = [
  { path: "/", component: home },
  { path: "/about", component: about },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});

export default router;
