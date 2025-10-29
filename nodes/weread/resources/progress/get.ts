import type { INodeProperties } from 'n8n-workflow';
import { bookIdField } from '../../shared/descriptions';

const showOnlyForGet = {
	operation: ['get'],
	resource: ['progress'],
};

export const getDescription: INodeProperties[] = [
	{
		...bookIdField,
		displayOptions: { show: showOnlyForGet },
	},
];

