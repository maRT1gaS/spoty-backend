const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Artists = require('../modules/Artists');
const Albums = require('../modules/Albums');
const Songs = require('../modules/Songs');

router.get('/',async (req, res) => {
    try {
        const songs = await Songs.find();
        res.json(songs);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/', async (req, res) => {
    const song = new Songs({
        name: req.body.name,
        url: req.body.url,
        artist: req.body.artist,
        album: req.body.album,
        tags: req.body.tags,
        duration: req.body.duration
    })
    try {
        const createdSong = await song.save();
        const pushToAlbum = await Albums.findByIdAndUpdate({ _id: req.body.album }, { $push: { songs: createdSong._id } });
        res.json(createdSong);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const artist = await (await Albums.findById(req.params.id).populate('artist', 'name imageUrl')).populate('songs');
        res.json(artist);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports = router;