const router = require('express').Router();
const path = require('path');

router.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/', 'game.html'))
})

module.exports = router;