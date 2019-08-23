const PasswordManager = require('../core/PasswordManager.js');
const SessionManager = require('../core/SessionManager.js');
const DatabaseManager = require('../core/DatabaseManager.js');
const RestResponse = require('./RestResponse.js');

const SUCCESS = new RestResponse(true);
const FAIL = new RestResponse(false);
const SID = 'SID';

let router = require('express').Router();

function setCookie(res, key, value)
{
	res.clearCookie(key);
	if(value)
	{
		res.cookie(key, value);
	}
}

router.post('/api/auth/login', (req, res) =>
{
	if(req.session)
	{
		res.send(SUCCESS);
		return;
	}

	if(!req.body.login || !req.body.password)
	{
		res.send(FAIL);
		return;
	}

	const query = {login: req.body.login};

	DatabaseManager.find('user', {query}, (err, results) =>
	{
		if(results.length === 0)
		{
			res.send(FAIL);
			return;
		}

		const user = results[0];

		if(!PasswordManager.check(req.body.password, user.password))
		{
			res.send(FAIL);
			return;
		}

		const {sessionId} = SessionManager.login(user);

		setCookie(res, SID, sessionId);
		res.send(SUCCESS);
	});
});

router.post('/api/auth/logout', (req, res) =>
{
	let session = SessionManager.retrieve(req.cookies.SID);
	if(session)
	{
		SessionManager.logout(session.user, req.cookies.SID);
		setCookie(res, SID);
	}

	res.send(SUCCESS);
});

module.exports = router;
