import React from 'react';

class BatteryIndicator extends React.Component
{
/*
	Props:
		level      : int - Charging level, between 0 and 100
		charging   : boolean
		robotState : string
*/

	constructor(props)
	{
		super(props);

		this.state = {mainColor:'rgb(89, 89, 89)', secondaryColor:'black'};
	}

	componentWillReceiveProps(nextProps)
	{
		let {level} = nextProps;

		if (level && level !== this.props.level)
		{
			// HSL color with hue value from red (0) to green (120)
			let mainColor = 'hsl(' + (level / 100 * 120) +', 80%, 45%)';
			let secondaryColor = 'none';

			this.setState({mainColor, secondaryColor });
		}
	}

	render()
	{
		return (
			<div id='indicator-container'>
				<svg width='50' height='25' id='battery-indicator'>
			        <path stroke={this.state.mainColor} strokeWidth="1.5" strokeMiterlimit="10" fill={this.state.secondaryColor} d="M 49,16.53 L 49,8.47 46.71,8.47 46.71,3.88 C 46.71,2.29 45.44,1 43.86,1 L 3.86,1 C 2.28,1 1,2.29 1,3.88 L 1,12 1,21.12 C 1,22.71 2.28,24 3.86,24 L 43.86,24 C 45.44,24 46.71,22.71 46.71,21.12 L 46.71,16.53 49,16.53 Z M 49,16.53" />
					<rect id='battery-indicator-level' stroke="none" fill={this.state.mainColor} x="3" y="3" width={this.props.level/100 * 41.5} height="19" rx="1" />
			        <path id='battery-indicator-power' hidden={!this.props.charging} stroke={this.state.mainColor} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="rgb(255, 255, 255)" d="M 8.57,17.82 L 26.44,6.89 25.86,11.84 39.43,6.89 21.56,17.82 22.14,12.87 8.57,17.82 Z M 8.57,17.82" />
				</svg>
				<div>{this.props.robotState}</div>
			</div>
		);
	}
}

export default BatteryIndicator;


