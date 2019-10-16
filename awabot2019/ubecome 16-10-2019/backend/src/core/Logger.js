module.exports = function(tag, log)
{
	console.log(new Date() + ' [' + tag + '] ' + log);

	if(log !== undefined)
	{
		delete arguments[2];
	}

	if(tag !== undefined)
	{
		delete arguments[0];
	}

	for(let prop in arguments)
	{
		console.log(arguments[prop]);
	}
};
