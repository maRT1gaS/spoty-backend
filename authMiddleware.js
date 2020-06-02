const Users = require('./modeles/Users');

module.exports = async (req, res, next) => {
    const token = req.cookies.TOKEN;
    console.log('Request with token', token);
    if (token) {
        try {
            const user = await Users.findOne({ token });
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).send();
            }
        } catch (error) {
            res.status(400).send({ message: error });
        }
    } else {
        res.status(401).send();
    }
};