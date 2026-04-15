<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Category Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              {{ categoryInfo?.label || '分类' }}
            </h1>
            <p class="text-gray-600">
              共找到 {{ filteredTools.length }} 个工具
            </p>
          </div>

          <div class="flex items-center space-x-4">
            <select
              v-model="sortBy"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="default">默认排序</option>
              <option value="newest">最新发布</option>
              <option value="popular">最受欢迎</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tools Grid -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="filteredTools.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard
          v-for="tool in filteredTools"
          :key="tool.id"
          :tool="tool"
          @like="handleLike"
        />
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">该分类下暂无工具</h3>
        <p class="text-gray-500 mb-4">试试其他分类或提交您发现的工具</p>
        <router-link
          to="/submit"
          class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          提交工具
        </router-link>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @prev="prevPage"
          @next="nextPage"
          @go-to="goToPage"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchTools } from '../utils/api'
import Header from '../components/Header.vue'
import ToolCard from '../components/ToolCard.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()

const tools = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = 12
const sortBy = ref('default')

const categories = {
  'software': { label: '软件工具', color: 'blue' },
  'website': { label: '网站服务', color: 'green' },
  'ai': { label: 'AI 工具', color: 'purple' },
  'productivity': { label: '生产力', color: 'orange' },
  'education': { label: '教育', color: 'pink' }
}

const currentCategory = computed(() => route.params.category)
const categoryInfo = computed(() => categories[currentCategory.value])

const filteredTools = computed(() => {
  let result = tools.value.filter(tool => tool.category === currentCategory.value)

  // 排序
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (sortBy.value === 'popular') {
    result.sort((a, b) => b.views - a.views)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const totalTools = tools.value.filter(tool => tool.category === currentCategory.value).length
  return Math.ceil(totalTools / pageSize)
})

const loadTools = async () => {
  loading.value = true
  try {
    const data = await fetchTools()
    tools.value = data
  } catch (error) {
    console.error('加载工具失败:', error)
  } finally {
    loading.value = false
  }
}

const handleLike = (toolId) => {
  const tool = tools.value.find(t => t.id === toolId)
  if (tool) {
    tool.isLiked = !tool.isLiked
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(() => route.params.category, () => {
  currentPage.value = 1
  loadTools()
})

onMounted(() => {
  loadTools()
})
</script>
