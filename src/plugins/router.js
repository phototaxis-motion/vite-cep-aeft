import * as VueRouter from "vue-router";
import home from "@/views/Home.vue";
import about from "@/views/About.vue";
import proxy from "@/views/Proxy.vue";
import EffectCollection from "@/views/EffectCollection.vue";
import EffectsPreset from "@/views/EffectsPreset.vue";
import Wiggle from "@/views/Wiggle.vue";
import DDTarget from "@/views/2DTarget.vue";

const routes = [
  { path: "/", component: home },
  { path: "/about", component: about },
  { path: "/proxy", component: proxy },
  { path: "/effect-collection", component: EffectCollection },
  { path: "/effects-preset", component: EffectsPreset },
  { path: "/wiggle", component: Wiggle },
  { path: "/2d-target", component: DDTarget },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});

export default router;
