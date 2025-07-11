import tailwindcss from '@tailwindcss/postcss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	css: {
		postcss: { plugins: [tailwindcss()] }
	},
	plugins: [sveltekit()]
});
