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

		if (!cookieData || !cookieData['weread.qq.com']) {
			throw new Error('No WeRead cookies found in CookieCloud response');
		}

		const cookies = cookieData['weread.qq.com'];
		const cookieStr = cookies
			.map((cookie) => `${cookie.name}=${cookie.value}`)
			.join('; ');

		if (!cookieStr) {
			throw new Error('Failed to extract cookies from CookieCloud data');
		}

		return cookieStr;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to get cookies from CookieCloud: ${error.message}`);
		}
		throw new Error('Failed to get cookies from CookieCloud: Unknown error');
	}
}

