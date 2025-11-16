export function formatTimestamp(timestamp: number): string {
	return timestamp ? new Date(timestamp * 1000).toISOString() : '';
}

export function formatRating(rating: number): number {
	return rating ? rating / 100 : 0;
}

export function formatStarRating(star: number): number {
	return star ? star / 20 : 0;
}

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

export function getColorStyleName(colorStyle: number): string {
	const colorMap: Record<number, string> = {
		0: '蓝色',
		1: '红色',
		2: '黄色',
		3: '绿色',
	};
	return colorMap[colorStyle] || '未知';
}

export function getReviewTypeName(type: number): string {
	const typeMap: Record<number, string> = {
		1: '划线笔记',
		4: '书评/想法',
	};
	return typeMap[type] || '其他';
}

