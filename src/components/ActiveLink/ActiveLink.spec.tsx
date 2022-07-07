import { render } from "@testing-library/react";
import { ActiveLink } from ".";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      asPath: "/",
    }),
  };
});

describe("ActiveLink component", () => {
  test("active link renders correctly", () => {
    const { debug, getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(getByText("Home")).toBeInTheDocument();
    debug();
  });

  test("active link is receiving active class", () => {
    const { debug, getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    );

    expect(getByText("Home")).toHaveClass("active");
    debug();
  });
});
