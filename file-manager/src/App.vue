<template>
  <div id="app">
    <Navbar />
    <router-view class="mt-3"></router-view>
  </div>
</template>

<script>
import Dashboard from "./components/Dashboard.vue";
import Navbar from "./components/Navbar.vue";
import Folder from './components/Folder.vue';

//  IMPORTS FOR VUE
import Vue from "vue";
import VueRouter from "vue-router";
import { BootstrapVue } from "bootstrap-vue";

//  FOR ROUTER
Vue.use(VueRouter);
//  FOR BOOTSTRAP
Vue.use(BootstrapVue);
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";


//  ROUTE PATH FOR COMPONENTS
const routes = [
  { path: "/folder", component: Folder },
  { path: "/dashboard", component: Dashboard },
];

//  INITIALISE VUE-ROUTER WITH THE ROUTE PATHS
const router = new VueRouter({
  routes,
});

export default {
  name: "App",
  components: {
    Navbar,
  },
  router:router
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
