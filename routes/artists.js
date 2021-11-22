const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const {authMiddleware, adminAuthMiddleware} = require('../authMiddleware');

const Artists = require('../models/Artists');
const Songs = require('../models/Songs');
const Albums = require("../models/Albums");

const saveImage = (image) => {
    let imageExt = image.name.split('.');
    imageExt = imageExt[imageExt.length - 1];
    const imageId = uuidv4();
    const imageFilename = `${imageId}.${imageExt}`;
    const imagePath = `/files/headers/${imageFilename}`;
    image.mv(path.join(__dirname, '..', imagePath));
    return imagePath;
}

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
            .select('-tags');
        artist = artist.toJSON();
        artist.popular = popular;
        res.json(artist);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        const artist = await Artists.find();
        res.json(artist);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/', adminAuthMiddleware, async (req, res) => {
    const imagePath = saveImage(req.files.image);
    const artist = new Artists({
        name: req.body.name,
        imageUrl: imagePath,
    })
    try {
        const result = await artist.save();
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.delete('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        let artist = await Artists
            .findById(req.params.id)
            .populate({ path: 'albums', populate: {path: 'songs'}})
        artist.albums.forEach(async (album) => {
            album.songs.forEach(async (song) => {
                await Songs.findByIdAndDelete(song.id);
                fs.unlink(path.join(__dirname, '..', song.url), () => {});
            })
            await Albums.findByIdAndDelete(album.id);
            fs.unlink(path.join(__dirname, '..', album.imageUrl), () => {});
        })
        await Artists.findByIdAndDelete(req.params.id);
        fs.unlink(path.join(__dirname, '..', artist.imageUrl), () => {});
        res.sendStatus(200);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

router.put('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        let artist = await Artists
            .findById(req.params.id);
        const newArtist = {};
        if (req.files && req.files.image) {
            fs.unlink(path.join(__dirname, '..', artist.imageUrl), () => {});
            newArtist.imageUrl = saveImage(req.files.image);
        }
        if (req.body.name) {
            newArtist.name = req.body.name;
        }
        await Artists
            .findByIdAndUpdate(req.params.id, newArtist)
        const artistAfterChange = await Artists.findById(req.params.id);
        res.json(artistAfterChange);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }
})

module.exports = router;