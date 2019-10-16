const fs = require('fs');

let router = require('express').Router();

const indexContent = fs.readFileSync('./views/index.html', 'UTF8');

router.get(['/', '/login', '/account', '/admin'], (req, res) =>
{
	res.send(indexContent);
});

module.exports = router;
