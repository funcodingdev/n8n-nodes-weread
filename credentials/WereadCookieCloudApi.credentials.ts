import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WereadCookieCloudApi implements ICredentialType {
	name = 'wereadCookieCloudApi';
	displayName = '微信读书 (CookieCloud) API';
	icon = 'file:../icons/weread.png' as const;
	documentationUrl = 'https://github.com/funcodingdev/n8n-nodes-weread';
	properties: INodeProperties[] = [
		{
			displayName: 'CookieCloud 服务器地址',
			name: 'cookieCloudServer',
			type: 'string',
			default: '',
			required: true,
			description: 'CookieCloud 服务器地址，例如：https://your-cookiecloud-server.com',
			placeholder: 'https://your-cookiecloud-server.com',
		},
		{
			displayName: 'CookieCloud UUID',
			name: 'cookieCloudUuid',
			type: 'string',
			default: '',
			required: true,
			description: 'CookieCloud 的 UUID',
			placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
		},
		{
			displayName: 'CookieCloud 密码',
			name: 'cookieCloudPassword',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'CookieCloud 的加密密码',
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
			url: 'https://weread.qq.com/',
			method: 'GET',
		},
	};
}

