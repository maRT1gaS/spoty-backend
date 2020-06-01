const express = require("express");
const router = express.Router();

const authMiddleware = require('../authMiddleware');

const Songs = require('../modules/Songs');

const RECOMMENDATION_SIZE = 10;

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
            let predicate = 0;
            let i = 0;
            let random = Math.random();
            while (random > tags[tagsArray[i]] / count + predicate) {
                predicate += tags[tagsArray[i]] / count;
                i += 1;
            }
            const tag = tagsArray[i];
            let songs = await Songs.aggregate([
                {$match: { tags: { $in: [tag] } }},
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
            let additional;
            if (songs.length < RECOMMENDATION_SIZE) {
                additional = await Songs.aggregate([
                    {$sample: { size: RECOMMENDATION_SIZE }},
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
            res.json(songs);
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
            res.json(songs);
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error })
    }
})

module.exports = router;