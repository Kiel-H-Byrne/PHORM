import { render, screen } from "@testing-library/react";
import Layout from "../Layout";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false, signOut: jest.fn() }),
}));

it("renders the nav, page content and footer", () => {
  render(
    <Layout title="Test Title">
      <div>Rendered!</div>
    </Layout>
  );
  expect(screen.getByText("Rendered!")).toBeInTheDocument();
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("main")).toBeInTheDocument();
  expect(screen.getAllByRole("contentinfo").length).toBeGreaterThan(0);
});
