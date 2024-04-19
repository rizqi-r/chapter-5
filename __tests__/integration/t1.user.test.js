const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const request = require("supertest");

let name = "local";
let email = "local@gmail.com";
let address = "jln. lokal";
let password = "lokal";

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

describe("test POST /api/v1/users endpoint", () => {
    test("test email belum terdaftar -> success", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/users").send({ name, email, address, password });

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
            let { statusCode, body } = await request(app).post("/api/v1/users").send(null);
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("request body tidak lengkap");
        }
    });

    test("test email sudah terdaftar -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/users").send({ name, email, address, password });
            expect(statusCode).toBe(403);
            expect(body.message).toBe("Forbidden");
        } catch (err) {
            expect(err).toBe("email sudah dipakai");
        }
    });
});

describe("test GET /api/v1/users/:id endpoint", () => {
    test("test cek api detail users -> success", async () => {
        try {
            const userId = await prisma.user.findUnique({ where: { email } });
            let { statusCode, body } = await request(app).get(`/api/v1/users/${userId.id}`);

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

    test("test users tidak tersedia -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/users/-1");
            expect(statusCode).toBe(404);
            expect(body.message).toBe("Not Found");
        } catch (err) {
            expect(err).toBe("users tidak tersedia");
        }
    });

    test("test parameter users invalid -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/users/abc");
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("users invalid");
        }
    });
});

describe("test GET /api/v1/users endpoint", () => {
    test("test cek api users -> success", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/users");

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data[0]).toHaveProperty("id");
            expect(body.data[0]).toHaveProperty("name");
            expect(body.data[0]).toHaveProperty("email");
        } catch (err) {
            expect(err).toBe("error");
        }
    });
});
