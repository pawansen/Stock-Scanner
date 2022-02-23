const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const apiResponse = require("../helpers/apiResponse");
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                return apiResponse.unauthorizedResponse(res,err);
            }
            req.userSession = user;
            next();
        });
    } else {
        return apiResponse.unauthorizedResponse(res,"Authorization required.");
    }
};
module.exports = authenticateJWT;