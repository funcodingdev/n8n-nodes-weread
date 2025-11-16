import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

/**
 * ========================================
 * 微信读书 API 常量定义
 * ========================================
 */

/** 微信读书基础 URL */
export const WEREAD_BASE_URL = 'https://weread.qq.com';

/** 微信读书主页 URL（用于会话刷新） */
export const WEREAD_MAIN_URL = 'https://weread.qq.com/';

/**
 * API 端点路径
 * 所有端点均为相对路径，需要与 WEREAD_BASE_URL 组合使用
 */
export const WEREAD_NOTEBOOK_URL = '/api/user/notebook'; // 获取包含笔记的书架
export const WEREAD_SHELF_SYNC_URL = '/web/shelf/sync'; // 获取完整书架
export const WEREAD_BOOKMARKLIST_URL = '/web/book/bookmarklist'; // 获取书籍划线
export const WEREAD_READ_INFO_URL = '/web/book/readinfo'; // 获取阅读详情（已废弃）
export const WEREAD_REVIEW_LIST_URL = '/web/review/list'; // 获取书评/笔记
export const WEREAD_BOOK_INFO_URL = '/web/book/info'; // 获取书籍详情
export const WEREAD_CHAPTER_INFO_URL = '/web/book/chapterInfos'; // 获取章节信息
export const WEREAD_PROGRESS_URL = '/web/book/getProgress'; // 获取阅读进度

/**
 * ========================================
 * HTTP Headers 构建函数
 * ========================================
 */

/**
 * 构建微信读书 API 请求的标准 Headers
 *
 * 模拟真实浏览器环境，确保请求能够通过服务器验证
 * 关键点：
 * 1. User-Agent 必须与浏览器一致
 * 2. Accept-Encoding 支持压缩传输
 * 3. Cookie 包含完整的认证信息
 * 4. 顺序和格式与浏览器保持一致，避免被识别为爬虫
 *
 * @param cookie - 用户的 Cookie 字符串，包含 wr_vid、wr_skey 等认证信息
 * @param userAgent - 浏览器 User-Agent 字符串
 * @returns HTTP Headers 对象
 */
function buildHeaders(cookie: string, userAgent: string): Record<string, string> {
	return {
		'User-Agent': userAgent,
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
		'accept': 'application/json, text/plain, */*',
		'Content-Type': 'application/json',
		'Cookie': cookie,
		'Referer': 'https://weread.qq.com/',
		'Origin': 'https://weread.qq.com',
	};
}

/**
 * ========================================
 * 会话管理函数
 * ========================================
 */

/**
 * 刷新会话（访问主页以保持 Session 有效）
 *
 * 当 API 返回 401 或 -2012 错误时，通过访问主页来刷新会话
 * 这可以触发微信读书服务器更新 Cookie 中的 wr_skey
 *
 * 注意：此操作使用 HEAD 方法，仅获取响应头以节省带宽
 *
 * @param context - n8n 执行上下文，用于发送 HTTP 请求
 * @param cookie - 用户的 Cookie 字符串
 * @param userAgent - 浏览器 User-Agent 字符串
 */
async function refreshSession(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	cookie: string,
	userAgent: string,
): Promise<void> {
	try {
		await context.helpers.httpRequest({
			method: 'HEAD', // 使用 HEAD 方法，只获取响应头
			url: WEREAD_BASE_URL,
			headers: buildHeaders(cookie, userAgent),
		});
	} catch {
		// 刷新失败不抛出异常，允许后续重试继续执行
		// 静默处理刷新失败，不影响主流程
	}
}

/**
 * ========================================
 * 错误处理函数
 * ========================================
 */

/**
 * 处理微信读书 API 错误
 *
 * 微信读书 API 的错误响应格式：
 * {
 *   "errCode": -2010,  // 或 "errcode"
 *   "errMsg": "用户不存在",  // 或 "errmsg"
 *   "errLog": "xxx",
 *   "info": ""
 * }
 *
 * 常见错误码：
 * - -2012: 登录超时，Cookie 中的 wr_skey 已过期
 * - -2010: 用户不存在，Cookie 无效或已被服务器清除
 * - 401 HTTP 状态码: 未授权，需要重新登录
 *
 * @param error - 捕获到的错误对象
 * @throws 总是抛出格式化后的错误信息
 */
