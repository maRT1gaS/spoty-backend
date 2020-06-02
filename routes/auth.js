const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcryptjs');

const authMiddleware = require('../authMiddleware');

const Users = require('../modeles/Users');

router.post('/signup', async (req, res) => {
    const token = uuidv4();
    const password = await bcrypt.hash(req.body.password, 10);
    
    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password,
        token
    })

    try {
        const result = await user.save();
        delete result.password;
        delete result.token;
        res.cookie('TOKEN', token);
        res.status(201).json({
            error: false,
            data: {
                name: result.name,
                email: result.email,
                id: result.id
            }
        });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            res.status(200).json({
                error: true,
                data: {
                    email: 'Email already exist.'
                }
            });
        }
        res.status(400).json({ message: error });
    }
})

router.post('/signin', async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.body.email });
        if (user) {
            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            if (isValidPassword) {
                res.cookie('TOKEN', user.token)
                return res.status(201).json({
                    name: user.name,
                    email: user.email,
                    id: user.id
                })
            }
        }
        return res.status(200).json({ error: true, message: 'Wrong email and/or password.' });
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

module.exports = router;
