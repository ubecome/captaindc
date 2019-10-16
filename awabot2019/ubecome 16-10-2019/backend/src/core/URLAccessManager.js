class URLAccessManager
{
	constructor()
	{		
		this.rules = [];

		this.rules.push({pattern: '^/admin', methods: ['GET'], auth: true, profiles: ['profile.admin']});
		
		this.rules.push({pattern: '^/api/auth/login', methods: ['POST'], auth: false});
		this.rules.push({pattern: '^/api/auth/logout', methods: ['POST'], auth: false});

		this.rules.push({pattern: '^/api/user/self', methods: ['GET'], auth: false});
		this.rules.push({pattern: '^/api/user/self', methods: ['PUT'], auth: true, profiles: ['profile.admin', 'profile.pilot', 'profile.spectator']});

		this.rules.push({pattern: '^/api/robot/*', methods: ['GET'], auth: true, profiles: ['profile.admin', 'profile.pilot', 'profile.spectator']});
		this.rules.push({pattern: '^/api/robot/*', methods: ['POST'], auth: true, profiles: ['profile.admin', 'profile.pilot']});

		this.rules.push({pattern: '^/api/user', methods: ['GET', 'POST', 'PUT', 'DELETE'], auth: true, profiles: ['profile.admin']});

		this.httpRequestHandler = this.httpRequestHandler.bind(this);
	}
	
	httpRequestHandler(req, res, next)
	{
		const access = this.check(req);

		if(access.auth)
		{
			if(!req.session)
			{
				res.status(401).send('401');
				return;
			}
			else if(!access.granted)
			{
				res.status(403).send('403');
				return;
			}
		}

		next();
	}
	
	check(req)
	{
		const access = {auth: false, granted: true};
		
		for(let rule of this.rules)
		{
			if(req.url.match(rule.pattern))
			{
				if(!rule.auth)
				{
					return access;
				}
				else
				{
					access.auth = true;
					access.granted = false;

					if(req.session)
					{
						for(let profile of rule.profiles)
						{
							if(req.session.user.profile === profile)
							{
								for(let method of rule.methods)
								{
									if(req.method === method)
									{
										access.granted = true;
										return access;
									}
								}
							}
						}
					}
				}
			}
		}

		return access;
	}
}

module.exports = new URLAccessManager();
