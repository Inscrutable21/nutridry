module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn'
  },
  overrides: [
    {
      // Disable specific rules for the ExcelProductUploader component
      files: ['src/components/admin/ExcelProductUploader.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off'
      }
    }
  ]
}