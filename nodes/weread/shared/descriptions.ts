import type { INodeProperties } from 'n8n-workflow';

export const bookIdField: INodeProperties = {
	displayName: '书籍 ID',
	name: 'bookId',
	type: 'string',
	default: '',
	required: true,
	description: '书籍的唯一标识符',
	placeholder: '例如：CB_xxxxxxxxxxxxx',
};

export const limitField: INodeProperties = {
	displayName: '返回数量',
	name: 'limit',
	type: 'number',
	default: 50,
	description: 'Max number of results to return',
	typeOptions: {
		minValue: 1,
	},
};

export const includeChaptersField: INodeProperties = {
	displayName: '包含章节信息',
	name: 'includeChapters',
	type: 'boolean',
	default: false,
	description: 'Whether to fetch chapter information and associate it with results',
};

