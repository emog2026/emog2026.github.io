<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-blue-600 mb-4">Tailwind CSS 测试</h1>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">颜色测试</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-blue-500 text-white rounded">Blue 500</div>
          <div class="p-4 bg-red-500 text-white rounded">Red 500</div>
          <div class="p-4 bg-green-500 text-white rounded">Green 500</div>
          <div class="p-4 bg-purple-500 text-white rounded">Purple 500</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">布局测试</h2>
        <div class="flex gap-4 flex-wrap">
          <div class="p-4 bg-gray-100 rounded flex-1 min-w-[200px]">Flex Item 1</div>
          <div class="p-4 bg-gray-200 rounded flex-1 min-w-[200px]">Flex Item 2</div>
          <div class="p-4 bg-gray-300 rounded flex-1 min-w-[200px]">Flex Item 3</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">间距测试</h2>
        <div class="space-y-4">
          <div class="p-2 bg-blue-100">p-2</div>
          <div class="p-4 bg-blue-200">p-4</div>
          <div class="p-6 bg-blue-300">p-6</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">圆角测试</h2>
        <div class="flex gap-4 flex-wrap">
          <div class="p-4 bg-gray-200 rounded-none">None</div>
          <div class="p-4 bg-gray-200 rounded">Default</div>
          <div class="p-4 bg-gray-200 rounded-lg">Large</div>
          <div class="p-4 bg-gray-200 rounded-full">Full</div>
        </div>
      </div>

      <div class="mt-8">
        <router-link to="/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
