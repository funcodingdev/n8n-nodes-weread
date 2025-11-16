import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class WereadApi implements ICredentialType {
	name = 'wereadApi';

	displayName = '微信读书 API';

	icon = 'file:../icons/weread.png' as const;

	documentationUrl = 'https://github.com/funcodingdev/n8n-nodes-weread';

	testedBy = 'weread';

	properties: INodeProperties[] = [
		{
			displayName: 'Cookie 来源',
			name: 'cookieSource',
			type: 'options',
			options: [
				{
					name: '手动输入',
					value: 'manual',
					description: '手动输入 Cookie',
				},
				{
					name: 'CookieCloud',
					value: 'cookiecloud',
					description: '从 CookieCloud 服务器自动获取',
				},
			],
			default: 'manual',
			description: '选择 Cookie 的获取方式',
		},
		{
			displayName: 'Cookie',
			name: 'cookie',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			displayOptions: {
				show: {
					cookieSource: ['manual'],
				},
			},
			description: '微信读书的 Cookie，从浏览器开发者工具中获取',
			placeholder: 'wr_vid=123456; wr_skey=abcdef...',
		},
		{
			displayName: 'CookieCloud 服务器地址',
			name: 'cookieCloudServer',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					cookieSource: ['cookiecloud'],
				},
			},
			description: 'CookieCloud 服务器地址，例如：https://your-cookiecloud-server.com',
			placeholder: 'https://your-cookiecloud-server.com',
		},
		{
			displayName: 'CookieCloud UUID',
			name: 'cookieCloudUuid',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					cookieSource: ['cookiecloud'],
				},
			},
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
			displayOptions: {
				show: {
					cookieSource: ['cookiecloud'],
				},
			},
			description: 'CookieCloud 的加密密码',
		},
		{
			displayName: 'User-Agent',
			name: 'userAgent',
			type: 'string',
			default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
			description: '浏览器 User-Agent 字符串',
		},
	];

	// 凭证验证处理说明
	// - 手动输入模式：使用 test 属性验证 Cookie 有效性
	// - CookieCloud 模式：由于需要先从 CookieCloud 获取 Cookie，测试在节点执行时进行
	// - 实际验证由 transport.ts 中的 validateWereadCredentials 函数处理
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://weread.qq.com',
			url: '/api/user/notebook',
			method: 'GET' as IHttpRequestMethods,
		},
	};
}

