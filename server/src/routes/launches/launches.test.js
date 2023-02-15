import supertest from "supertest";
import app from "../../app";
import { mongoConnect, mongoDisconnect } from "../../services/mongo";

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      await supertest(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701",
      target: "Kepler-1652 b",
      launchDate: "January 4, 2028",
    };

    const launcDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701",
      target: "Kepler-1652 b",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701",
      target: "Kepler-1652 b",
      launchDate: "woo-hoo",
    };

    test("It should respond with 201 success", async () => {
      const response = await supertest(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(launcDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await supertest(app)
        .post("/v1/launches")
        .send(launcDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({ error: "Required fields missing" });
    });

    test("It should catch invalid dates", async () => {
      const response = await supertest(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect("Content-Type", /json/);
    });
  });
});
