/**
 * CookieCloud 配置接口
 */
export interface CookieCloudConfig {
	server: string;
	uuid: string;
	password: string;
}

/**
 * 从 CookieCloud 获取 Cookie 数据
 */
export async function getCookieFromCloud(config: CookieCloudConfig): Promise<string> {
	const { server, uuid, password } = config;

	if (!server || !uuid || !password) {
		throw new Error('CookieCloud configuration is incomplete');
	}

	// 移除末尾的 /
	const baseUrl = server.endsWith('/') ? server.slice(0, -1) : server;
	const url = `${baseUrl}/get/${uuid}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: new URLSearchParams({ password }),
		});

		if (response.status !== 200) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = (await response.json()) as {
			cookie_data?: {
				[domain: string]: Array<{ name: string; value: string }>;
			};
		};

		const cookieData = data.cookie_data;

		if (!cookieData) {
			throw new Error('No cookie_data found in CookieCloud response');
		}

		// 尝试多个域名查找微信读书相关的 Cookie
		const domains = ['weread.qq.com', '.weread.qq.com', '.qq.com'];
		let cookies: Array<{ name: string; value: string }> = [];

		for (const domain of domains) {
			if (cookieData[domain]) {
				cookies = cookieData[domain];
				if (cookies && cookies.length > 0) {
					break;
				}
			}
		}

		if (!cookies || cookies.length === 0) {
			const availableDomains = Object.keys(cookieData).join(', ');
			throw new Error(
				`No WeRead cookies found. Available domains: ${availableDomains || 'none'}. ` +
				`Please make sure you have logged in to weread.qq.com in your browser with CookieCloud enabled.`,
			);
		}

		const cookieStr = cookies
			.map((cookie) => {
				if (!cookie.name || !cookie.value) {
					return null;
				}
				return `${cookie.name}=${cookie.value}`;
			})
			.filter((c) => c !== null)
			.join('; ');

		if (!cookieStr) {
			throw new Error('Failed to extract valid cookies from CookieCloud data');
		}

		return cookieStr;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to get cookies from CookieCloud: ${error.message}`);
		}
		throw new Error('Failed to get cookies from CookieCloud: Unknown error');
	}
}

