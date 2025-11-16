import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class WereadManualCookieApi implements ICredentialType {
	name = 'wereadManualCookieApi';
	displayName = '微信读书 (手动 Cookie) API';
	icon = 'file:../icons/weread.png' as const;
	documentationUrl = 'https://github.com/funcodingdev/n8n-nodes-weread';
	properties: INodeProperties[] = [
		{
			displayName: 'Cookie',
			name: 'cookie',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: '微信读书的 Cookie，从浏览器开发者工具中获取',
			placeholder: 'wr_vid=123456; wr_skey=abcdef...',
		},
		{
			displayName: 'User-Agent',
			name: 'userAgent',
			type: 'string',
			default:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
			description: '浏览器 User-Agent 字符串',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			url: 'https://weread.qq.com/api/user/notebook',
			method: 'GET' as IHttpRequestMethods,
			headers: {
				Cookie: '={{$credentials.cookie}}',
				'User-Agent': '={{$credentials.userAgent}}',
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
				Referer: 'https://weread.qq.com/',
				Origin: 'https://weread.qq.com',
			},
		},
	};
}

