module.exports = {
  env: {
    // 支持浏览器环境
    browser: true,
    // 识别 CommonJS
    node: true,
    // 识别 ES 的代码，使用 ECMAScript 2021 自动设置 ecmaVersion parser 为 12，
    es2021: true,
  },
  extends: [
    'airbnb-base', // airbnb 的规则
    'plugin:prettier/recommended', // Prettier 的规则
  ],

  overrides: [
    // 针对 .ts 文件，覆盖通用配置
    {
      files: ['**/*.{ts, tsx}'], // 只处理 ts 和 tsx 文件
      // 配置 TypeScript 解析器，使 ESLint 可以看懂 TS 代码
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'], // 告诉 eslint：tsconfig 在哪
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-typescript/base', // airbnb 的 typescript 规则
        'plugin:prettier/recommended',
      ],
    },
    // 针对 .vue 文件，覆盖通用配置
    {
      files: ['**/*.vue'],
      parser: 'vue-eslint-parser', // vue 解析器
      parserOptions: {
        parser: '@typescript-eslint/parser', // 防止与 vue-eslint-parser 插件冲突
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.vue'],
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:vue/vue3-recommended', // 使用 vue3 的推荐规则
        'plugin:prettier/recommended',
      ],
    },
  ],

  rules: {
    'no-param-reassign': ['error', { props: false }],
  },
}
