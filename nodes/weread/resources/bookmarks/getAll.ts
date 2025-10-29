import type { INodeProperties } from 'n8n-workflow';
import { bookIdField } from '../../shared/descriptions';

const showOnlyForGetAll = {
	operation: ['getAll'],
	resource: ['bookmarks'],
};

export const getAllDescription: INodeProperties[] = [
	{
		...bookIdField,
		displayOptions: { show: showOnlyForGetAll },
	},
];

