<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="tool" class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <span class="px-3 py-1 rounded-full text-sm font-medium" :class="categoryColorClass">
              {{ tool.categoryLabel }}
            </span>
            <span class="text-sm text-gray-400">{{ formatDate(tool.date) }}</span>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ tool.title }}</h1>

          <div class="flex items-center space-x-6 text-sm text-gray-500">
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span>{{ tool.views }} 浏览</span>
            </div>
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              <span>{{ tool.comments }} 评论</span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">简介</h2>
            <p class="text-gray-600 leading-relaxed">{{ tool.description }}</p>
          </div>

          <!-- Tags -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">标签</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in tool.tags"
                :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-4 pt-6 border-t border-gray-100">
            <a
              :href="tool.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              访问网站
            </a>

            <button
              @click="handleLike"
              :class="[
                'px-6 py-3 rounded-lg font-medium transition-colors',
                tool.isLiked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                </svg>
                <span>{{ tool.isLiked ? '已收藏' : '收藏' }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">工具不存在</h2>
        <p class="text-gray-500 mb-4">您查找的工具可能已被删除或链接错误</p>
        <router-link to="/" class="text-blue-600 hover:text-blue-700">
          返回首页
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { fetchTools } from '../utils/api'
import Header from '../components/Header.vue'

const route = useRoute()
const tool = ref(null)
const loading = ref(true)

const categoryColorClass = computed(() => {
  if (!tool.value) return 'bg-gray-100 text-gray-700'
  const colorMap = {
    '软件': 'bg-blue-100 text-blue-700',
    '网站': 'bg-green-100 text-green-700',
    'AI工具': 'bg-purple-100 text-purple-700',
    '生产力': 'bg-orange-100 text-orange-700',
    '教育': 'bg-pink-100 text-pink-700'
  }
  return colorMap[tool.value.categoryLabel] || 'bg-gray-100 text-gray-700'
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const handleLike = () => {
  if (tool.value) {
    tool.value.isLiked = !tool.value.isLiked
  }
}

const loadTool = async () => {
  loading.value = true
  try {
    const tools = await fetchTools()
    const foundTool = tools.find(t => t.id === parseInt(route.params.id))
    if (foundTool) {
      tool.value = { ...foundTool, isLiked: false }
    }
  } catch (error) {
    console.error('加载工具详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTool()
})
</script>
