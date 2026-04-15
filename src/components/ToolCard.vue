<template>
  <article class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
    <!-- Category Tag -->
    <div class="px-4 pt-4 flex items-center justify-between">
      <span
        :class="[
          'px-3 py-1 rounded-full text-xs font-medium',
          categoryColorClass
        ]"
      >
        {{ tool.categoryLabel }}
      </span>
      <span class="text-xs text-gray-400">{{ formatDate(tool.date) }}</span>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {{ tool.title }}
      </h3>

      <p class="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {{ tool.description }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in tool.tags"
          :key="tag"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Stats & Actions -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span>{{ tool.views }}</span>
          </div>

          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
            </svg>
            <span>{{ tool.comments }}</span>
          </div>

          <div v-if="tool.isHot" class="flex items-center space-x-1 text-red-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
            </svg>
            <span>热门</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('like', tool.id)"
            :class="[
              'p-2 rounded-full transition-all hover:scale-110',
              tool.isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'
            ]"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
            </svg>
          </button>

          <button
            @click="openLink"
            class="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover:scale-110"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  tool: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like'])

const categoryColorClass = computed(() => {
  const colorMap = {
    '软件': 'bg-blue-100 text-blue-700',
    '网站': 'bg-green-100 text-green-700',
    'AI工具': 'bg-purple-100 text-purple-700',
    '生产力': 'bg-orange-100 text-orange-700',
    '教育': 'bg-pink-100 text-pink-700'
  }
  return colorMap[props.tool.categoryLabel] || 'bg-gray-100 text-gray-700'
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY/M/D')
}

const openLink = () => {
  window.open(props.tool.url, '_blank')
}
</script>
