import security from "eslint-plugin-security";

export default [
  { ignores: ["node_modules/**", ".tools/**", ".sites-runtime/**", "dist/**"] },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      // Indexes use fixed field names, plan names, or allowlisted MIME extensions.
      "security/detect-object-injection": "off",
      // File reads are reviewed manually and covered by traversal/symlink tests.
      "security/detect-non-literal-fs-filename": "off",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
    },
  },
];
