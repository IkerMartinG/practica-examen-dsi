import { describe, test, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { SpaceCraft } from "../src/models/spacecraft.js";

const firstSpaceCraft = {
  name: "AX",
  registration: "321F",
  craftModel: "Xwin",
  capacity: 4,
  avaibleSeats: 3,
  status: "available",
  certificationLevel: "orbital"
};

beforeEach(async () => {
  await SpaceCraft.deleteMany();
  await new SpaceCraft(firstSpaceCraft).save();
});


describe("POST /spacecraft", () => {
  test("Should successfully create a new spacecraft", async () => {
    await request(app)
      .post("/spacecraft")
      .send({
        name: "BX",
        registration: "421F",
        craftModel: "Ywin",
        capacity: 3,
        avaibleSeats: 1,
        status: "available",
        certificationLevel: "orbital"
      }).expect(201);
  });

  test("Should get an error", async () => {
    await request(app).post("/spacecraft").send(firstSpaceCraft).expect(501);
  });
});

describe("GET /spacecraft", () => {
  test("Should get a spacecraft by name", async () => {
    await request(app).get("/spacecraft?name=AX").expect(200);
  });

  test("Should not find a spacecraft by name", async () => {
    await request(app).get("/spacecraft?name=AA").expect(404);
  });
});