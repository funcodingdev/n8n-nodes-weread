import type { INodeProperties } from 'n8n-workflow';
import { bookIdField, includeChaptersField } from '../../shared/descriptions';

const showOnlyForGetAll = {
	operation: ['getAll'],
	resource: ['notes'],
};

export const getAllDescription: INodeProperties[] = [
	{
		...bookIdField,
		displayOptions: { show: showOnlyForGetAll },
	},
	{
		...includeChaptersField,
		displayOptions: { show: showOnlyForGetAll },
	},
	{
		displayName: '列表类型',
		name: 'listType',
		type: 'number',
		default: 4,
		displayOptions: { show: showOnlyForGetAll },
		description: '笔记列表类型',
	},
];

