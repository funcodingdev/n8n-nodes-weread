import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetAll = {
	operation: ['getAll'],
	resource: ['bookshelf'],
};

export const getAllDescription: INodeProperties[] = [
	{
		displayName: '无需额外参数',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions: { show: showOnlyForGetAll },
	},
];

