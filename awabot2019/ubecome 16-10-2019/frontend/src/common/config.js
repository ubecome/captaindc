const config =
{
	videoSettings:
	{
		qualityConfigs: [
			{name: 'video-settings.high', videoResolution: '800x450', videoCompression: 10},
			{name: 'video-settings.medium', videoResolution: '640x360', videoCompression: 20},
			{name: 'video-settings.low', videoResolution: '320x180', videoCompression: 40},
		],
		thumbNail: {
			videoResolution: '240x135',
			videoCompression: 40,
		},
		defaults: {
			videoSourceIndex: 4, // Starts at 1
			qualityIndex: 1 // Start at 0, cf. qualityConfigs
		}
	},
	mapSettings:
	{
		iconSize: {
			width: 40,
			height: 30
		},
		defaults: {
			minScaleFactor: 1,
			maxScaleFactor: 5,
			shouldFollowTarget: true
		}
	}
};

module.exports = config;
