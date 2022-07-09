import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import Home from "../../pages";

jest.mock("next-auth/react");

describe("Home page", () => {
  it("renders correctly", () => {
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: { name: "John Doe", email: "john.doe@example.com" },
        expires: "fake-expires",
      },
      status: "authenticated",
    });

    render(<Home product={{ priceId: "fake-price-id", amount: "$10,00" }} />);

    expect(screen.getByText("for $10,00 month")).toBeInTheDocument();
  });
});
