const express = require("express");
const router = express.Router();

const {authMiddleware} = require('../authMiddleware');

const Artists = require('../models/Artists');
const Albums = require('../models/Albums');
const Songs = require('../models/Songs');

router.get('/', authMiddleware, async (req, res) => {
    const query = req.query.query;
    try {
        let artists = await Artists
            .find({ name: new RegExp('(?:^|\\s)' + query, 'i') })
            .limit(5)
            .select('name imageUrl')

        let albums = await Albums
            .find({ name: new RegExp('(?:^|\\s)' + query, 'i') })
            .limit(5)
            .select('name imageUrl')

        let songs = await Songs
            .find({ name: new RegExp('(?:^|\\s)' + query, 'i') })
            .limit(5)
            .populate([
                {
                    path: 'artist',
                    model: 'artists',
                    select: 'name'
                },
                {
                    path: 'album',
                    model: 'albums',
                    select: 'name imageUrl'
                }
            ])
            .select('name url artist album duration')

        res.json({artists, albums, songs});
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports = router;