function handleWereadError(error: unknown): never {
	// 1. 尝试从 HTTP 响应中提取错误信息
	if (
		error &&
		typeof error === 'object' &&
		'response' in error &&
		(error as Record<string, unknown>).response &&
		typeof (error as Record<string, unknown>).response === 'object'
	) {
		const response = (error as Record<string, unknown>).response as Record<string, unknown>;
		if (response.body && typeof response.body === 'object') {
			const body = response.body as Record<string, unknown>;

			// 支持两种字段名格式：errCode/errcode 和 errMsg/errmsg
			const errCode = body.errCode !== undefined ? body.errCode : body.errcode;
			if (errCode !== undefined) {
				const errMsg = (body.errMsg || body.errmsg || '未知错误') as string;

				// 处理 Cookie 过期或用户异常的情况
				if (errCode === -2012 || errCode === -2010) {
					throw new Error(
						`微信读书 Cookie 已过期或用户异常 (错误码: ${errCode})\n` +
							`错误信息: ${errMsg}\n\n` +
							`解决方案：\n` +
							`1. 在浏览器中访问 https://weread.qq.com 并重新登录\n` +
							`2. 打开浏览器开发者工具（F12）\n` +
							`3. 在 Network 标签页中找到任意请求，复制 Cookie 请求头\n` +
							`4. 在 n8n 中更新微信读书凭证配置\n` +
							`5. 确保 Cookie 包含 wr_vid 和 wr_skey 字段`,
					);
				}

				// 其他 API 错误
				throw new Error(`微信读书 API 错误 (${errCode}): ${errMsg}`);
			}
		}
	}

	// 2. 如果是带有 message 的错误对象，直接抛出
	if (error && typeof error === 'object' && 'message' in error) {
		throw error;
	}

	// 3. 未知错误
	throw new Error('微信读书 API 请求失败：未知错误');
}

/**
 * 检查 API 响应是否包含错误码
 *
 * 微信读书的某些 API 即使 HTTP 状态码为 200，也可能在响应体中返回错误码
 * 响应格式可能是：
 * 1. 对象：{"errcode": -2012, "errmsg": "登录超时"}
 * 2. 数组：[{"errCode": -2010, "errMsg": "用户不存在"}]
 *
 * 此函数会检查响应体中的 errCode/errcode 字段：
 * - 如果不存在或为 0，表示成功，不做处理
 * - 如果存在且非 0，表示业务错误，抛出异常
 *
 * @param response - API 响应对象或数组
 * @throws 如果响应包含错误码，抛出格式化的错误信息
 */
function checkResponseError(response: unknown): void {
	// 处理数组响应（某些 API 返回数组格式的错误）
	if (Array.isArray(response)) {
		if (response.length > 0 && response[0] && typeof response[0] === 'object') {
			const firstItem = response[0] as Record<string, unknown>;
			const errCode = firstItem.errCode !== undefined ? firstItem.errCode : firstItem.errcode;
			if (errCode !== undefined && errCode !== 0) {
				const errMsg = (firstItem.errMsg || firstItem.errmsg || '未知错误') as string;

				// Cookie 过期或用户异常的错误码
				if (errCode === -2012 || errCode === -2010) {
					throw new Error(
						`微信读书 Cookie 已过期或用户异常 (错误码: ${errCode})\n` +
							`错误信息: ${errMsg}\n\n` +
							`解决方案：\n` +
							`1. 在浏览器中访问 https://weread.qq.com 并重新登录\n` +
							`2. 打开浏览器开发者工具（F12）\n` +
							`3. 在 Network 标签页中找到任意请求，复制 Cookie 请求头\n` +
							`4. 在 n8n 中更新微信读书凭证配置\n` +
							`5. 确保 Cookie 包含 wr_vid 和 wr_skey 字段`,
					);
				}

				throw new Error(`微信读书 API 错误 (${errCode}): ${errMsg}`);
			}
		}
		return;
	}

	// 处理对象响应
	if (response && typeof response === 'object') {
		const data = response as Record<string, unknown>;

		// 支持两种字段名格式：errCode 和 errcode（微信读书 API 不统一）
		const errCode = data.errCode !== undefined ? data.errCode : data.errcode;

		// 只有当错误码存在且不为 0 时才认为是错误
		if (errCode !== undefined && errCode !== 0) {
			const errMsg = (data.errMsg || data.errmsg || '未知错误') as string;

			// Cookie 过期或用户异常的错误码
			if (errCode === -2012 || errCode === -2010) {
				throw new Error(
					`微信读书 Cookie 已过期或用户异常 (错误码: ${errCode})\n` +
						`错误信息: ${errMsg}\n\n` +
						`解决方案：\n` +
						`1. 在浏览器中访问 https://weread.qq.com 并重新登录\n` +
						`2. 打开浏览器开发者工具（F12）\n` +
						`3. 在 Network 标签页中找到任意请求，复制 Cookie 请求头\n` +
						`4. 在 n8n 中更新微信读书凭证配置\n` +
						`5. 确保 Cookie 包含 wr_vid 和 wr_skey 字段`,
				);
			}

			// 其他业务错误
			throw new Error(`微信读书 API 错误 (${errCode}): ${errMsg}`);
		}
	}
}

