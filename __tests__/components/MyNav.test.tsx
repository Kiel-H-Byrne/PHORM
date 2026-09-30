import MyNav from "@/components/MyNav";
import { useAuth } from "@/contexts/AuthContext";
import { act, fireEvent, render, screen, within } from "@testing-library/react";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/AddListingDrawer", () => ({
  __esModule: true,
  default: () => <div data-testid="add-listing-drawer" />,
}));

const hrefOf = (name: RegExp) =>
  screen.getAllByRole("link", { name })[0].getAttribute("href");

describe("MyNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
  });

  it("shows the public navigation links", () => {
    render(<MyNav />);
    expect(hrefOf(/^home$/i)).toBe("/");
    expect(hrefOf(/^browse$/i)).toBe("/list");
    expect(hrefOf(/^map$/i)).toBe("/map");
    expect(hrefOf(/^deals$/i)).toBe("/coupons");
    expect(hrefOf(/^about$/i)).toBe("/about");
  });

  it("hides the member directory and shows Sign in when signed out", () => {
    render(<MyNav />);
    expect(
      screen.queryByRole("link", { name: /member directory/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("shows the member directory when signed in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "u1", displayName: "Test User" },
      loading: false,
    });
    render(<MyNav />);
    expect(hrefOf(/member directory/i)).toBe("/member-directory");
    expect(
      screen.queryByRole("link", { name: /sign in/i })
    ).not.toBeInTheDocument();
  });

  it("opens the mobile menu with the same links", () => {
    render(<MyNav />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    });
    const navs = screen.getAllByRole("navigation");
    expect(navs.length).toBe(2);
    expect(
      within(navs[1]).getByRole("link", { name: /^browse$/i })
    ).toHaveAttribute("href", "/list");
  });
});
