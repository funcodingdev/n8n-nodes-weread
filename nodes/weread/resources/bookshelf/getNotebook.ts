import type { INodeProperties } from 'n8n-workflow';

const showOnlyForNotebook = {
	operation: ['getNotebook'],
	resource: ['bookshelf'],
};

export const getNotebookDescription: INodeProperties[] = [
	{
		displayName: '无需额外参数',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions: { show: showOnlyForNotebook },
	},
];

