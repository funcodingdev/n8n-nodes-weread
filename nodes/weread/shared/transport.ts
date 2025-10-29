import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export async function wereadApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `https://weread.qq.com${resource}`,
		json: true,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'wereadApi', options);
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

