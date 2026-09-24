import { defineConfig } from 'orval';

export default defineConfig({
	client: {
		input: 'http://localhost:4000/openapi.yaml',
		output: {
			target: './src/api/generated/endpoints.ts',
			schemas: './src/api/generated/types',
		},
	},
});
