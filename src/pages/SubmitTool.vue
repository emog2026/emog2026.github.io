<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">提交工具</h1>
          <p class="text-gray-600">分享一个有趣、有用的工具，帮助更多人发现好用的软件和服务</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Tool Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              工具名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="例如：VS Code"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              分类 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.category"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择分类</option>
              <option value="software">软件工具</option>
              <option value="website">网站服务</option>
              <option value="ai">AI 工具</option>
              <option value="productivity">生产力</option>
              <option value="education">教育</option>
            </select>
          </div>

          <!-- URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              官方网站 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.url"
              type="url"
              required
              placeholder="https://example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              工具简介 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.description"
              required
              rows="5"
              placeholder="简要介绍这个工具的主要功能和特点..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">{{ form.description.length }}/500</p>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              标签（最多 5 个）
            </label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(tag)"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="添加标签（回车）"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @keyup.enter="addTag"
              >
              <button
                type="button"
                @click="addTag"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ submitting ? '提交中...' : '提交工具' }}
            </button>
            <router-link
              to="/"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
            >
              取消
            </router-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'

const router = useRouter()

const form = ref({
  name: '',
  category: '',
  url: '',
  description: '',
  tags: []
})

const newTag = ref('')
const submitting = ref(false)

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 5) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = form.value.tags.indexOf(tag)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  }
}

const handleSubmit = async () => {
  submitting.value = true

  try {
    // TODO: 调用真实 API
    // await submitTool(form.value)

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    alert('提交成功！感谢您的分享')

    // 重置表单
    form.value = {
      name: '',
      category: '',
      url: '',
      description: '',
      tags: []
    }

    // 返回首页
    router.push('/')
  } catch (error) {
    console.error('提交失败:', error)
    alert('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>
