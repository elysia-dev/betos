module.exports = {
  parser: "@typescript-eslint/parser", // ESLint 파서를 지정한다.
  extends: [
    "plugin:prettier/recommended",
    "plugin:react/recommended", // @eslint-plugin-react 의 규칙을 사용한다.
    "plugin:@typescript-eslint/recommended", // @typescript-eslint/eslint-plugin 의 규칙을 사용한다.
  ],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // jsx의 파싱을 허용한다.
    },
    sourceType: "module", // import의 사용을 허용한다.
  },
  rules: {
    "react/react-in-jsx-scope": 0,
    "@typescript-eslint/no-empty-function": 0,
    "react/prop-types": 0,
  },
}
