const sha = require('password-hash');

class PasswordManager
{
	constructor()
	{
		this.encryptParams =
		{
			algorithm: 'SHA256',
			saltLength: 32,
			iterations: 8
		};
	}
	
	hash(plainTextPassword)
	{
		return sha.generate(plainTextPassword, this.encryptParams);
	}
	
	check(plainTextPassword, hashedPassword)
	{
		return sha.verify(plainTextPassword, hashedPassword);
	}
}

module.exports = new PasswordManager();
