import FirebaseAuthUI from "@/components/FirebaseAuthUI";
import * as fbAuth from "@/util/firebaseUI";
import { appAuth } from "@/db/firebase";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";

// Mock the next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock the Firebase auth functions
jest.mock("@/util/firebaseUI", () => ({
  startFirebaseUILogin: jest.fn(),
}));

jest.mock("@/util/authFetch", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ ok: true })),
}));
jest.mock("@/util/authCookies", () => ({
  setAuthCookie: jest.fn(),
  safeReturnUrl: () => "/dashboard",
}));

const mockToast = jest.fn();
jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useToast: () => mockToast,
}));

// Mock the appAuth from db/firebase
jest.mock("@/db/firebase", () => ({
  appAuth: {
    onAuthStateChanged: jest.fn((callback) => {
      // Return a function to unsubscribe
      return jest.fn();
    }),
  },
}));

describe("FirebaseAuthUI", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it("renders the component with default props", () => {
    render(<FirebaseAuthUI />);

    // Check that the title and subtitle are rendered
    expect(screen.getByText("Sign in to PHORM")).toBeInTheDocument();
    expect(
      screen.getByText("Choose your preferred sign-in method")
    ).toBeInTheDocument();

    // Check that the FirebaseUI container is rendered
    expect(
      document.getElementById("firebaseui-auth-container")
    ).toBeInTheDocument();

    // Check that startFirebaseUILogin was called
    expect(fbAuth.startFirebaseUILogin).toHaveBeenCalledWith(
      "firebaseui-auth-container"
    );
  });

  it("renders with custom title and subtitle", () => {
    const customTitle = "Custom Title";
    const customSubtitle = "Custom Subtitle";

    render(<FirebaseAuthUI title={customTitle} subtitle={customSubtitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
  });

  it("toasts and redirects only once per sign-in, even across re-renders", async () => {
    let authCallback: (user: unknown) => Promise<void> = async () => {};
    (appAuth!.onAuthStateChanged as jest.Mock).mockImplementation((cb) => {
      authCallback = cb;
      return jest.fn();
    });
    const replace = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      // A new router object on every render, like Next.js during navigation.
      replace,
      query: {},
    }));

    const { rerender } = render(<FirebaseAuthUI />);
    const user = { uid: "u1", displayName: "Test", providerData: [] };
    await act(() => authCallback(user));
    rerender(<FirebaseAuthUI />);
    await act(() => authCallback(user));

    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith("/dashboard");
    expect(appAuth!.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(
      mockToast.mock.calls.filter(([t]) => t.id === "sign-in-success")
    ).toHaveLength(1);
  });
});
