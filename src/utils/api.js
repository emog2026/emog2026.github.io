import {
  fetchToolsFromGitHub,
  createToolOnGitHub,
  updateToolOnGitHub,
  deleteToolOnGitHub,
  incrementViewsOnGitHub
} from './github.js'

/**
 * 获取工具列表
 * 从 GitHub JSON 文件读取
 */
export const fetchTools = async () => {
  try {
    const tools = await fetchToolsFromGitHub()
    return tools
  } catch (error) {
    console.error('Failed to fetch tools from GitHub:', error)

    // 如果 GitHub API 失败，回退到本地 JSON 文件
    console.log('Falling back to local data...')
    try {
      const response = await fetch('/src/data/tools.json')
      const data = await response.json()
      return data
    } catch (fallbackError) {
      console.error('Failed to load local data:', fallbackError)
      throw error
    }
  }
}

/**
 * 创建新工具
 * @param {Object} toolData - 工具数据
 */
export const createTool = async (toolData) => {
  try {
    const result = await createToolOnGitHub(toolData)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to create tool:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 更新工具
 * @param {number} id - 工具 ID
 * @param {Object} updates - 更新数据
 */
export const updateTool = async (id, updates) => {
  try {
    const result = await updateToolOnGitHub(id, updates)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to update tool:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 删除工具
 * @param {number} id - 工具 ID
 */
export const deleteTool = async (id) => {
  try {
    const result = await deleteToolOnGitHub(id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to delete tool:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 点赞工具
 * @param {number} toolId - 工具 ID
 */
export const likeTool = async (toolId) => {
  try {
    // 这里可以实现点赞逻辑
    // 目前只是返回成功
    // 可以在 GitHub API 中添加点赞统计
    return { success: true }
  } catch (error) {
    console.error('Failed to like tool:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 提交工具（别名）
 * @param {Object} toolData - 工具数据
 */
export const submitTool = async (toolData) => {
  return await createTool(toolData)
}

/**
 * 增加浏览量
 * @param {number} toolId - 工具 ID
 */
export const incrementViews = async (toolId) => {
  try {
    const result = await incrementViewsOnGitHub(toolId)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to increment views:', error)
    return { success: false, error: error.message }
  }
}

export default {
  fetchTools,
  createTool,
  updateTool,
  deleteTool,
  likeTool,
  submitTool,
  incrementViews
}
