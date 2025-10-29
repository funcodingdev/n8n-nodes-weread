import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { getCookieFromCloud } from './cookiecloud';

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

