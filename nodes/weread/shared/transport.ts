import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

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
	const credentials = await this.getCredentials('wereadManualCookieApi');
	const cookie = credentials.cookie as string;
	const userAgent = credentials.userAgent as string;

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
		handleWereadError(error);
	}
}
