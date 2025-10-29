import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { wereadApiRequest } from '../shared/transport';

export async function getBooks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const returnData: INodeListSearchResult = { results: [] };

	try {
		// 获取书架上含笔记的书籍
		const responseData = (await wereadApiRequest.call(this, 'GET', '/api/user/notebook')) as {
			books?: Array<{
				bookId: string;
				title: string;
				author: string;
			}>;
		};

		if (!responseData.books || !Array.isArray(responseData.books)) {
			return returnData;
		}

		// 将书籍转换为搜索结果格式
		let books = responseData.books.map((book) => ({
			name: `${book.title}${book.author ? ` - ${book.author}` : ''}`,
			value: book.bookId,
		}));

		// 如果有过滤条件，进行筛选
		if (filter) {
			const filterLower = filter.toLowerCase();
			books = books.filter((book) => book.name.toLowerCase().includes(filterLower));
		}

		returnData.results = books;
	} catch (error) {
		// 如果获取失败，返回空结果而不是抛出错误
		console.error('Failed to fetch books:', error);
	}

	return returnData;
}

