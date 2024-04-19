const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const request = require("supertest");

let email = "local@gmail.com";

describe("test POST /api/v1/accounts endpoint", () => {
    test("test account berhasil dibuat -> success", async () => {
        const userId = await prisma.user.findUnique({ where: { email } });
        try {
            let { statusCode, body } = await request(app).post("/api/v1/accounts").send({ id: userId.id, bank: "bca" });

            console.log(body);

            expect(statusCode).toBe(201);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("Created");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("bank_name");
            expect(body.data).toHaveProperty("bank_account_number");
            expect(body.data).toHaveProperty("balance");
            expect(body.data).toHaveProperty("user_id");
            expect(body.data.user_id).toBe(userId.id);
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test request body tidak lengkap -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/accounts").send(null);
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("request body tidak lengkap");
        }
    });

    test("test accounts gagal dibuat karna id tidak tersedia -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/accounts").send({ id: -1, bank: "bca" });
            expect(statusCode).toBe(404);
            expect(body.message).toBe("Not Found");
        } catch (err) {
            expect(err).toBe("id tidak tersedia");
        }
    });
});

describe("test GET /api/v1/accounts/:id endpoint", () => {
    test("test cek api detail accounts -> success", async () => {
        const userId = await prisma.user.findUnique({ where: { email } });
        const bankAccount = await prisma.bank_Account.findFirst({ where: { user_id: userId.id } });
        try {
            let { statusCode, body } = await request(app).get(`/api/v1/accounts/${bankAccount.id}`);

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("bank_name");
            expect(body.data).toHaveProperty("bank_account_number");
            expect(body.data).toHaveProperty("balance");
            expect(body.data).toHaveProperty("user_id");
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test accounts tidak tersedia -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/accounts/-1");
            expect(statusCode).toBe(404);
            expect(body.message).toBe("Not Found");
        } catch (err) {
            expect(err).toBe("accounts tidak tersedia");
        }
    });

    test("test parameter accounts invalid -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/accounts/abc");
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("accounts invalid");
        }
    });
});

describe("test GET /api/v1/accounts endpoint", () => {
    test("test cek api accounts -> success", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/accounts");

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data[0]).toHaveProperty("id");
            expect(body.data[0]).toHaveProperty("bank_name");
            expect(body.data[0]).toHaveProperty("bank_account_number");
            expect(body.data[0]).toHaveProperty("balance");
            expect(body.data[0]).toHaveProperty("user_id");
        } catch (err) {
            expect(err).toBe("error");
        }
    });
});