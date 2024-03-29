import { render } from "@testing-library/react";
import AppMap, { default_props } from "../AppMap";

default_props;
const props = {
  client_location: default_props.center,
  setMapInstance: () => void 0,
  mapInstance: null,
};
describe("AppMap Tests", () => {
  xit("renders without errors", () => {
    render(<AppMap {...props} />);
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<AppMap {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
