import { describe, expect, it } from "vitest";

const RAILWAY_API_URL = "https://backboard.railway.com/graphql/v2";

describe("Railway API Token Validation", () => {
  it("should authenticate with the Railway API token and list projects", async () => {
    const token = process.env.RAILWAY_API_TOKEN;
    expect(token).toBeTruthy();

    const response = await fetch(RAILWAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{ projects { edges { node { id name } } } }`,
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.errors).toBeUndefined();
    expect(data.data?.projects?.edges).toBeDefined();
    console.log(
      "Railway API token valid. Projects:",
      data.data.projects.edges.map((e: any) => e.node.name)
    );
  });
});
