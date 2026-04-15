<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center px-4">
      <!-- 404 Illustration -->
      <div class="mb-8">
        <div class="inline-block relative">
          <h1 class="text-9xl font-bold text-gray-200">404</h1>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <h2 class="text-3xl font-bold text-gray-900 mb-4">
        页面不存在
      </h2>

      <p class="text-gray-600 text-lg mb-8 max-w-md mx-auto">
        抱歉，您访问的页面可能已被删除、移动，或者链接有误。
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/"
          class="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          返回首页
        </router-link>

        <button
          @click="goBack"
          class="inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          返回上一页
        </button>
      </div>

      <!-- Suggestion -->
      <div class="mt-12 text-sm text-gray-500">
        <p>或者您可以</p>
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <router-link
            v-for="cat in categories"
            :key="cat.id"
            :to="`/category/${cat.id}`"
            class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {{ cat.label }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const categories = [
  { id: 'software', label: '软件工具' },
  { id: 'website', label: '网站服务' },
  { id: 'ai', label: 'AI 工具' },
  { id: 'productivity', label: '生产力' },
  { id: 'education', label: '教育' }
]
</script>

<style scoped>
/* 添加一些动画效果 */
h1 {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
