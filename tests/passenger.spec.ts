import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Passenger } from "../src/models/passenger.js";

const firstPassenger = {
  fullName: "Paco",
  documentId: "2234453X",
  nationality: "Español",
  certificationLevel: "planetary",
  medicalStatus: "unfit",
  complementedFlights: 2,
  email: "alu0101556369@ull.edu.es"
}

beforeEach(async () => {
  await Passenger.deleteMany();
  await new Passenger(firstPassenger).save();
});


describe("POST /passengers", () => {
  test("Should successfully create a new passenger", async () => {
    await request(app)
      .post("/passengers")
      .send({
        fullName: "Pedro",
        documentId: "2234454X",
        nationality: "Italiano",
        certificationLevel: "planetary",
        medicalStatus: "unfit",
        complementedFlights: 2,
        email: "alu0101556269@ull.edu.es"
      }).expect(201);
  });

  test("Should get an error", async () => {
    await request(app).post("/passengers").send(firstPassenger).expect(501);
  });
});

describe("GET /passengers", () => {
  test("Should get a passengers by fullName", async () => {
    await request(app).get("/passengers?fullName=Paco").expect(200);
  });

  test("Should not find a passenger by fullName", async () => {
    await request(app).get("/passengers?fullName=AA").expect(404);
  });
});

describe("DELETE /passengers", () => {
  test("Should delete a passengers by documentId", async () => {
    const response = await request(app).delete("/passengers?documentId=2234453X").expect(200);

    expect(response.body).to.include({
      fullName: "Paco",
      documentId: "2234453X",
      nationality: "Español",
      certificationLevel: "planetary",
      medicalStatus: "unfit",
      complementedFlights: 2,
      email: "alu0101556369@ull.edu.es"
    });
  });
});
