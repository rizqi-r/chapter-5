const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const request = require("supertest");

let name = "localauth";
let email = "localauth@gmail.com";
let address = "jln. local";
let password = "local";

beforeAll(async () => {
    const userId = await prisma.user.findUnique({ where: { email } });
    const userAccount = await prisma.bank_Account.findMany({ where: { user_id: userId.id } });
    if (userId) {
        await prisma.transaction.deleteMany({
            where: {
                OR: [
                    { source_account_id: { in: userAccount.map((account) => account.id) } },
                    { destination_account_id: { in: userAccount.map((account) => account.id) } }
                ]
            }
        });
        await prisma.profile.deleteMany({ where: { user_id: userId.id } });
        await prisma.bank_Account.deleteMany({ where: { user_id: userId.id } });
        await prisma.user.deleteMany({ where: { id: userId.id } });
    } else {
        return;
    }
});

describe("test POST /api/v1/register endpoint", () => {
    test("test email belum terdaftar -> success", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/register").send({ name, email, address, password });

            console.log(body);

            expect(statusCode).toBe(201);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("Created");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("name");
            expect(body.data).toHaveProperty("email");
            expect(body.data.name).toBe(name);
            expect(body.data.email).toBe(email);
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test request body tidak lengkap -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/register").send(null);
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("request body tidak lengkap");
        }
    });

    test("test email sudah terdaftar -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/register").send({ name, email, address, password });
            expect(statusCode).toBe(403);
            expect(body.message).toBe("Email has already been used");
        } catch (err) {
            expect(err).toBe("email sudah dipakai");
        }
    });
});

describe("test POST /api/v1/login endpoint", () => {
    test("test cek api detail users -> success", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/login").send({ email, password });

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("name");
            expect(body.data).toHaveProperty("email");
            expect(body.data).toHaveProperty("token");
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test request body tidak lengkap -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/login").send(null);
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("users tidak tersedia");
        }
    });

    test("test invalid email atau password -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/login").send({ email, password: "abc" });
            expect(statusCode).toBe(400);
            expect(body.message).toBe("invalid email or password!");
        } catch (err) {
            expect(err).toBe("invalid email or password!");
        }
    });
});

describe("test GET /api/v1/whoami endpoint", () => {
    test("test validasi token -> success", async () => {
        try {
            const token = (await request(app).post("/api/v1/login").send({ email, password })).body.data.token;
            let { statusCode, body } = await request(app).get("/api/v1/whoami").auth(token, { type: "bearer" });

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("name");
            expect(body.data).toHaveProperty("email");
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test token tidak valid -> error", async () => {
        try {
            const token = (await request(app).post("/api/v1/login").send({ email, password: "abc" })).body.data?.token;
            let { statusCode, body } = await request(app).get("/api/v1/whoami").auth(token, { type: "bearer" });

            expect(statusCode).toBe(401);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body.message).toBe("jwt malformed");
        } catch (err) {
            expect(err).toBe("token tidak valid");
        }
    });
});
