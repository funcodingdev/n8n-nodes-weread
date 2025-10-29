import type { INodeProperties } from 'n8n-workflow';
import { getAllDescription } from './getAll';

const showOnlyForNotes = {
	resource: ['notes'],
};

export const notesDescription: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForNotes,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: '获取书籍的笔记和想法',
				description: '获取指定书籍的所有笔记和想法',
				routing: {
					request: {
						method: 'GET',
						url: '=/web/review/list?bookId={{$parameter.bookId}}&listType={{$parameter.listType || 4}}&listMode=2&syncKey=0&count=0&maxIdx=0',
					},
				},
			},
		],
		default: 'getAll',
	},
	...getAllDescription,
];

