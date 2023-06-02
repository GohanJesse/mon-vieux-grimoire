const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = (req, res, next) => {
    const tokenSecret = process.env.TOKEN_SECRET;
    try {
        console.log('on est dans auth')
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, tokenSecret);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        res.status(401).json({ error });
    };
};