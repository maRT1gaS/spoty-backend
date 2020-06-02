const express = require("express");
const router = express.Router();

const Songs = require('../modeles/Songs');

router.get('/:dir/:filename', async (req, res) => {
    const {dir, filename} = req.params;
    let [id, ext] = filename.split('.');
    const file = `${__dirname}/../files/${dir}/${filename}`;
    res.download(file);
    if (ext === 'mp3') {
        await Songs.findByIdAndUpdate(id, { $inc: { listens: 1 } });
    }
});

module.exports = router;