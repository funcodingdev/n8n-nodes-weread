import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { bookshelfDescription } from './resources/bookshelf';
import { bookDescription } from './resources/book';
import { notesDescription } from './resources/notes';
import { bookmarksDescription } from './resources/bookmarks';
import { progressDescription } from './resources/progress';
import { reviewsDescription } from './resources/reviews';
import { chaptersDescription } from './resources/chapters';
import { getBooks } from './listSearch/getBooks';

/**
 * 微信读书 n8n 节点
 *
 * 此节点提供对微信读书 API 的完整访问，支持以下功能：
 * - 书架管理：获取书架列表、包含笔记的书籍
 * - 书籍信息：获取书籍详情、阅读进度、章节信息
 * - 笔记管理：获取划线、笔记、书评等内容
 *
 * API 实现完全遵循微信读书官方接口规范
 *
 * 使用说明：
 * 1. 配置凭证：在 n8n 中添加"微信读书 (手动 Cookie) API"凭证
 * 2. 选择资源：书架、书籍、笔记、划线等
 * 3. 选择操作：根据资源类型选择相应的操作
 * 4. 配置参数：填写必需的参数（如书籍ID）
 */
export class Weread implements INodeType {
	description: INodeTypeDescription = {
		displayName: '微信读书',
		name: 'weread',
		// eslint-disable-next-line @n8n/community-nodes/icon-validation
		icon: { light: 'file:../../icons/weread.png', dark: 'file:../../icons/weread.dark.png' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: '通过微信读书 API 获取书架、笔记、划线等阅读数据。支持完整的书籍信息、笔记管理和阅读进度跟踪',
		defaults: {
			name: '微信读书',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'wereadManualCookieApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://weread.qq.com',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: '资源',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '书架',
						value: 'bookshelf',
					},
					{
						name: '书籍',
						value: 'book',
					},
					{
						name: '书评',
						value: 'reviews',
					},
					{
						name: '划线',
						value: 'bookmarks',
					},
					{
						name: '笔记/想法',
						value: 'notes',
					},
					{
						name: '阅读进度',
						value: 'progress',
					},
					{
						name: '章节',
						value: 'chapters',
					},
				],
				default: 'bookshelf',
			},
			...bookshelfDescription,
			...bookDescription,
			...notesDescription,
			...bookmarksDescription,
			...progressDescription,
			...reviewsDescription,
			...chaptersDescription,
		],
	};

	methods = {
		listSearch: {
			getBooks,
		},
	};
}
