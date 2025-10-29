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
				title?: string;
				author?: string;
				book?: {
					title?: string;
					author?: string;
				};
			}>;
		};

		if (!responseData.books || !Array.isArray(responseData.books)) {
			return returnData;
		}

		// 将书籍转换为搜索结果格式，过滤掉无效数据
		let books = responseData.books
			.filter((book) => {
				// 确保有 bookId 和 title（从顶层或嵌套的 book 对象获取）
				const title = book.title || book.book?.title;
				return book.bookId && title;
			})
			.map((book) => {
				// 尝试从顶层获取，如果没有则从嵌套的 book 对象获取
				const title = book.title || book.book?.title || '';
				const author = book.author || book.book?.author || '';
				return {
					name: `${title}${author ? ` - ${author}` : ''}`,
					value: book.bookId,
				};
			});

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

