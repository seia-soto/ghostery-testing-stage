import webExtension from '@samrum/vite-plugin-web-extension';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {manifest} from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(() => ({
	plugins: [
		react(),
		webExtension({
			manifest,
		}),
	],
}));
