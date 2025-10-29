import type { INodeProperties } from 'n8n-workflow';
import { getAllDescription } from './getAll';

const showOnlyForChapters = {
	resource: ['chapters'],
};

export const chaptersDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForChapters,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: '获取书籍的章节信息',
				description: '获取指定书籍的所有章节信息',
				routing: {
					request: {
						method: 'POST',
						url: '/web/book/chapterInfos',
						body: {
							bookIds: '={{[$parameter.bookId]}}',
						},
					},
				},
			},
		],
		default: 'getAll',
	},
	...getAllDescription,
];

