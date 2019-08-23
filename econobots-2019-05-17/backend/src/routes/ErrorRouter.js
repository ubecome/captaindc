let router = require('express').Router();

router.use((req, res) =>
{
	res.status(404).send('404');
});

router.use((error, req, res) =>
{
	res.status(500).send('500');
});

module.exports = router;