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
 * CookieCloud 解密后的数据格式
 */
interface CookieCloudDecryptedData {
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
	local_storage_data?: {
		[domain: string]: {
			[key: string]: string;
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
 * 算法：循环计算 MD5(lastHash + password + salt)，直到得到足够的 key + iv 长度
 */
function bytesToKey(
	password: Buffer,
	salt: Buffer,
	keyLen: number,
	ivLen: number,
): { key: Buffer; iv: Buffer } {
	const concat: Buffer[] = [];
	let lastHash: Buffer | null = null;
	const totalLen = keyLen + ivLen;

	while (concat.reduce((sum, buf) => sum + buf.length, 0) < totalLen) {
		const hash = createHash('md5');
		if (lastHash) {
			hash.update(lastHash);
		}
		hash.update(password);
		hash.update(salt);
		lastHash = hash.digest();
		concat.push(lastHash);
	}

	const result = Buffer.concat(concat);
	return {
		key: result.slice(0, keyLen),
		iv: result.slice(keyLen, keyLen + ivLen),
	};
}

/**
 * 解密 CryptoJS AES 加密的数据
 * CryptoJS 使用 "Salted__" + 8字节盐 + 密文 的格式
 */
function decryptCryptoJsAes(password: string, ciphertext: string): string {
	const rawData = Buffer.from(ciphertext, 'base64');

	if (rawData.length < 16 || rawData.slice(0, 8).toString() !== 'Salted__') {
		throw new Error('Invalid CookieCloud encrypted data format');
	}

	const salt = rawData.slice(8, 16);
	const encrypted = rawData.slice(16);

	const { key, iv } = bytesToKey(Buffer.from(password, 'utf8'), salt, 32, 16);

	const decipher = createDecipheriv('aes-256-cbc', key, iv);
	decipher.setAutoPadding(false);

	const updated = Buffer.from(decipher.update(encrypted));
	const final = Buffer.from(decipher.final());
	let decrypted = Buffer.concat([updated, final]);

	decrypted = Buffer.from(pkcs7Unpad(decrypted));

	return decrypted.toString('utf8');
}

/**
 * 从 CookieCloud 获取 Cookie 数据
 */
export async function getCookieFromCloud(config: CookieCloudConfig): Promise<string> {
	const { server, uuid, password } = config;

	if (!server || !uuid || !password) {
		throw new Error('CookieCloud configuration is incomplete');
	}

	const url = `${server.replace(/\/$/, '')}/get/${uuid}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch from CookieCloud: ${response.status} ${response.statusText}`);
		}

		const data = await response.json() as CookieCloudResponse;

		if (!data.encrypted) {
			throw new Error('No encrypted data found in CookieCloud response');
		}

		// 根据官方文档：md5(uuid+'-'+password) 取前16位作为key
		const keyPassword = md5(`${uuid}-${password}`).substring(0, 16);

		const decrypted = decryptCryptoJsAes(keyPassword, data.encrypted);
		const decryptedData = JSON.parse(decrypted) as CookieCloudDecryptedData;

		// 解密后的数据格式为 { cookie_data, local_storage_data }
		const wereadCookie = extractWereadCookie(decryptedData.cookie_data);

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
function extractWereadCookie(
	cookieData: CookieCloudDecryptedData['cookie_data'],
): string | null {
	if (!cookieData) {
		return null;
	}

	const cookies: string[] = [];
	const domains = ['.weread.qq.com', 'weread.qq.com', '.qq.com'];

	for (const domain of domains) {
		const domainCookies = cookieData[domain];
		if (domainCookies) {
			for (const [name, cookie] of Object.entries(domainCookies)) {
				if (cookie && cookie.value) {
					cookies.push(`${name}=${cookie.value}`);
				}
			}
		}
	}

	return cookies.length > 0 ? cookies.join('; ') : null;
}

