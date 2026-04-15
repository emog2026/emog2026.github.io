// GitHub API 工具类
// 用于从 GitHub 仓库读取和写入 JSON 数据

const GITHUB_API_BASE = 'https://api.github.com'

// GitHub 仓库配置
export const GITHUB_CONFIG = {
  owner: 'emog2026',
  repo: 'emog2026',
  // 在 .env 文件中设置：VITE_GITHUB_TOKEN
  // 可以从 https://github.com/settings/tokens 生成
  // 需要 public_repo 权限
  token: import.meta.env.VITE_GITHUB_TOKEN || ''
}

/**
 * 从 GitHub 仓库获取文件内容
 * @param {string} path - 文件路径（相对于仓库根目录）
 * @returns {Promise<Object>} - 文件内容和 SHA 值
 */
export async function getFileFromGitHub(path) {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
      {
        headers: {
          'Authorization': GITHUB_CONFIG.token ? `token ${GITHUB_CONFIG.token}` : '',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // 解码 Base64 内容
    const content = atob(data.content)
    const parsedData = JSON.parse(content)

    return {
      data: parsedData,
      sha: data.sha, // 用于更新文件
      message: data.message
    }
  } catch (error) {
    console.error('Error fetching file from GitHub:', error)
    throw error
  }
}

/**
 * 更新 GitHub 仓库中的文件
 * @param {string} path - 文件路径
 * @param {Object} content - 新的文件内容（会被 JSON.stringify）
 * @param {string} sha - 文件的当前 SHA 值（用于更新）
 * @param {string} message - 提交消息
 * @returns {Promise<Object>} - 更新后的文件信息
 */
export async function updateFileOnGitHub(path, content, sha, message = 'Update file') {
  try {
    const encodedContent = btoa(JSON.stringify(content, null, 2))

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': GITHUB_CONFIG.token ? `token ${GITHUB_CONFIG.token}` : '',
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: encodedContent,
          sha,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating file on GitHub:', error)
    throw error
  }
}

/**
 * 获取工具列表（从 GitHub JSON 文件）
 * @returns {Promise<Array>} - 工具列表
 */
export async function fetchToolsFromGitHub() {
  try {
    const result = await getFileFromGitHub('src/data/tools.json')
    return result.data
  } catch (error) {
    console.error('Error fetching tools from GitHub:', error)
    throw error
  }
}

/**
 * 保存工具列表到 GitHub
 * @param {Array} tools - 工具列表
 * @param {string} sha - 文件的当前 SHA 值
 * @param {string} message - 提交消息
 * @returns {Promise<Object>} - 更新结果
 */
export async function saveToolsToGitHub(tools, sha, message = 'Update tools') {
  try {
    return await updateFileOnGitHub('src/data/tools.json', tools, sha, message)
  } catch (error) {
    console.error('Error saving tools to GitHub:', error)
    throw error
  }
}

/**
 * 创建新工具
 * @param {Object} tool - 新工具数据
 * @returns {Promise<Object>} - 创建结果
 */
export async function createToolOnGitHub(tool) {
  try {
    const result = await getFileFromGitHub('src/data/tools.json')
    const tools = result.data

    // 生成新 ID
    const newId = Math.max(...tools.map(t => t.id), 0) + 1
    const newTool = {
      ...tool,
      id: newId,
      views: 0,
      comments: 0,
      isHot: false,
      date: new Date().toISOString().split('T')[0]
    }

    tools.push(newTool)

    const updateResult = await saveToolsToGitHub(
      tools,
      result.sha,
      `Add tool: ${tool.title}`
    )

    return updateResult
  } catch (error) {
    console.error('Error creating tool on GitHub:', error)
    throw error
  }
}

/**
 * 更新工具
 * @param {number} id - 工具 ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Object>} - 更新结果
 */
export async function updateToolOnGitHub(id, updates) {
  try {
    const result = await getFileFromGitHub('src/data/tools.json')
    const tools = result.data

    const index = tools.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error(`Tool with id ${id} not found`)
    }

    tools[index] = { ...tools[index], ...updates }

    const updateResult = await saveToolsToGitHub(
      tools,
      result.sha,
      `Update tool: ${tools[index].title}`
    )

    return updateResult
  } catch (error) {
    console.error('Error updating tool on GitHub:', error)
    throw error
  }
}

/**
 * 删除工具
 * @param {number} id - 工具 ID
 * @returns {Promise<Object>} - 删除结果
 */
export async function deleteToolOnGitHub(id) {
  try {
    const result = await getFileFromGitHub('src/data/tools.json')
    const tools = result.data

    const index = tools.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error(`Tool with id ${id} not found`)
    }

    const toolTitle = tools[index].title
    tools.splice(index, 1)

    const updateResult = await saveToolsToGitHub(
      tools,
      result.sha,
      `Delete tool: ${toolTitle}`
    )

    return updateResult
  } catch (error) {
    console.error('Error deleting tool on GitHub:', error)
    throw error
  }
}

/**
 * 增加工具浏览量
 * @param {number} id - 工具 ID
 * @returns {Promise<Object>} - 更新结果
 */
export async function incrementViewsOnGitHub(id) {
  try {
    const result = await getFileFromGitHub('src/data/tools.json')
    const tools = result.data

    const index = tools.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error(`Tool with id ${id} not found`)
    }

    tools[index].views += 1

    const updateResult = await saveToolsToGitHub(
      tools,
      result.sha,
      `Increment views: ${tools[index].title}`
    )

    return updateResult
  } catch (error) {
    console.error('Error incrementing views on GitHub:', error)
    throw error
  }
}

export default {
  GITHUB_CONFIG,
  getFileFromGitHub,
  updateFileOnGitHub,
  fetchToolsFromGitHub,
  saveToolsToGitHub,
  createToolOnGitHub,
  updateToolOnGitHub,
  deleteToolOnGitHub,
  incrementViewsOnGitHub
}
