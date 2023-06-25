const nextJest = require("next/jest");
require('whatwg-fetch')


const createJestConfig = nextJest({
  dir: "./",
});
const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  globals: {
    fetch,
  },
};
module.exports = createJestConfig(customJestConfig);