import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	root: '.',
	base: process.env.GITHUB_ACTIONS ? '/pixels/' : './',
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: 'dist',
		emptyOutDir: false,
		sourcemap: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
