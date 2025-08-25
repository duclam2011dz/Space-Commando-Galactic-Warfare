import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Phaser: "readonly",
        io: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,

      // Giữ những rule quan trọng
      "no-const-assign": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-redeclare": "error",
      "no-debugger": "error",
      "eqeqeq": ["error", "always"],
      "semi": ["error", "always"],
      "quotes": ["warn", "double"],

      // Nới lỏng mấy rule gây phiền
      "curly": "off",             // cho phép if/else một dòng
      "prefer-const": "off",      // không bắt buộc đổi let thành const
      "prefer-template": "off",   // cho phép nối chuỗi bằng +
      "arrow-body-style": "off",  // không bắt ép arrow function rút gọn
      "no-console": "off",        // cho phép dùng console.log thoải mái
    },
  },
];