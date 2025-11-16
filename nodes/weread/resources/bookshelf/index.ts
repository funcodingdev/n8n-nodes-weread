import type { INodeProperties } from 'n8n-workflow';
import { getNotebookDescription } from './getNotebook';
import { getAllDescription } from './getAll';

const showOnlyForBookshelf = {
	resource: ['bookshelf'],
};

export const bookshelfDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForBookshelf,
		},
		options: [
			{
				name: '获取书架（含笔记的书籍）',
				value: 'getNotebook',
				action: '获取含笔记的书架',
				description: '获取包含笔记、划线、想法的书籍列表',
				routing: {
					request: {
						method: 'GET',
						url: '/api/user/notebook',
					},
				},
			},
		{
			name: '获取完整书架',
			value: 'getAll',
			action: '获取完整书架',
			description: '获取书架上所有书籍及阅读进度',
			routing: {
				request: {
					method: 'GET',
					url: '/web/shelf/sync',
				},
			},
		},
		],
		default: 'getNotebook',
	},
	...getNotebookDescription,
	...getAllDescription,
];

