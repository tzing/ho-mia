export default [
    {
        files: ['scripts/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
            },
        },
    },
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
];

