<template>
    <div class="toolbar">
      <button
        v-for="tool in tools"
        :key="tool.name"
        :class="{ active: currentTool === tool.name }"
        @click="selectTool(tool.name)"
      >
        {{ tool.label }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import { useToolStore } from "@/stores/tools";
  
  const toolStore = useToolStore();
  
  const tools = [
    { name: "select", label: "선택" },
    { name: "wall", label: "벽" },
    { name: "delete", label: "삭제" },
  ];
  
  const currentTool = computed(() => toolStore.currentTool);
  
  const selectTool = (tool) => {
    toolStore.setTool(tool);
  };
  </script>
  
  <style scoped>
  .toolbar {
    display: flex;
    gap: 10px;
    padding: 10px;
    background-color: #f8f9fa;
  }
  
  button {
    padding: 8px 12px;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;
  }
  
  button.active {
    background-color: #007bff;
    color: white;
    border-color: #0056b3;
  }
  </style>
  