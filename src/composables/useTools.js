import { ref, computed, onMounted } from 'vue'
import { fetchTools } from '../utils/api'

export function useTools() {
  const tools = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 12,
    total: 0
  })

  const filters = ref({
    search: '',
    category: 'all',
    tab: 'all'
  })

  const filteredTools = computed(() => {
    let result = [...tools.value]

    // 搜索过滤
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(tool =>
        tool.title.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 分类过滤
    if (filters.value.category !== 'all') {
      result = result.filter(tool => tool.category === filters.value.category)
    }

    // 标签过滤
    if (filters.value.tab === 'hot') {
      result = result.filter(tool => tool.isHot)
    } else if (filters.value.tab === 'new') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    return result
  })

  const paginatedTools = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredTools.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredTools.value.length / pagination.value.pageSize)
  })

  const loadTools = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchTools()
      tools.value = data.map(tool => ({
        ...tool,
        isLiked: false
      }))
      pagination.value.total = data.length
    } catch (err) {
      error.value = err.message || '加载工具列表失败'
    } finally {
      loading.value = false
    }
  }

  const likeTool = (toolId) => {
    const tool = tools.value.find(t => t.id === toolId)
    if (tool) {
      tool.isLiked = !tool.isLiked
      // 这里可以添加 API 调用
    }
  }

  const nextPage = () => {
    if (pagination.value.page < totalPages.value) {
      pagination.value.page++
    }
  }

  const prevPage = () => {
    if (pagination.value.page > 1) {
      pagination.value.page--
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      pagination.value.page = page
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  onMounted(() => {
    loadTools()
  })

  return {
    tools,
    filteredTools,
    paginatedTools,
    loading,
    error,
    pagination,
    totalPages,
    filters,
    loadTools,
    likeTool,
    nextPage,
    prevPage,
    goToPage,
    updateFilters
  }
}
