const express = require("express");
const router = express.Router();

const authMiddleware = require('../authMiddleware');

const Songs = require('../modules/Songs');
const Users = require('../modules/Users');

const getLibrary = async (id) => {
    const library = await Users.findById(id)
        .populate({
            path: 'library',
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
        .select('library');
    return library;
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const library = await getLibrary(req.user._id);
        res.json(library);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await (await Users.findById(req.user._id).select('tags library')).toJSON();
        const library = [...user.library].map((val) => val.toString());
        if (library.includes(req.body.id)) {
            const newLibrary = await getLibrary(req.user._id);
            res.json(newLibrary);
        }
        const song = await (await Songs.findById(req.body.id).select('tags')).toJSON();
        const tags = user.tags || {};
        song.tags.forEach((tag) => {
            if (tags[tag]) {
                tags[tag] += 1;
            } else {
                tags[tag] = 1;
            }
        })
        const result = await Users
        .findOneAndUpdate(
            { _id: req.user._id },
            { 
                $set: { tags },
                $push: { library: { $each: [req.body.id], $position: 0 } }
            });
        const newLibrary = await getLibrary(req.user._id);
        res.json(newLibrary);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

router.delete('/', authMiddleware, async (req, res) => {
    try {
        const user = await (await Users.findById(req.user._id).select('tags library')).toJSON();
        const library = [...user.library].map((val) => val.toString());
        if (!library.includes(req.body.id)) {
            const newLibrary = await getLibrary(req.user._id);
            res.json(newLibrary);
        }
        const song = await (await Songs.findById(req.body.id).select('tags')).toJSON();
        const tags = user.tags || {};
        song.tags.forEach((tag) => {
            if (tags[tag] > 1) {
                tags[tag] -= 1;
            } else if (tags[tag] === 1) {
                delete tags[tag];
            }
        })
        const result = await Users.findOneAndUpdate({ _id: req.user._id }, { $set: { tags }, $pull: { library: req.body.id } });
        const newLibrary = await getLibrary(req.user._id);
        res.json(newLibrary);
    } catch (error) {
        res.status(400).json({ message: error })
    }
})

module.exports = router;