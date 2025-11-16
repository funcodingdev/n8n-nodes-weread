import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { getCookieFromCloud } from './cookiecloud';
import { cookieCacheManager } from './cacheManager';

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
			if ('errcode' in body) {
				const errcode = body.errcode;
				const errmsg = (body.errmsg as string) || '未知错误';

				// Cookie 过期错误码
				if (errcode === -2012 || errcode === -2010) {
					throw new Error('微信读书 Cookie 已过期，请重新设置凭证');
				}

				throw new Error(`微信读书 API 错误 (${errcode}): ${errmsg}`);
			}
		}
	}

	throw error;
}

export async function wereadApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	let cookie: string;
	let userAgent: string;

	// 优先尝试 CookieCloud 凭证
	try {
		const credentials = await this.getCredentials('wereadCookieCloudApi');
		const server = credentials.cookieCloudServer as string;
		const uuid = credentials.cookieCloudUuid as string;
		const password = credentials.cookieCloudPassword as string;
		const credentialId =
			(((credentials as unknown) as Record<string, unknown>).id as string) || `${server}:${uuid}`;

		// 尝试从缓存获取 Cookie
		const cachedCookie = cookieCacheManager.get(server, uuid, credentialId);

		if (cachedCookie) {
			cookie = cachedCookie;
		} else {
			// 缓存不存在或已过期，重新获取
			cookie = await getCookieFromCloud({
				server,
				uuid,
				password,
			});
			// 将新获取的 Cookie 存入缓存
			cookieCacheManager.set(server, uuid, cookie, credentialId);
		}

		userAgent = credentials.userAgent as string;
	} catch (error) {
		// 如果 CookieCloud 失败，使用手动 Cookie 凭证
		try {
			const credentials = await this.getCredentials('wereadManualCookieApi');
			cookie = credentials.cookie as string;
			userAgent = credentials.userAgent as string;
		} catch {
			throw new Error(
				`无法获取任何有效凭证。CookieCloud 错误: ${error instanceof Error ? error.message : '未知错误'}`,
			);
		}
	}

	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `https://weread.qq.com${resource}`,
		json: true,
		headers: buildHeaders(cookie, userAgent),
	};

	try {
		return await this.helpers.httpRequest(options);
	} catch (error) {
		// 如果是 CookieCloud 的 Cookie，API 错误时清除缓存以便下次重新获取
		if (error.response?.body?.errcode) {
			try {
				const credentials = await this.getCredentials('wereadCookieCloudApi');
				const server = credentials.cookieCloudServer as string;
				const uuid = credentials.cookieCloudUuid as string;
				cookieCacheManager.clear(server, uuid);
			} catch {
				// 如果无法获取凭证信息，忽略清除缓存的错误
			}
		}

		handleWereadError(error);
	}
}

