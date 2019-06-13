const mongodb = require('mongodb');
const PasswordManager = require('../src/core/PasswordManager.js');
const DatabaseManager = require('../src/core/DatabaseManager.js');
const {name, admin} = require('../config.js').database;

mongodb.MongoClient.connect('mongodb://localhost', (err, connection) =>
{
	if(err === null)
	{
		const db = connection.db(name);

		db.dropDatabase((err, results) =>
		{
			if(err === null)
			{
				console.log('Dropping existing database : DONE.');

				db.collection('user').createIndex({login: 1}, {unique: true}, (err, results) =>
				{
					if(err === null)
					{
						console.log('Creating user.login index : DONE.');

						DatabaseManager.connect(() =>
						{
							admin.password = PasswordManager.hash(admin.password);

							DatabaseManager.insert('user', admin, () =>
							{
								if(err === null)
								{
									console.log('Adding admin account : DONE.');
								}
								else
								{
									console.log(err);
								}

								DatabaseManager.close();
								connection.close();
							});
						});
					}
					else
					{
						console.log(err);
						connection.close();
					}
				});
			}
			else
			{
				console.log(err);
				connection.close();
			}
		});
	}
	else
	{
		console.log(err);
	}
});
