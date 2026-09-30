// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

// Analytics must never send events from tests (and @vercel/analytics ships ESM).
jest.mock("@/util/analytics", () => ({
  trackEvent: jest.fn(),
  initAnalytics: jest.fn(),
}));

// Default router for components rendered outside Next (tests can override with
// their own jest.mock("next/router", ...)).
jest.mock("next/router", () => {
  const router = {
    pathname: "/",
    asPath: "/",
    query: {},
    isReady: true,
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  };
  return { __esModule: true, useRouter: () => router, default: router };
});

// jsdom lacks matchMedia (used by Chakra's responsive hooks).
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
