import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { bookshelfDescription } from './resources/bookshelf';
import { bookDescription } from './resources/book';
import { notesDescription } from './resources/notes';
import { bookmarksDescription } from './resources/bookmarks';
import { progressDescription } from './resources/progress';
import { reviewsDescription } from './resources/reviews';
import { chaptersDescription } from './resources/chapters';

export class Weread implements INodeType {
	description: INodeTypeDescription = {
		displayName: '微信读书',
		name: 'weread',
		icon: 'file:../../icons/weread.png',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: '通过微信读书 API 获取书架、笔记、划线等数据',
		defaults: {
			name: '微信读书',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'wereadApi',
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
}