/**
 * ========================================
 * 主要 API 请求函数
 * ========================================
 */

/**
 * 微信读书 API 请求（带自动重试和会话刷新）
 *
 * 执行流程：
 * 1. 第一次尝试直接请求
 * 2. 检查响应中的错误码（errCode/errcode）
 * 3. 如果失败：
 *    a. 先刷新会话（访问主页触发 Cookie 更新）
 *    b. 等待递增的延迟时间（1秒、2秒、3秒...）
 *    c. 重新发起请求
 * 4. 如果是 Cookie 过期错误（-2012/-2010），不再重试，直接抛出
 * 5. 最多重试 maxRetries 次
 *
 * 为什么需要重试机制？
 * - 微信读书的 Cookie 有两个关键字段：wr_vid（用户ID）和 wr_skey（会话密钥）
 * - wr_skey 会定期过期，但可以通过访问主页来刷新
 * - 某些请求可能因网络波动而失败，重试可以提高成功率
 *
 * @param method - HTTP 方法（GET、POST 等）
 * @param resource - API 端点路径（相对于 WEREAD_BASE_URL）
 * @param qs - URL 查询参数
 * @param body - 请求体（用于 POST 请求）
 * @param maxRetries - 最大重试次数，默认 3 次
 * @returns API 响应数据
 * @throws 如果所有重试都失败，抛出详细的错误信息
 */
export async function wereadApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
	maxRetries: number = 3,
): Promise<unknown> {
	// 从凭证中获取 Cookie 和 User-Agent
	const credentials = await this.getCredentials('wereadManualCookieApi');
	const cookie = credentials.cookie as string;
	const userAgent = credentials.userAgent as string;

	let lastError: unknown = null;

	// 重试循环
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			// 如果不是第一次尝试，先刷新会话并等待
			if (attempt > 0) {
				// 刷新会话（触发 wr_skey 更新）
				await refreshSession(this, cookie, userAgent);

				// 递增的重试延迟：第 1 次重试等待 1 秒，第 2 次等待 2 秒，以此类推
				// 这样可以给服务器更多的恢复时间
				const delayMs = 1000 * attempt;
				const startTime = Date.now();
				while (Date.now() - startTime < delayMs) {
					// 使用空循环实现延迟（n8n 环境中的简单延迟方案）
				}
			}

			// 构建请求选项
			const options: IHttpRequestOptions = {
				method,
				qs,
				body,
				url: `${WEREAD_BASE_URL}${resource}`,
				json: true, // 自动解析 JSON 响应
				headers: buildHeaders(cookie, userAgent),
			};

			// 发送 HTTP 请求
			const response = await this.helpers.httpRequest(options);

			// 检查响应体中的错误码（微信读书有时 HTTP 200 但业务失败）
			checkResponseError(response);

			// 请求成功，返回响应数据
			return response;
		} catch (error) {
			lastError = error;

			// 如果是 Cookie 过期错误，不再重试，直接抛出
			// 因为重试也无法解决 Cookie 已完全失效的问题
			if (
				error &&
				typeof error === 'object' &&
				'message' in error &&
				typeof error.message === 'string' &&
				(error.message.includes('Cookie 已过期') || error.message.includes('用户异常'))
			) {
				throw error;
			}

			// 如果已经是最后一次尝试，抛出错误
			if (attempt === maxRetries - 1) {
				handleWereadError(error);
			}

			// 否则继续下一次重试
		}
	}

	// 理论上不应该到达这里（所有重试都失败会在上面抛出）
	// 但为了类型安全，仍然处理这种情况
	if (lastError) {
		handleWereadError(lastError);
	}

	throw new Error('微信读书 API 请求失败：未知错误（所有重试都失败）');
}
