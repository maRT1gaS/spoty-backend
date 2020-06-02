const express = require("express");
const { shuffle } = require("lodash")
const router = express.Router();

const authMiddleware = require('../authMiddleware');

const Songs = require('../modeles/Songs');

const RECOMMENDATION_SIZE = 10;

const getSongsByTag = async (songTags) => {
    const songs = [];
    const songIds = [];
    
    try {
        let i = 0;
        while (i < songTags.length) {
            const song = await Songs.aggregate([
                {$match: { tags: { $in: [songTags[i]]}, _id: { $nin: songIds } }},
                {$sample: { size: 1 }},
                {$project: {
                    tags: 0,
                    favorite: 0
                }}
            ]);
            if (song.length) {
                songs.push(song[0]);
                songIds.push(song[0]._id);
                i += 1;
            } else {
                break;
            }
        }
        return { songs, songIds };
    } catch (error) {
        return new Error(error);
    }
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { tags } = req.user;
        const tagsArray = []
        let count = 0; 
        Object.keys(tags).forEach((tag) => {
            tagsArray.push(tag);
            count += tags[tag];
        });
        if (count) {
            let songTags = [];
            while (songTags.length < RECOMMENDATION_SIZE) {
                let predicate = 0;
                let i = 0;
                let random = Math.random();
                while (random > tags[tagsArray[i]] / count + predicate) {
                    predicate += tags[tagsArray[i]] / count;
                    i += 1;
                }
                songTags.push(tagsArray[i]);
            }

            let { songs, songIds } = await getSongsByTag(songTags);

            songs = await Songs.populate(songs, [
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
            ]);
            songs.forEach((song) => {
                song.id = song._id;
                delete song._id;
                delete song.__v;
            })

            let additional;
            if (songs.length < RECOMMENDATION_SIZE) {
                additional = await Songs.aggregate([
                    {$match: { _id: { $nin: songIds } } },
                    {$sample: { size: RECOMMENDATION_SIZE - songs.length }},
                    {$project: {
                        tags: 0,
                        favorite: 0
                    }}
                ]);
                additional = await Songs.populate(additional, [
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
                ]);
                additional.forEach((song) => {
                    song.id = song._id;
                    delete song._id;
                    delete song.__v;
                })
                songs = [...songs, ...additional];
            }
            res.json(shuffle(songs));
        } else {
            let songs = await Songs.aggregate([
                {$sample: { size: RECOMMENDATION_SIZE }},
                {$project: {
                    tags: 0,
                    favorite: 0
                }}
            ]);
            songs = await Songs.populate(songs, [
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
            ]);
            songs.forEach((song) => {
                song.id = song._id;
                delete song._id;
                delete song.__v;
            })
            res.json(shuffle(songs));
        }
        
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports = router;