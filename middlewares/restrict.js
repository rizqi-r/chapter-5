const jwt = require("jsonwebtoken");

const restrict = async (req, res, next) => {
    const { authorization } = req.headers;
    console.log("token:", authorization);

    if (!authorization || !authorization.split(" ")[1]) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized"
        });
    }

    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: 401,
                message: err.message
            });
        }
        delete user.iat;
        req.user = user;

        console.log(user);
        next();
    });
};

module.exports = {
    restrict
};