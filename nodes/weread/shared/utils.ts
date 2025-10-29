// 时间戳转换为日期字符串
export function formatTimestamp(timestamp: number): string {
	if (!timestamp) return '';
	return new Date(timestamp * 1000).toISOString();
}

// 评分转换（除以100）
export function formatRating(rating: number): number {
	if (!rating) return 0;
	return rating / 100;
}

// 星级评分转换（除以20得到5分制）
export function formatStarRating(star: number): number {
	if (!star) return 0;
	return star / 20;
}

// 阅读时长格式化（秒转换为小时）
export function formatReadingTime(seconds: number): {
	seconds: number;
	minutes: number;
	hours: number;
	formatted: string;
} {
	if (!seconds) {
		return { seconds: 0, minutes: 0, hours: 0, formatted: '0分钟' };
	}
	
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	
	let formatted = '';
	if (hours > 0) {
		formatted += `${hours}小时`;
	}
	if (minutes > 0 || hours === 0) {
		formatted += `${minutes}分钟`;
	}
	
	return {
		seconds,
		minutes: Math.floor(seconds / 60),
		hours: parseFloat((seconds / 3600).toFixed(2)),
		formatted,
	};
}

// 划线颜色样式映射
export function getColorStyleName(colorStyle: number): string {
	const colorMap: Record<number, string> = {
		0: '蓝色',
		1: '红色',
		2: '黄色',
		3: '绿色',
	};
	return colorMap[colorStyle] || '未知';
}

// 笔记类型映射
export function getReviewTypeName(type: number): string {
	const typeMap: Record<number, string> = {
		1: '划线笔记',
		4: '书评/想法',
	};
	return typeMap[type] || '其他';
}

