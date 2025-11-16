import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { wereadApiRequest } from '../shared/transport';

export async function getBooks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const returnData: INodeListSearchResult = { results: [] };

	try {
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

		let books = responseData.books
			.filter((book) => {
				const title = book.title || book.book?.title;
				return book.bookId && title;
			})
			.map((book) => {
				const title = book.title || book.book?.title || '';
				const author = book.author || book.book?.author || '';
				return {
					name: `${title}${author ? ` - ${author}` : ''}`,
					value: book.bookId,
				};
			});

		if (filter) {
			const filterLower = filter.toLowerCase();
			books = books.filter((book) => book.name.toLowerCase().includes(filterLower));
		}

		returnData.results = books;
	} catch {
		// 获取书籍失败，返回空结果
	}

	return returnData;
}

