const mongodb = require('mongodb');
const config = require('../../config.js');

let connection;
let dababase;

let prepareQuery = (query) =>
{
	if(query && query._id)
	{
		query._id = mongodb.ObjectId(query._id);
	}
};

let removeBlankFields = (obj) =>
{
	for(let prop in obj)
	{
		if(obj[prop] === null || obj[prop] === undefined)
		{
			delete obj[prop];
		}
	}
};

class DatabaseManager
{
	connect(cb)
	{
		mongodb.MongoClient.connect('mongodb://localhost', (err, conn) =>
		{
			if(err === null)
			{
				connection = conn;
				dababase = connection.db(config.database.name);

				if(cb)
				{
					cb();
				}
			}
			else
			{
				console.log(err);
			}
		});
	}

	insert(collection, documents, cb)
	{
		let docArray = Array.isArray(documents) ? documents : [documents];

		for(let doc of docArray)
		{
			removeBlankFields(doc);
		}

		dababase.collection(collection).insertMany(docArray, (err, results) =>
		{
			if(cb)
			{
				cb(err, results);
			}
		});
	}

	update(collection, query, update, cb)
	{
		prepareQuery(query);

		dababase.collection(collection).updateOne(query, update, (err, results) =>
		{
			if(cb)
			{
				cb(err, results);
			}
		});
	}

	find(collection, params, cb)
	{
		if(cb)
		{
			prepareQuery(params.query);

			dababase.collection(collection).find(params.query, params.options).toArray((err, results) =>
			{
				cb(err, results);
			});
		}
	}

	delete(collection, query, cb)
	{
		prepareQuery(query);

		dababase.collection(collection).deleteOne(query, (err, results) =>
		{
			if(cb)
			{
				cb(err, results);
			}
		});
	}

	close()
	{
		connection.close();
	}
}

module.exports = new DatabaseManager();
