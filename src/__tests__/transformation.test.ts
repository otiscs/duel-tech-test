import { transformUser } from "~/services/transformation-service";

import type { InputUser } from "~/types";

const commonMockUserFields = {
  user_id: "123",
  name: "Test",
  email: "test@example.com",
  instagram_handle: "@handle",
  tiktok_handle: "@handle",
  joined_at: "2022-01-01T00:00:00Z",
  advocacy_programs: [],
};

const mockUsers = {
  invalidEmail: {
    ...commonMockUserFields,
    email: "invalid-email",
    instagram_handle: "@handle",
    tiktok_handle: "@handle",
    joined_at: "not-a-date",
  },
  missingUserID: {
    ...commonMockUserFields,
    user_id: null,
  },
  naNLikes: {
    ...commonMockUserFields,
    advocacy_programs: [
      {
        program_id: "456",
        brand: "Brand",
        tasks_completed: [
          {
            task_id: "789",
            platform: "TikTok",
            post_url: "http://example.com",
            likes: "NaN",
            comments: 1,
            shares: 2,
            reach: 3,
          },
        ],
        total_sales_attributed: 100,
      },
    ],
  },
  validUser: {
    user_id: "b5bae331-8a36-4f4d-a587-eba2e73f1785",
    name: "Test",
    email: "test@example.com",
    instagram_handle: "@handle",
    tiktok_handle: "@handle",
    joined_at: "2024-10-28T04:16:22.896Z",
    advocacy_programs: [
      {
        program_id: "b5bae331-8a36-4f4d-a587-eba2e73f1785",
        brand: "Brand",
        tasks_completed: [
          {
            task_id: "b5bae331-8a36-4f4d-a587-eba2e73f1785",
            platform: "tiktok", //lowercase as etl:pipeline normalises fields to lowercase
            post_url: "http://example.com",
            likes: 10,
            comments: 1,
            shares: 2,
            reach: 3,
          },
        ],
        total_sales_attributed: 100,
      },
    ],
  },
};

describe("Data Transformation", () => {
  it("should handle invalid emails and return null", () => {
    const result = transformUser(mockUsers.invalidEmail);
    expect(result && "email" in result ? result.email : null).toBeNull();
  });

  it("should generate UUID for missing user_id", () => {
    const result = transformUser(mockUsers.missingUserID);
    expect(result && "user_id" in result ? result.user_id : null).toMatch(
      /[0-9a-fA-F-]{36}/
    );
  });

  it("should clean NaN likes to null", () => {
    const result = transformUser(mockUsers.naNLikes as InputUser);
    expect(
      result &&
        "advocacy_programs" in result &&
        result.advocacy_programs &&
        result.advocacy_programs[0] &&
        result.advocacy_programs[0].tasks_completed[0]
        ? result.advocacy_programs[0].tasks_completed[0].likes
        : null
    ).toBeNull();
  });
  it("should transform valid user data correctly", () => {
    const result = transformUser(mockUsers.validUser);
    expect(result).toEqual(mockUsers.validUser);
  });
});
