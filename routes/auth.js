const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../models/Users');

router.post('/signup', async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10);
    
    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password
    })

    try {
        const result = await user.save();
        delete result.password;

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.SECRET);
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
        console.log(error);
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(200).json({
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
                const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.SECRET);
                res.cookie('TOKEN', token);

                return res.status(201).json({
                    name: user.name,
                    role: user.role,
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
