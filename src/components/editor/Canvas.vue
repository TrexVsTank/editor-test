<template>
  <svg
    class="canvas"
    @mousedown="startDrawing"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <!-- 기존 벽 -->
    <g v-for="(wall, index) in walls" :key="index">
      <line
        :x1="wall.x1"
        :y1="wall.y1"
        :x2="wall.x2"
        :y2="wall.y2"
        class="wall"
      />
      <!-- 벽 길이 표시 -->
      <rect
        v-if="wall.length > 0"
        :x="(wall.x1 + wall.x2) / 2 - 20"
        :y="(wall.y1 + wall.y2) / 2 - 25"
        width="40"
        height="20"
        fill="white"
        rx="4"
      />
      <text
        v-if="wall.length > 0"
        :x="(wall.x1 + wall.x2) / 2"
        :y="(wall.y1 + wall.y2) / 2 - 10"
        fill="black"
        font-size="12"
        text-anchor="middle"
      >
        {{ wall.length }} mm
      </text>
      <!-- 키 추가 -->
      <rect
        :x="wall.x1 - 5"
        :y="wall.y1 - 5"
        width="10"
        height="10"
        class="key"
        @mousedown.stop="onKeyDragStart(wall, 'start')"
      />
      <rect
        :x="wall.x2 - 5"
        :y="wall.y2 - 5"
        width="10"
        height="10"
        class="key"
        @mousedown.stop="onKeyDragStart(wall, 'end')"
      />
    </g>
    <!-- 미리보기 벽 -->
    <line
      v-if="previewWall"
      :x1="previewWall.x1"
      :y1="previewWall.y1"
      :x2="previewWall.x2"
      :y2="previewWall.y2"
      class="preview-wall"
    />
    <!-- 미리보기 벽 길이 표시 -->
    <rect
      v-if="previewWall"
      :x="(previewWall.x1 + previewWall.x2) / 2 - 20"
      :y="(previewWall.y1 + previewWall.y2) / 2 - 25"
      width="40"
      height="20"
      fill="white"
      rx="4"
    />
    <text
      v-if="previewWall"
      :x="(previewWall.x1 + previewWall.x2) / 2"
      :y="(previewWall.y1 + previewWall.y2) / 2 - 10"
      fill="gray"
      font-size="12"
      text-anchor="middle"
    >
      {{ previewWall.length }} mm
    </text>
  </svg>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useToolStore } from "@/stores/tools";
import {
  startDrawing as start,
  handleMouseMove as move,
  handleMouseUp as up,
  onKeyDragStart as dragStart,
} from "@/utils/wallmanager";

const toolStore = useToolStore();
const walls = reactive([]); // 벽 데이터
const previewWall = ref(null); // 미리보기 데이터
const draggedKey = ref(null); // 드래그 중인 키 상태

// 메서드 매핑
const startDrawing = (event) => start(event, walls, previewWall);
const handleMouseMove = (event) => move(event, walls, previewWall, draggedKey);
const handleMouseUp = () => up(walls, previewWall, draggedKey);
const onKeyDragStart = (wall, keyType) => dragStart(wall, keyType, draggedKey);
</script>

<style lang="scss" scoped>
@import "@/assets/styles/canvas.scss";
</style>
