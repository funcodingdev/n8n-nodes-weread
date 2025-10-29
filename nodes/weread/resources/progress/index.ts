import type { INodeProperties } from 'n8n-workflow';
import { getDescription } from './get';

const showOnlyForProgress = {
	resource: ['progress'],
};

export const progressDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProgress,
		},
		options: [
			{
				name: '获取阅读进度',
				value: 'get',
				action: '获取书籍阅读进度',
				description: '获取指定书籍的阅读进度信息',
				routing: {
					request: {
						method: 'GET',
						url: '=/web/book/getProgress?bookId={{$parameter.bookId.value || $parameter.bookId}}',
					},
				},
			},
		],
		default: 'get',
	},
	...getDescription,
];

