const Users = require('./models/Users');
const jwt = require('jsonwebtoken');
const js = require('fs');
const path = require('path');

module.exports = {
    authMiddleware: async (req, res, next) => {
        const token = req.cookies.TOKEN;
        if (token) {
            jwt.verify(
                token,
                process.env.SECRET,
                async (error, payload) => {
                    if (error) {
                        res.status(401).send();
                    } else {
                        const user = await Users.findById(payload.id);
                        if (user) {
                            req.user = user;
                            next();
                        } else {
                            res.status(401).send();
                        }
                    }
    
                }
            )
        } else {
            res.status(401).send();
        }
    },
    adminAuthMiddleware: async (req, res, next) => {
        const token = req.cookies.TOKEN;
        if (token) {
            jwt.verify(
                token,
                process.env.SECRET,
                async (error, payload) => {
                    if (error) {
                        res.status(401).send();
                    } else {
                        const user = await Users.findById(payload.id);
                        if (user && user.role === 'admin') {
                            req.user = user;
                            next();
                        } else {
                            res.status(401).send();
                        }
                    }
    
                }
            )
        } else {
            res.status(401).send();
        }
    }
};