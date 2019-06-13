import enLocale from '../i18n/en.js';

const i18n =
{
	en: enLocale,

	get(key, variables)
	{
		let locale = this.getLocale();
		let label = this[locale][key];

		if(label)
		{
			for(let k in variables)
			{
				label = label.replace('{{' + k + '}}', variables[k]);
			}
		}
		else
		{
			label = '??' + key + '_' + locale + '??';
		}

		return label;
	},

	getLocale()
	{
		return 'en';
	}
};

export default i18n;
