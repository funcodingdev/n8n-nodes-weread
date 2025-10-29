import { config } from '@n8n/node-cli/eslint';

// 忽略 PNG 图标格式的 lint 错误
export default [
	...config,
	{
		rules: {
			'n8n-nodes-base/node-class-description-icon-not-svg': 'off',
			'n8n-nodes-base/cred-class-field-icon-not-svg': 'off',
			'@n8n/community-nodes/icon-validation': 'off',
		},
	},
];
