import type { INodeProperties } from 'n8n-workflow';

export const bookIdField: INodeProperties = {
	displayName: '书籍',
	name: 'bookId',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: '选择或输入书籍 ID',
	modes: [
		{
			displayName: '从列表选择',
			name: 'list',
			type: 'list',
			placeholder: '选择书籍...',
			typeOptions: {
				searchListMethod: 'getBooks',
				searchable: true,
			},
		},
		{
			displayName: '按 ID',
			name: 'id',
			type: 'string',
			placeholder: '例如：CB_xxxxxxxxxxxxx',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '.+',
						errorMessage: '请输入有效的书籍 ID',
					},
				},
			],
		},
	],
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

