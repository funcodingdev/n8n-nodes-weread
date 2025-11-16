import type { INodeProperties } from 'n8n-workflow';
import { getDescription } from './get';

const showOnlyForBook = {
	resource: ['book'],
};

export const bookDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForBook,
		},
		options: [
			{
				name: '获取书籍信息',
				value: 'get',
				action: '获取书籍详细信息',
				description: '获取指定书籍的详细信息',
				routing: {
					request: {
						method: 'GET',
						url: '=/web/book/info?bookId={{$parameter.bookId.value || $parameter.bookId}}',
					},
				},
			},
		],
		default: 'get',
	},
	...getDescription,
];

