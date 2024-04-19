const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const request = require("supertest");

let email = "local@gmail.com";

describe("test POST /api/v1/transactions endpoint", () => {
    test("test transaksi berhasil -> success", async () => {
        const userId = await prisma.user.findUnique({ where: { email } });
        const sourceAccount = await prisma.bank_Account.findFirst({ where: { user_id: userId.id } });
        try {
            let { statusCode, body } = await request(app).post("/api/v1/transactions").send({ source: sourceAccount.id, destination: 2, amount: 10000 });

            console.log(body);

            expect(statusCode).toBe(201);
            expect(body.message).toBe("Created");
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test request body tidak lengkap -> error", async () => {
        try {
            let { statusCode, body } = await request(app).post("/api/v1/transactions").send(null);
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("request body tidak lengkap");
        }
    });

    test("test transactions gagal dibuat karna id tidak ditemukan -> error", async () => {
        try {
            const userId = await prisma.user.findUnique({ where: { email } });
            const sourceAccount = await prisma.bank_Account.findFirst({ where: { user_id: userId.id } });
            let { statusCode, body } = await request(app).post("/api/v1/transactions").send({ source: sourceAccount.id, destination: -1, amount: 10000 });

            console.info(body);

            expect(statusCode).toBe(404);
            expect(body.message).toBe("Not Found");
        } catch (err) {
            expect(err).toBe("id tidak tersedia");
        }
    });
});

describe("test GET /api/v1/transactions/:id endpoint", () => {
    test("test cek api detail transactions -> success", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/transactions/1");

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("source_account_id");
            expect(body.data).toHaveProperty("destination_account_id");
            expect(body.data).toHaveProperty("amount");
            expect(body.data).toHaveProperty("destination_account_transaction");
            expect(body.data).toHaveProperty("source_account_transaction");
        } catch (err) {
            expect(err).toBe("error");
        }
    });

    test("test detail transactions tidak tersedia -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/transactions/-1");
            expect(statusCode).toBe(404);
            expect(body.message).toBe("Not Found");
        } catch (err) {
            expect(err).toBe("transactions tidak tersedia");
        }
    });

    test("test parameter transactions invalid -> error", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/transactions/abc");
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Bad Request");
        } catch (err) {
            expect(err).toBe("transaction invalid");
        }
    });
});

describe("test GET /api/v1/transactions endpoint", () => {
    test("test cek api transactions -> success", async () => {
        try {
            let { statusCode, body } = await request(app).get("/api/v1/transactions");

            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.message).toBe("OK");
            expect(body.data[0]).toHaveProperty("id");
            expect(body.data[0]).toHaveProperty("source_account_id");
            expect(body.data[0]).toHaveProperty("destination_account_id");
            expect(body.data[0]).toHaveProperty("amount");
        } catch (err) {
            expect(err).toBe("error");
        }
    });
});