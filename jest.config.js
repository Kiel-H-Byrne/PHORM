const nextJest = require("next/jest");
require('whatwg-fetch')


const createJestConfig = nextJest({
  dir: "./",
});
const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  globals: {
    fetch,
  },
};
module.exports = createJestConfig(customJestConfig);