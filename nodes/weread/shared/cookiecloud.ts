import { createHash, createDecipheriv } from 'crypto';

/**
 * CookieCloud 配置接口
 */
export interface CookieCloudConfig {
	server: string;
	uuid: string;
	password: string;
}

/**
 * CookieCloud 响应接口
 */
interface CookieCloudResponse {
	encrypted?: string;
	cookie_data?: {
		[domain: string]: {
			[name: string]: {
				value: string;
				domain?: string;
				path?: string;
				expires?: number;
				httpOnly?: boolean;
				secure?: boolean;
			};
		};
	};
}

/**
 * 计算 MD5 哈希
 */
function md5(text: string): string {
	return createHash('md5').update(text).digest('hex');
}

/**
 * PKCS7 去填充
 */
function pkcs7Unpad(data: Buffer): Buffer {
	const padLen = data[data.length - 1];
	return data.slice(0, data.length - padLen);
}

/**
 * 使用 OpenSSL 兼容的 EVP_BytesToKey 派生密钥和 IV
 * 这与 CryptoJS 的实现兼容
 */
function bytesToKey(
	password: Buffer,
	salt: Buffer,
	keyLen: number,
	ivLen: number,
): { key: Buffer; iv: Buffer } {
	const hashes: Buffer[] = [];
	let lastHash: Buffer | null = null;
	const totalLen = keyLen + ivLen;

	while (hashes.reduce((sum, hash) => sum + hash.length, 0) < totalLen) {
		const hash = createHash('md5');
		if (lastHash) {
			hash.update(lastHash);
		}
		hash.update(password);
		hash.update(salt);
		lastHash = Buffer.from(hash.digest());
		hashes.push(lastHash);
	}

	const result = Buffer.concat(hashes);
	return {
		key: Buffer.from(result.slice(0, keyLen)),
		iv: Buffer.from(result.slice(keyLen, keyLen + ivLen)),
	};
}

/**
 * 解密 CryptoJS AES 加密的数据
 * CryptoJS 使用 "Salted__" + 8字节盐 + 密文 的格式
 */
function decryptCryptoJsAes(password: string, ciphertext: string): string {
	// Base64 解码
	const rawData = Buffer.from(ciphertext, 'base64');

	// 验证格式：必须以 "Salted__" 开头
	if (rawData.length < 16 || rawData.slice(0, 8).toString() !== 'Salted__') {
		throw new Error('Invalid CookieCloud encrypted data format');
	}

	// 提取盐和密文
	const salt = rawData.slice(8, 16);
	const encrypted = rawData.slice(16);

	// 使用密码和盐派生密钥和 IV
	const { key, iv } = bytesToKey(Buffer.from(password, 'utf8'), salt, 32, 16);

	// 使用 AES-256-CBC 解密
	const decipher = createDecipheriv('aes-256-cbc', key, iv);
	decipher.setAutoPadding(false); // 手动处理 PKCS7 填充

	const updated = Buffer.from(decipher.update(encrypted));
	const final = Buffer.from(decipher.final());
	let decrypted = Buffer.concat([updated, final]);

	// 去除 PKCS7 填充
	decrypted = Buffer.from(pkcs7Unpad(decrypted));

	return decrypted.toString('utf8');
}

/**
 * 从 CookieCloud 获取 Cookie 数据
 */
export async function getCookieFromCloud(config: CookieCloudConfig): Promise<string> {
	const { server, uuid, password } = config;

	// 验证配置
	if (!server || !uuid || !password) {
		throw new Error('CookieCloud configuration is incomplete');
	}

	// 构建请求 URL
	const url = `${server.replace(/\/$/, '')}/get/${uuid}`;

	try {
		// 从 CookieCloud 服务器获取数据
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch from CookieCloud: ${response.status} ${response.statusText}`);
		}

		const data = await response.json() as CookieCloudResponse;

		if (!data.encrypted) {
			throw new Error('No encrypted data found in CookieCloud response');
		}

		// 使用 UUID 和密码派生解密密钥
		const keyPassword = md5(`${uuid}-${password}`).substring(0, 16);

		// 解密数据
		const decrypted = decryptCryptoJsAes(keyPassword, data.encrypted);
		const cookieData = JSON.parse(decrypted);

		// 从解密后的数据中提取微信读书的 Cookie
		const wereadCookie = extractWereadCookie(cookieData);

		if (!wereadCookie) {
			throw new Error('No WeRead cookies found in CookieCloud data. Please make sure you have logged in to WeRead (weread.qq.com) in your browser.');
		}

		return wereadCookie;
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new Error(`Failed to get cookies from CookieCloud: ${error.message}`);
		}
		throw new Error('Failed to get cookies from CookieCloud: Unknown error');
	}
}

/**
 * 从 CookieCloud 数据中提取微信读书的 Cookie
 */
function extractWereadCookie(cookieData: CookieCloudResponse['cookie_data']): string | null {
	if (!cookieData) {
		return null;
	}

	const cookies: string[] = [];
	const domains = ['.weread.qq.com', 'weread.qq.com', '.qq.com'];

	// 遍历所有域名查找微信读书相关的 Cookie
	for (const domain of domains) {
		const domainCookies = cookieData[domain];
		if (domainCookies) {
			for (const [name, cookie] of Object.entries(domainCookies)) {
				if (cookie.value) {
					cookies.push(`${name}=${cookie.value}`);
				}
			}
		}
	}

	return cookies.length > 0 ? cookies.join('; ') : null;
}

