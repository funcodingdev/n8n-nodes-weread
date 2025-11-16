import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	IHttpRequestMethods,
} from 'n8n-workflow';

/**
 * 微信读书手动 Cookie 认证凭证
 *
 * 此凭证类型允许用户手动提供微信读书的 Cookie 和 User-Agent
 * 适用于无法使用 OAuth 或其他自动认证方式的场景
 *
 * 手动 Cookie 方式是最稳定和可靠的认证方式
 */
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
			description:
				'微信读书的 Cookie 字符串。<br><br>' +
				'<strong>获取步骤：</strong><br>' +
				'1. 在浏览器中访问 <a href="https://weread.qq.com" target="_blank">https://weread.qq.com</a> 并登录<br>' +
				'2. 打开浏览器开发者工具（按 F12）<br>' +
				'3. 切换到 "Network"（网络）标签页<br>' +
				'4. 刷新页面，选择任意请求<br>' +
				'5. 在请求头中找到 "Cookie"，复制完整的 Cookie 值<br>' +
				'6. 确保 Cookie 中包含 <code>wr_vid</code> 和 <code>wr_skey</code> 字段<br><br>' +
				'<strong>注意：</strong>Cookie 会定期过期，需要重新获取',
			placeholder: 'wr_vid=123456; wr_skey=abcdef; wr_name=...',
		},
		{
			displayName: 'User-Agent',
			name: 'userAgent',
			type: 'string',
			default:
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
			description:
				'浏览器 User-Agent 字符串。<br><br>' +
				'<strong>建议：</strong>使用与获取 Cookie 相同的浏览器的 User-Agent<br>' +
				'可以在浏览器开发者工具的请求头中找到 "User-Agent" 字段<br>' +
				'保持 User-Agent 与 Cookie 匹配可以提高请求成功率',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	/**
	 * 凭证测试请求
	 *
	 * 通过请求用户的笔记书架（/api/user/notebook）来验证 Cookie 是否有效
	 * 这是最简单且可靠的验证方式
	 *
	 * 测试成功条件：
	 * - HTTP 状态码为 200
	 * - 响应体中不包含 errcode 错误码，或 errcode 为 0
	 *
	 * 测试失败场景：
	 * - Cookie 已过期（errcode: -2012）
	 * - 用户不存在（errcode: -2010）
	 * - Cookie 格式错误或缺少必需字段
	 */
	test: ICredentialTestRequest = {
		request: {
			url: 'https://weread.qq.com/api/user/notebook',
			method: 'GET' as IHttpRequestMethods,
			headers: {
				// 模拟真实浏览器的请求头，与 transport.ts 中的 buildHeaders 保持一致
				'User-Agent': '={{$credentials.userAgent}}',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
				'accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'Cookie': '={{$credentials.cookie}}',
				'Referer': 'https://weread.qq.com/',
				'Origin': 'https://weread.qq.com',
			},
		},
	};
}

