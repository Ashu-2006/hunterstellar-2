const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { signToken, signExpiredToken, signInvalidToken } = require("./helpers/tokens");

jest.mock("../db/supabaseClient", () => require("./helpers/mockSupabase").createMockSupabase());
jest.mock("../utils/email", () => ({ sendWelcomeEmail: jest.fn() }));

const mockSupabase = require("../db/supabaseClient");

describe("Auth middleware", () => {
  beforeEach(() => {
    mockSupabase.__testing.reset();
  });

  test("invalid JWT rejected", async () => {
    const res = await request(app)
      .get("/api/team/state")
      .set("Authorization", `Bearer ${signInvalidToken()}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired session");
  });

  test("expired JWT rejected", async () => {
    const res = await request(app)
      .get("/api/team/state")
      .set("Authorization", `Bearer ${signExpiredToken("team-a")}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired session");
  });

  test("valid JWT passes auth", async () => {
    const team = {
      id: "team-a",
      team_name: "Team Alpha",
      team_leader: "Alice",
      members: ["Alice", "Bob"],
      password: "$2a$10$hashed",
      route: [{ island_id: "i1", question_id: "q1" }, { island_id: "i2", question_id: null }],
      email: "a@test.com",
      progress: 0,
      stage: "awaiting_code",
      status: "active",
      wrong_attempts: 0,
      lock_until: null,
      notice: null,
      last_correct_at: null,
    };
    mockSupabase.__testing.setTable("teams", [team]);
    mockSupabase.__testing.setTable("islands", [{ id: "i1", correct_code: "CODE1", clue_statement: "Clue 1", is_common_room: false }]);
    mockSupabase.__testing.setTable("questions", [{ id: "q1", question_statement: "Q1", question_answer: "ANS1", domain: "test" }]);
    mockSupabase.__testing.setTable("announcements", []);

    const res = await request(app)
      .get("/api/team/state")
      .set("Authorization", `Bearer ${signToken("team-a")}`);
    expect(res.status).toBe(200);
    expect(res.body.team.team_name).toBe("Team Alpha");
  });
});