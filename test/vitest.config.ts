import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        root: './',
        typecheck: {
            enabled: true,
        },
    },
});
