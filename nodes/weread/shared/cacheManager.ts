/**
 * Cookie 缓存项
 */
interface CacheItem {
	cookie: string;
	timestamp: number;
	credentialId: string;
}

/**
 * Cookie 缓存管理器
 * 用于缓存从 CookieCloud 获取的 Cookie，避免频繁请求
 */
class CookieCacheManager {
	// 缓存存储
	private cache: Map<string, CacheItem> = new Map();

	// 默认缓存过期时间：12 小时（毫秒）
	private readonly DEFAULT_TTL = 12 * 60 * 60 * 1000;

	/**
	 * 生成缓存键
	 * @param server CookieCloud 服务器地址
	 * @param uuid CookieCloud UUID
	 * @returns 缓存键
	 */
	private generateKey(server: string, uuid: string): string {
		return `${server}:${uuid}`;
	}

	/**
	 * 获取缓存的 Cookie
	 * @param server CookieCloud 服务器地址
	 * @param uuid CookieCloud UUID
	 * @param credentialId 凭证 ID（用于验证凭证是否更改）
	 * @returns 如果缓存有效，返回 Cookie；否则返回 null
	 */
	get(server: string, uuid: string, credentialId: string): string | null {
		const key = this.generateKey(server, uuid);
		const item = this.cache.get(key);

		if (!item) {
			return null;
		}

		// 检查凭证是否改变（防止凭证更新后使用旧 Cookie）
		if (item.credentialId !== credentialId) {
			this.cache.delete(key);
			return null;
		}

		// 检查缓存是否过期
		const now = Date.now();
		if (now - item.timestamp > this.DEFAULT_TTL) {
			this.cache.delete(key);
			return null;
		}

		return item.cookie;
	}

	/**
	 * 设置缓存的 Cookie
	 * @param server CookieCloud 服务器地址
	 * @param uuid CookieCloud UUID
	 * @param cookie 获取的 Cookie 字符串
	 * @param credentialId 凭证 ID
	 */
	set(server: string, uuid: string, cookie: string, credentialId: string): void {
		const key = this.generateKey(server, uuid);
		this.cache.set(key, {
			cookie,
			timestamp: Date.now(),
			credentialId,
		});
	}

	/**
	 * 清除特定的缓存
	 * @param server CookieCloud 服务器地址
	 * @param uuid CookieCloud UUID
	 */
	clear(server: string, uuid: string): void {
		const key = this.generateKey(server, uuid);
		this.cache.delete(key);
	}

	/**
	 * 清除所有缓存
	 */
	clearAll(): void {
		this.cache.clear();
	}

	/**
	 * 获取缓存统计信息
	 */
	getStats(): { size: number; ttl: number } {
		return {
			size: this.cache.size,
			ttl: this.DEFAULT_TTL,
		};
	}
}

// 导出单例
export const cookieCacheManager = new CookieCacheManager();

