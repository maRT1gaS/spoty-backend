const fs = require('fs');
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { getAudioDurationInSeconds } = require('get-audio-duration');

const Albums = require('../models/Albums');
const Songs = require('../models/Songs');

const {authMiddleware, adminAuthMiddleware} = require('../authMiddleware');

const saveSong = async (song) => {
    let songExt = song.name.split('.');
    songExt = songExt[songExt.length - 1];
    const songId = uuidv4();
    const songFilename = `${songId}.${songExt}`;
    const songPath = `/files/songs/${songFilename}`;
    await song.mv(path.join(__dirname, '..', songPath));
    return songPath;
}

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const song = await (await Songs.findById(req.params.id).populate([{ path: 'artist', select: '-albums' }, {path: 'album', select: '-songs -artist'}]));
        res.json(song);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.get('/', adminAuthMiddleware, async (req, res) => {
    try {
        const songs = await Songs.find();
        res.json(songs);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})



router.post('/', adminAuthMiddleware, async (req, res) => {
    const songPath = await saveSong(req.files.song);
    const duration = Math.round(await getAudioDurationInSeconds(path.join(__dirname, '..', songPath)));

    const song = new Songs({
        name: req.body.name,
        url: songPath,
        artist: req.body.artist,
        album: req.body.album,
        tags: req.body.tags.split(',').map(tag => tag.trim()),
        duration: duration
    })
    try {
        const createdSong = await song.save();
        const pushToAlbum = await Albums.findByIdAndUpdate({ _id: req.body.album }, { $push: { songs: createdSong._id } });
        res.json(createdSong);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error })
    }
})

router.delete('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        let song = await Songs.findById(req.params.id);
        await Songs.findByIdAndDelete(req.params.id);
        fs.unlink(path.join(__dirname, '..', song.url), () => {});
        await Albums.updateOne( {_id: song.album}, { $pullAll: {songs: [req.params.id] } } )
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error });
    }
})

router.put('/:id', adminAuthMiddleware, async (req, res) => {
    try {
        let song = await Songs
            .findById(req.params.id);
        const newSong = {};
        if (req.files && req.files.song) {
            fs.unlink(path.join(__dirname, '..', song.url), () => {});
            newSong.url = await saveSong(req.files.song);
            newSong.duration = Math.round(await getAudioDurationInSeconds(path.join(__dirname, '..', newSong.url)));
        }
        if (req.body.name) {
            newSong.name = req.body.name;
        }
        if (req.body.tags) {
            newSong.tags = req.body.tags.split(',').map(tag => tag.trim());
        }
        await Songs
            .findByIdAndUpdate(req.params.id, newSong)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }
})

module.exports = router;