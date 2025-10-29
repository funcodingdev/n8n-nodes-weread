import type { INodeProperties } from 'n8n-workflow';
import { getAllDescription } from './getAll';

const showOnlyForBookmarks = {
	resource: ['bookmarks'],
};

export const bookmarksDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForBookmarks,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: '获取书籍的所有划线',
				description: '获取指定书籍的所有划线记录',
				routing: {
					request: {
						method: 'GET',
						url: '=/web/book/bookmarklist?bookId={{$parameter.bookId.value || $parameter.bookId}}',
					},
				},
			},
		],
		default: 'getAll',
	},
	...getAllDescription,
];

