<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <img src="/icon/emog2026.jpg" alt="emog2026" class="w-10 h-10 rounded-lg object-cover">
          <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            emog2026
          </span>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-2xl mx-8">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索工具、软件、网站..."
              class="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @input="handleSearch"
            >
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center space-x-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            {{ tab.label }}
          </button>

          <!-- Submit Button -->
          <button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
            提交工具
          </button>
        </nav>
      </div>
    </div>

    <!-- Sub Navigation -->
    <div class="bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-6 h-10">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="activeCategory = category.id"
            :class="[
              'text-sm font-medium transition-colors',
              activeCategory === category.id
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')
const activeTab = ref('all')
const activeCategory = ref('all')

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'hot', label: '热门' },
  { id: 'new', label: '最新' },
]

const categories = [
  { id: 'all', label: '全部分类' },
  { id: 'software', label: '软件工具' },
  { id: 'website', label: '网站服务' },
  { id: 'ai', label: 'AI 工具' },
  { id: 'productivity', label: '生产力' },
  { id: 'education', label: '教育资源' },
]

const emit = defineEmits(['search', 'filter-change'])

const handleSearch = () => {
  emit('search', searchQuery.value)
}

watch([activeTab, activeCategory], () => {
  emit('filter-change', {
    tab: activeTab.value,
    category: activeCategory.value
  })
})
</script>
