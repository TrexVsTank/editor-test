<template>
  <div id="app">
    <Toolbar />
    <Canvas />
  </div>
</template>

<script setup>
import Toolbar from "@/components/editor/Toolbar.vue";
import Canvas from "@/components/editor/Canvas.vue";
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
