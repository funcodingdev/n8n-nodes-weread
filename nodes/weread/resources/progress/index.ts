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
						url: '=/book/readinfo?bookId={{$parameter.bookId.value || $parameter.bookId}}&noteCount=1&readingDetail=1&finishedBookIndex=1&readingBookCount=1&readingBookIndex=1&finishedBookCount=1&finishedDate=1',
						headers: {
							baseapi: '32',
							appver: '8.2.5.10163885',
							basever: '8.2.5.10163885',
							osver: '12',
						},
					},
				},
			},
		],
		default: 'get',
	},
	...getDescription,
];

