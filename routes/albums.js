const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const Artists = require('../models/Artists');
const Albums = require('../models/Albums');
const Songs = require('../models/Songs');

const {authMiddleware, adminAuthMiddleware} = require('../authMiddleware');

const saveImage = (image) => {
    let imageExt = image.name.split('.');
    imageExt = imageExt[imageExt.length - 1];
    const imageId = uuidv4();
    const imageFilename = `${imageId}.${imageExt}`;
    const imagePath = `/files/covers/${imageFilename}`;
    image.mv(path.join(__dirname, '..', imagePath));
    return imagePath;
}

router.get('/:id', authMiddleware, async (req, res) => {
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

router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        const albums = await Albums.find();
        res.json(albums);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/', adminAuthMiddleware, async (req, res) => {
    const imagePath = saveImage(req.files.image);
    const album = new Albums({
        name: req.body.name,
        artist: req.body.artist,
        imageUrl: imagePath,
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


router.delete('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        let album = await Albums
            .findById(req.params.id)
            .populate({ path: 'songs'});
        album.songs.forEach(async (song) => {
            await Songs.findByIdAndDelete(song.id);
            fs.unlink(path.join(__dirname, '..', song.url), () => {});
        })
        await Albums.findByIdAndDelete(req.params.id);
        await Artists.updateOne( {_id: album.artist}, { $pullAll: {albums: [req.params.id] } } )
        fs.unlink(path.join(__dirname, '..', album.imageUrl), () => {});
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error });
    }
})

router.put('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        let album = await Albums
            .findById(req.params.id);
        const newAlbum = {};
        if (req.files && req.files.image) {
            fs.unlink(path.join(__dirname, '..', album.imageUrl), () => {});
            newAlbum.imageUrl = saveImage(req.files.image);
        }
        if (req.body.name) {
            newAlbum.name = req.body.name;
        }
        if (req.body.year) {
            newAlbum.year = req.body.year;
        }
        await Albums
            .findByIdAndUpdate(req.params.id, newAlbum)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }
})

module.exports = router;