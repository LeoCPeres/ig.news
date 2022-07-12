import { render, screen } from "@testing-library/react";
import { getSession, useSession } from "next-auth/react";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";
import { useRouter } from "next/router";

const post = {
  slug: "my-new-post",
  title: "my new post",
  content: "<p>Post excerpt</p>",
  updatedAt: "03-10-2022",
};

jest.mock("../../services/prismic");
jest.mock("next-auth/react");
jest.mock("next/router");

describe("Post preview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false] as any);

    render(<Post post={post} />);

    expect(screen.getByText("my new post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects user to full post when user is subscripted", async () => {
    const useSessionMocked = jest.mocked(useSession);
    const useRouterMocked = jest.mocked(useRouter);
    const pushMock = jest.fn();

    useRouterMocked.mockReturnValueOnce({ push: pushMock } as any);

    useSessionMocked.mockReturnValueOnce({
      data: { activeSubscription: "fake-active-subscription", expires: null },
      status: "authenticated",
    } as any);

    render(<Post post={post} />);

    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
  });

  it("loads initial data", async () => {
    const getSessionMocked = jest.mocked(getSession);
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        uid: "my-new-post",
        data: {
          title: [{ type: "heading", text: "my new post" }],
          content: [
            {
              type: "paragraph",
              text: "Post excerpt",
            },
          ],
        },
        last_publication_date: "03-10-2022",
      }),
    } as any);

    const response = await getStaticProps({ params: { slug: "my-new-post" } });

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "my new post",
            content: "<p>Post excerpt</p>",
            updatedAt: "10 de março de 2022",
          },
        },
      })
    );

    screen.debug();
  });
});
