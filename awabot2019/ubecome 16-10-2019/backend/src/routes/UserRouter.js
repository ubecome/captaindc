const PasswordManager = require('../core/PasswordManager.js');
const DatabaseManager = require('../core/DatabaseManager.js');
const RestResponse = require('./RestResponse.js');

const isValidProfile = (profile) =>
{
	for(let name of ['admin', 'pilot', 'spectator'])
	{
		if(profile === 'profile.' + name)
		{
			return true;
		}
	}
};

const updateUser = (query, update, res) =>
{
	DatabaseManager.update('user', query, {$set: update}, (err, results) =>
	{
		if(!err)
		{
			res.send(new RestResponse(true));
		}
		else
		{
			console.log(err, results);
			res.send(new RestResponse(false).set('error', 'error.database'));
		}
	});
};

let router = require('express').Router();

router.get('/api/user/self', (req, res) =>
{
	if(req.session)
	{
		const {login, token} = req.session.user;
		const query = {login};
		const projection = {_id: 0, password: 0};

		DatabaseManager.find('user', {query, options: {projection}}, (err, results) =>
		{
			if(!err)
			{
				results[0].token = token;
				res.send(new RestResponse(true).set('user', results[0]));
			}
			else
			{
				res.send(new RestResponse(false));
			}
		});
	}
	else
	{
		res.send(new RestResponse(true));
	}
});

router.put('/api/user/self', (req, res) =>
{
	const query = {login: req.session.user.login};
	const update = {};

	let {password, name} = req.body;

	if(password)
	{
		update.password = PasswordManager.hash(password);
	}

	if(name)
	{
		update.name = name;
	}

	updateUser(query, update, res);
});

router.get('/api/user', (req, res) =>
{
	const projection = {_id: 0, password: 0};
	const sort = {login: 1};

	DatabaseManager.find('user', {options: {projection, sort}}, (err, results) =>
	{
		if(!err)
		{
			res.send(new RestResponse(true).set('users', results));
		}
		else
		{
			res.send(new RestResponse(false).set('error', 'error.database'));
		}
	});
});

router.post('/api/user', (req, res) =>
{
	let {login, password, name, profile} = req.body;

	if(login && password && name && profile)
	{
		if(isValidProfile(profile))
		{
			password = PasswordManager.hash(password);
			DatabaseManager.insert('user', {login, password, name, profile}, (err) =>
			{
				if(!err)
				{
					res.send(new RestResponse(true));
				}
				else
				{
					res.send(new RestResponse(false).set('error', 'error.database'));
				}
			});
		}
		else
		{
			res.send(new RestResponse(false).set('error', 'error.invalid-field'));
		}
	}
	else
	{
		res.send(new RestResponse(false).set('error', 'error.missing-fields'));
	}
});

router.put('/api/user', (req, res) =>
{
	let {login, name, profile} = req.body;

	if(login)
	{
		const query = {login};
		const update = {};

		if(name)
		{
			update.name = name;
		}

		if(profile)
		{
			if(!isValidProfile(profile))
			{
				res.send(new RestResponse(false).set('error', 'error.invalid-field'));
				return;
			}

			update.profile = profile;
		}

		updateUser(query, update, res);
	}
	else
	{
		res.send(new RestResponse(false).set('error', 'error.missing-fields'));
	}
});

router.delete('/api/user', (req, res) =>
{
	let {login} = req.body;

	if(login)
	{
		DatabaseManager.delete('user', {login}, (err, results) =>
		{
			if(!err)
			{
				res.send(new RestResponse(true));
			}
			else
			{
				console.log(err, results);
				res.send(new RestResponse(false).set('error', 'error.database'));
			}
		});
	}
	else
	{
		res.send(new RestResponse(false).set('error', 'error.missing-fields'));
	}
});

module.exports = router;
