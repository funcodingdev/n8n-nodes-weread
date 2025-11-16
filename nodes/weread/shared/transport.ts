import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

// 常用 API 端点
export const WEREAD_BASE_URL = 'https://weread.qq.com';
export const WEREAD_MAIN_URL = 'https://weread.qq.com/';
export const WEREAD_NOTEBOOK_URL = '/api/user/notebook';
export const WEREAD_SHELF_SYNC_URL = '/web/shelf/sync';
export const WEREAD_BOOKMARKLIST_URL = '/web/book/bookmarklist';
export const WEREAD_READ_INFO_URL = '/web/book/readinfo';
export const WEREAD_REVIEW_LIST_URL = '/web/review/list';
export const WEREAD_BOOK_INFO_URL = '/web/book/info';
export const WEREAD_CHAPTER_INFO_URL = '/web/book/chapterInfos';

/**
 * 构建微信读书 API 请求的 Headers
 */
function buildHeaders(cookie: string, userAgent: string) {
	return {
		Cookie: cookie,
		'User-Agent': userAgent,
		Accept: 'application/json, text/plain, */*',
		'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
		Referer: 'https://weread.qq.com/',
		Origin: 'https://weread.qq.com',
	};
}

/**
 * 刷新会话（访问主页以保持 Session 有效）
 */
async function refreshSession(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	cookie: string,
	userAgent: string,
) {
	try {
		await context.helpers.httpRequest({
			method: 'GET',
			url: WEREAD_MAIN_URL,
			headers: buildHeaders(cookie, userAgent),
		});
	} catch {
		// 忽略刷新失败的错误
	}
}

/**
 * 处理微信读书 API 错误
 */
function handleWereadError(error: unknown) {
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
			// 支持两种字段名格式：errCode 和 errcode
			const errCode = body.errCode !== undefined ? body.errCode : body.errcode;
			if (errCode !== undefined) {
				const errMsg = (body.errMsg || body.errmsg || '未知错误') as string;

				// Cookie 过期错误码
				if (errCode === -2012 || errCode === -2010) {
					throw new Error('微信读书 Cookie 已过期，请重新设置凭证');
				}

				throw new Error(`微信读书 API 错误 (${errCode}): ${errMsg}`);
			}
		}
	}

	throw error;
}

/**
 * 微信读书 API 请求（带自动重试）
 * 实现流程：
 * 1. 第一次请求
 * 2. 如果失败，刷新会话
 * 3. 重试请求
 * 4. 如果仍失败，再尝试一次
 */
export async function wereadApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
	maxRetries: number = 3,
) {
	const credentials = await this.getCredentials('wereadManualCookieApi');
	const cookie = credentials.cookie as string;
	const userAgent = credentials.userAgent as string;

	let lastError: unknown = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			// 如果不是第一次尝试，先刷新会话
			if (attempt > 0) {
				await refreshSession(this, cookie, userAgent);
			}

			const options: IHttpRequestOptions = {
				method,
				qs,
				body,
				url: `${WEREAD_BASE_URL}${resource}`,
				json: true,
				headers: buildHeaders(cookie, userAgent),
			};

			return await this.helpers.httpRequest(options);
		} catch (error) {
			lastError = error;

			// 如果是 Cookie 过期错误，不再重试
			if (
				error &&
				typeof error === 'object' &&
				'message' in error &&
				typeof error.message === 'string' &&
				error.message.includes('Cookie 已过期')
			) {
				handleWereadError(error);
			}

			// 最后一次尝试失败，抛出错误
			if (attempt === maxRetries - 1) {
				handleWereadError(error);
			}

			// 等待后重试（延迟 1 秒）
			const delayMs = 1000;
			const startTime = Date.now();
			while (Date.now() - startTime < delayMs) {
				// 空循环延迟
			}
		}
	}

	// 理论上不应该到达这里
	if (lastError) {
		handleWereadError(lastError);
	}

	throw new Error('未知错误：无法完成请求');
}
