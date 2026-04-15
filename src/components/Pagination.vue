<template>
  <nav class="flex items-center justify-center space-x-2">
    <!-- Previous Button -->
    <button
      @click="$emit('prev')"
      :disabled="currentPage === 1"
      :class="[
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      ]"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center space-x-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="$emit('go-to', page)"
        :class="[
          'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- Next Button -->
    <button
      @click="$emit('next')"
      :disabled="currentPage === totalPages"
      :class="[
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      ]"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits(['prev', 'next', 'go-to'])

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5

  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Show first page
    pages.push(1)

    // Show pages around current page
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(props.totalPages - 1, props.currentPage + 1)

    if (start > 2) {
      pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < props.totalPages - 1) {
      pages.push('...')
    }

    // Show last page
    pages.push(props.totalPages)
  }

  return pages.filter((page, index, self) => {
    return typeof page === 'number' || self.indexOf(page) === index
  })
})
</script>
