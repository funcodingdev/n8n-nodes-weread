import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
	ICredentialsDecrypted,
} from 'n8n-workflow';
import { getCookieFromCloud } from './cookiecloud';

/**
 * 验证 WeRead API 凭证
 * 用于凭证测试，支持手动输入和 CookieCloud 两种模式
 */
export async function validateWereadCredentials(
	credentials: ICredentialsDecrypted['data'],
): Promise<boolean> {
	let cookie: string;

	if (!credentials) {
		throw new Error('Credentials are required');
	}

	const cookieSource = credentials.cookieSource as string;

	if (cookieSource === 'cookiecloud') {
		// 从 CookieCloud 获取 Cookie
		try {
			cookie = await getCookieFromCloud({
				server: credentials.cookieCloudServer as string,
				uuid: credentials.cookieCloudUuid as string,
				password: credentials.cookieCloudPassword as string,
			});
		} catch (error) {
			throw new Error(
				`Failed to get cookie from CookieCloud: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	} else {
		// 使用手动输入的 Cookie
		cookie = credentials.cookie as string;
		if (!cookie) {
			throw new Error('Cookie is required when using manual mode');
		}
	}

	// 验证 Cookie 有效性
	try {
		const response = await fetch('https://weread.qq.com/api/user/notebook', {
			method: 'GET',
			headers: {
				Cookie: cookie,
				'User-Agent': credentials.userAgent as string,
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
				Referer: 'https://weread.qq.com/',
				Origin: 'https://weread.qq.com',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = (await response.json()) as { errcode?: number; errmsg?: string };

		if (data.errcode && data.errcode !== 0) {
			if (data.errcode === -2012 || data.errcode === -2010) {
				throw new Error('Cookie expired, please refresh your credentials');
			}
			throw new Error(`WeRead API error (${data.errcode}): ${data.errmsg || 'Unknown error'}`);
		}

		return true;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error('Failed to validate credentials');
	}
}

export async function wereadApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	// 获取凭证
	const credentials = await this.getCredentials('wereadApi');
	
	// 根据 Cookie 来源获取 Cookie
	let cookie: string;
	if (credentials.cookieSource === 'cookiecloud') {
		// 从 CookieCloud 获取 Cookie
		cookie = await getCookieFromCloud({
			server: credentials.cookieCloudServer as string,
			uuid: credentials.cookieCloudUuid as string,
			password: credentials.cookieCloudPassword as string,
		});
	} else {
		// 使用手动输入的 Cookie
		cookie = credentials.cookie as string;
	}

	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `https://weread.qq.com${resource}`,
		json: true,
		headers: {
			Cookie: cookie,
			'User-Agent': credentials.userAgent as string,
			Accept: 'application/json, text/plain, */*',
			'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
			Referer: 'https://weread.qq.com/',
			Origin: 'https://weread.qq.com',
		},
	};

	try {
		return await this.helpers.httpRequest(options);
	} catch (error) {
		if (error.response?.body?.errcode) {
			const errcode = error.response.body.errcode;
			const errmsg = error.response.body.errmsg || '未知错误';
			
			if (errcode === -2012 || errcode === -2010) {
				throw new Error('微信读书 Cookie 已过期，请重新设置凭证');
			}
			
			throw new Error(`微信读书 API 错误 (${errcode}): ${errmsg}`);
		}
		
		throw error;
	}
}

