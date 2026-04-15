<template>
  <div class="min-h-screen bg-gray-50">
    <Header
      @search="handleSearch"
      @filter-change="handleFilterChange"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p class="font-medium">加载失败</p>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats Bar -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <div class="text-sm text-gray-600">
                共找到 <span class="font-semibold text-gray-900">{{ filteredTools.length }}</span> 个工具
              </div>
              <div v-if="filters.search" class="text-sm text-gray-600">
                搜索: <span class="font-medium text-blue-600">"{{ filters.search }}"</span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">排序方式:</span>
              <select
                v-model="sortBy"
                class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">默认</option>
                <option value="date">最新发布</option>
                <option value="views">浏览最多</option>
                <option value="comments">评论最多</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tools Grid -->
        <div v-if="paginatedTools.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ToolCard
            v-for="tool in paginatedTools"
            :key="tool.id"
            :tool="tool"
            @like="handleLike"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <svg class="mx-auto h-10 w-10 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">没有找到相关工具</h3>
          <p class="text-gray-500">试试调整搜索词或筛选条件</p>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="totalPages > 1"
          :current-page="pagination.page"
          :total-pages="totalPages"
          @prev="prevPage"
          @next="nextPage"
          @go-to="goToPage"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-sm text-gray-500">
          <p class="mb-2">
            emog2026 - 发现有趣、有用的工具 | 基于 Vue3 + Tailwind CSS 构建
          </p>
          <div class="flex justify-center space-x-4 mt-4">
            <a href="#" class="text-gray-400 hover:text-gray-600">关于我们</a>
            <a href="#" class="text-gray-400 hover:text-gray-600">提交工具</a>
            <a href="#" class="text-gray-400 hover:text-gray-600">开源协议</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTools } from '../composables/useTools'
import Header from '../components/Header.vue'
import ToolCard from '../components/ToolCard.vue'
import Pagination from '../components/Pagination.vue'

const {
  filteredTools,
  paginatedTools,
  loading,
  error,
  pagination,
  totalPages,
  filters,
  likeTool,
  nextPage,
  prevPage,
  goToPage,
  updateFilters
} = useTools()

const sortBy = ref('default')

const handleSearch = (searchTerm) => {
  updateFilters({ search: searchTerm })
}

const handleFilterChange = (filterData) => {
  updateFilters(filterData)
}

const handleLike = (toolId) => {
  likeTool(toolId)
}

// 排序逻辑
watch(sortBy, (newSortBy) => {
  // 这里可以实现排序逻辑
  // 目前简化处理
})
</script>
