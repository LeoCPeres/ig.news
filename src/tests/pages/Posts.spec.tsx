import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { getPrismicClient } from "../../services/prismic";
import Posts, { getStaticProps } from "../../pages/posts";

const posts = [
  {
    slug: "my-new-post",
    title: "my new post",
    excerpt: "Post excerpt",
    updatedAt: "03-10-2022",
  },
];

jest.mock("../../services/prismic");

describe("Posts page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("my new post")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
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
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-new-post",
              title: "my new post",
              excerpt: "Post excerpt",
              updatedAt: "10 de março de 2022",
            },
          ],
        },
      })
    );
  });
});
