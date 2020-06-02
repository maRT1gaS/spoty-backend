const express = require("express");
const router = express.Router();

const Artists = require('../models/Artists');
const Albums = require('../models/Albums');

router.get('/',async (req, res) => {
    try {
        const albums = await Albums.find();
        res.json(albums);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/', async (req, res) => {
    const album = new Albums({
        name: req.body.name,
        artist: req.body.artist,
        imageUrl: req.body.imageUrl,
        year: req.body.year
    })
    try {
        const createdAlbum = await album.save();
        const push = await Artists.findByIdAndUpdate({ _id: req.body.artist }, { $push: { albums: createdAlbum._id } });
        res.json(createdAlbum);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const artist = await Albums
            .findById(req.params.id)
            .populate('artist', 'name imageUrl')
            .populate({
                path: 'songs',
                populate: [
                    {
                        path: 'artist',
                        model: 'artists',
                        select: 'name imageUrl'
                    },
                    {
                        path: 'album',
                        model: 'albums',
                        select: 'name imageUrl'
                    }
                ],
                select: 'name url artist album duration'
            })
        res.json(artist);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports = router;