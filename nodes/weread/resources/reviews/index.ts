import type { INodeProperties } from 'n8n-workflow';
import { getAllDescription } from './getAll';

const showOnlyForReviews = {
	resource: ['reviews'],
};

export const reviewsDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForReviews,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: '获取书籍的热门书评',
				description: '获取指定书籍的热门书评列表',
				routing: {
					request: {
						method: 'GET',
						url: '=/web/review/list/best?bookId={{$parameter.bookId}}&count={{$parameter.limit || 10}}&maxIdx=0&synckey=0',
					},
				},
			},
		],
		default: 'getAll',
	},
	...getAllDescription,
];

