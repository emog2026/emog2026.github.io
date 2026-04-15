<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 设置页面标题
  document.title = 'emog2026 - 发现有趣、有用的工具'

  // 设置 meta 标签
  const metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    const meta = document.createElement('meta')
    meta.name = 'description'
    meta.content = 'emog2026 是一个发现有趣、有用的工具推荐平台，收录各类软件、网站和 AI 工具。'
    document.head.appendChild(meta)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
}
</style>
