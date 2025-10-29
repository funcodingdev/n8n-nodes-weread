import type { INodeProperties } from 'n8n-workflow';
import { bookIdField, limitField } from '../../shared/descriptions';

const showOnlyForGetAll = {
	operation: ['getAll'],
	resource: ['reviews'],
};

export const getAllDescription: INodeProperties[] = [
	{
		...bookIdField,
		displayOptions: { show: showOnlyForGetAll },
	},
	{
		...limitField,
		default: 10,
		displayOptions: { show: showOnlyForGetAll },
	},
];

