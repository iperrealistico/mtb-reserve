import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        include: ['test/unit/**/*.test.ts', 'test/unit/**/*.test.tsx', 'test/integration/**/*.test.ts'],
    },
});
