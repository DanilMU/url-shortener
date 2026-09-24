import { defineConfig } from 'orval';

export default defineConfig({
	client: {
		input: '../backend/src/docs/openapi.yaml',
		output: {
			target: './src/api/generated/endpoints.ts',
			schemas: './src/api/generated/types',
		},
	},
});
