const express = require("express");
const router = express.Router();

const authMiddleware = require('../authMiddleware');

const Artists = require('../modules/Artists');
const Albums = require('../modules/Albums');
const Songs = require('../modules/Songs');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const artist = await Artists.find();
        res.json(artist);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/', authMiddleware, async (req, res) => {
    const artist = new Artists({
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags
    })
    try {
        const result = await artist.save();
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        let artist = await Artists
            .findById(req.params.id)
            .populate('albums', 'name imageUrl year', null, { sort: {'year': -1} })
            .select('-tags');
        const popular = await Songs
            .find({ artist: req.params.id })
            .sort({ listens: -1 })
            .limit(5)
            .populate('album', 'name imageUrl')
            .populate('artist', 'name')
            .select('-tags -favorite');
        artist = artist.toJSON();
        artist.popular = popular;
        res.json(artist);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

module.exports = router;