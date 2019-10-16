const sha = require('password-hash');
const Daemon = require('./Daemon.js');
const log = require('./Logger.js');

const TAG = 'SessionManager';

const SESSION_TIMEOUT = 60 * 60000;
const CHECK_TIME = 1 * 60000;

class SessionManager
{
	constructor()
	{
		this.sessions = {};
		
		new Daemon('SessionManager', 0, CHECK_TIME, this, (self) =>
		{
			const now = new Date().getTime();
			const usersToLogout = [];

			for(let userId in self.sessions)
			{
				const {timestamp, sessionId, user} = self.sessions[userId];

				if(now - timestamp > SESSION_TIMEOUT)
				{
					usersToLogout.push({user, sessionId});
				}
			}

			for(let {user, sessionId} of usersToLogout)
			{
				self.logout(user, sessionId);
			}
		});
		
		this.httpRequestHandler = this.httpRequestHandler.bind(this);
	}
	
	login(user)
	{
		let sessionId = sha.generate(user.login).substr(16).toUpperCase();
		let id = user.id + '.' + sessionId;

		user.token = sha.generate(user.login).substr(16).toUpperCase();
		const session = {timestamp: new Date().getTime(), sessionId, user};

		this.sessions[id] = session;
		
		log(TAG, 'login ' + user.login + ' (SID: ' + sessionId + ')');
		return session;
	}

	retrieve(sessionId)
	{
		if(sessionId !== undefined)
		{
			for(let s in this.sessions)
			{
				if(this.sessions[s].sessionId === sessionId)
				{
					this.sessions[s].timestamp = new Date().getTime();
					return this.sessions[s];
				}
			}
		}
	}

	findUserByToken(token)
	{
		for(let s in this.sessions)
		{
			if(this.sessions[s].user.token === token)
			{
				return this.sessions[s].user;
			}
		}
	}

	logout(user, sessionId)
	{
		delete this.sessions[user.id + '.' + sessionId];
		log(TAG, 'logout ' + user.login + ' (SID: ' + sessionId + ')');
	}
	
	httpRequestHandler(req, res, next)
	{
		req.session = this.retrieve(req.cookies.SID);
		next();
	}
}

module.exports = new SessionManager();
