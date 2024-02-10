/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  root: true,

  env: {
    es6: true,
    browser: false,
  },

  plugins: ['import'],

  extends: [
    //
    'airbnb',
    'prettier',
    'plugin:prettier/recommended',
  ],

  rules: {
    'no-plusplus': 'off',
    'no-continue': 'off',
    'no-console': 'off',
    'no-param-reassign': 'error',
    'no-await-in-loop': 'off',
    'prefer-promise-reject-errors': 'off',
    'prefer-destructuring': 'off',
    'no-nested-ternary': 'off',
    'no-unused-expressions': 'error',
    quotes: ['error', 'single', {allowTemplateLiterals: false, avoidEscape: true}],

    'import/no-default-export': 'off',
    'import/prefer-default-export': 'off',
  },
};
