const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAccount = async (req, res, next) => {
    try {
        const accounts = await prisma.bank_Account.findMany();
        return res.status(200).json({
            status: 200,
            message: "OK",
            data: accounts
        });
    } catch (error) {
        next(error);
    }
};

const getSpecificAccount = async (req, res, next) => {
    try {
        const params = Number(req.params.id);

        if (!params) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request"
            });
        }

        const accounts = await prisma.bank_Account.findUnique({
            where: {
                id: params
            }
        });

        if (accounts) {
            return res.status(200).json({
                status: 200,
                message: "OK",
                data: accounts
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "Not Found"
            });
        }
    } catch (error) {
        next(error);
    }
};

const createAccount = async (req, res, next) => {
    const body = req.body;
    try {
        if (!body.id || !body.bank) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request"
            });
        }

        const exist = await prisma.user.findUnique({ where: { id: body.id } });

        if (exist) {
            const newAccount = await prisma.bank_Account.create({
                data: {
                    user_id: Number(body.id),
                    balance: 100000,
                    bank_name: body.bank,
                    bank_account_number: Math.floor(
                        40000000 + Math.random() * 49000000
                    )
                }
            });

            return res.status(201).json({
                status: 201,
                message: "Created",
                data: newAccount
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "Not Found"
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAccount,
    getSpecificAccount,
    createAccount
};
