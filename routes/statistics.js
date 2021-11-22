const express = require('express');
const router = express.Router();

const { adminAuthMiddleware } = require('../authMiddleware');

const Users = require('../models/Users');
const Artists = require('../models/Artists');
const Songs = require('../models/Songs');

router.get('/topcharts', adminAuthMiddleware, async (req, res) => {
  try {
    const topTenSongs = await Songs.find().sort({ listens: -1 }).limit(10).select('-tags -favorite -url').populate('artist', 'name').populate('album', 'name')
    res.json(topTenSongs)
  } catch (error) {
    res.status(400).json({ message: error })
  }
})

router.get('/allstatistics', adminAuthMiddleware, async (req, res) => {
  try {
    const statistics = {};
    const allUsers = await Users.find();
    statistics.users = allUsers.length;
    const allSongs = await Songs.find();
    statistics.songs = allSongs.length;
    const allArtists = await Artists.find();
    statistics.artists = allArtists.length;
    res.json(statistics)
  } catch (error) {
    res.status(400).json({ message: error })
  }
})

module.exports = router;