const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getTransaction = async (req, res, next) => {
    try {
        const users = await prisma.transaction.findMany();
        return res.status(200).json({
            status: 200,
            message: "OK",
            data: users
        });
    } catch (error) {
        next(error);
    }
};

const getSpecificTransaction = async (req, res, next) => {
    try {
        const params = Number(req.params.id);

        if (!params) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request"
            });
        }

        const users = await prisma.transaction.findUnique({
            where: {
                id: params
            },
            include: {
                destination_account_transaction: true,
                source_account_transaction: true
            }
        });

        if (users) {
            return res.status(200).json({
                status: 200,
                message: "OK",
                data: users
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

const createTransaction = async (req, res, next) => {
    const body = req.body;
    try {
        if (!body.source || !body.destination || !body.amount) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request"
            });
        }

        if (body.source == body.destination) {
            return res.status(400).json({
                status: 400,
                message: "ID pengirim dan ID penerima tidak boleh sama"
            });
        }

        const sourceAccount = await prisma.bank_Account.findUnique({
            where: {
                id: Number(body.source)
            }
        });

        const destinationAccount = await prisma.bank_Account.findUnique({
            where: {
                id: Number(body.destination)
            }
        });

        if (destinationAccount && sourceAccount) {
            if (body.amount <= 0) {
                return res.status(400).json({
                    status: 400,
                    message: "Jumlah harus diatas 0"
                });
            }

            if (sourceAccount.balance - Number(body.amount) < 0) {
                return res.status(400).json({
                    status: 400,
                    message: "Saldo Tidak Cukup"
                });
            }

            await prisma.transaction.create({
                data: {
                    amount: Number(body.amount),
                    source_account_id: Number(body.source),
                    destination_account_id: Number(body.destination)
                }
            }).then(async () => {
                await prisma.bank_Account.update({
                    data: {
                        balance: sourceAccount.balance - Number(body.amount)
                    },
                    where: {
                        id: Number(body.source)
                    }
                }).then(async () => {
                    await prisma.bank_Account.update({
                        data: {
                            balance: destinationAccount.balance + Number(body.amount)
                        },
                        where: {
                            id: Number(body.destination)
                        }
                    });
                });
            });

            const newTransaction = await prisma.bank_Account.findUnique({ where: { id: Number(body.source) }, select: { balance: true } });

            return res.status(201).json({
                status: 201,
                message: "Created",
                data: newTransaction.balance
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
    getTransaction,
    getSpecificTransaction,
    createTransaction
};
