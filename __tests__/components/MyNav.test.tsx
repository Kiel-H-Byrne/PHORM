import MyNav from "@/components/MyNav";
import { useAuth } from "@/contexts/AuthContext";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/AddListingDrawer", () => ({
  __esModule: true,
  default: () => <div data-testid="add-listing-drawer" />,
}));

jest.mock("@/components/MyAvatar", () => ({
  __esModule: true,
  default: () => <div data-testid="my-avatar" />,
}));

describe("MyNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
  });

  it('renders "Map View" link when on the homepage', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/",
      query: {},
      push: jest.fn(),
    });

    render(<MyNav />);

    const mapLinks = screen.getAllByRole("link", { name: /map view/i });
    expect(mapLinks.length).toBeGreaterThan(0);
    expect(mapLinks[0]).toHaveAttribute("href", "/map");
    expect(screen.queryByRole("link", { name: /list view/i })).not.toBeInTheDocument();
  });

  it('renders "List View" link when on the map page', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/map",
      query: {},
      push: jest.fn(),
    });

    render(<MyNav />);

    const listLinks = screen.getAllByRole("link", { name: /list view/i });
    expect(listLinks.length).toBeGreaterThan(0);
    expect(listLinks[0]).toHaveAttribute("href", "/list");
    expect(screen.queryByRole("link", { name: /map view/i })).not.toBeInTheDocument();
  });

  it('renders "Map View" link when on the list page', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/list",
      query: {},
      push: jest.fn(),
    });

    render(<MyNav />);

    const mapLinks = screen.getAllByRole("link", { name: /map view/i });
    expect(mapLinks.length).toBeGreaterThan(0);
    expect(mapLinks[0]).toHaveAttribute("href", "/map");
    expect(screen.queryByRole("link", { name: /list view/i })).not.toBeInTheDocument();
  });

  it('renders "List View" link in mobile dropdown when on the map page', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/map",
      query: {},
      push: jest.fn(),
    });

    render(<MyNav />);

    // Open mobile menu
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    act(() => {
      fireEvent.click(menuButton);
    });

    // Both desktop and mobile links exist
    const listLinks = screen.getAllByRole("link", { name: /list view/i });
    expect(listLinks.length).toBe(2);
    expect(listLinks[0]).toHaveAttribute("href", "/list");
    expect(listLinks[1]).toHaveAttribute("href", "/list");
  });
});
