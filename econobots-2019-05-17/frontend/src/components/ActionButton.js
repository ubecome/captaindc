import React from 'react';
import {Icon} from 'semantic-ui-react';

class ActionButton extends React.Component
{
	/*
		props
			needsResult : boolean - Configures waiting state
			classicIcon : string  - SemanticUI icon name,
			customIcon  : string  - Custom svg icon name (only 'multishot' available so far)

		state
			actionState : (IDLE | BUSY | SUCCEEDED | FAILED)
	*/

	static IDLE = 0;
	static BUSY = 1;
	static SUCCEEDED = 2;
	static FAILED = 3;

	static colorForState(actionState)
	{
		switch (actionState)
		{
			case ActionButton.IDLE: return 'grey';
			case ActionButton.BUSY: return 'grey';
			case ActionButton.SUCCEEDED: return 'green';
			case ActionButton.FAILED: return 'red';
			default: return 'grey';
		}
	}

	constructor(props)
	{
		super(props);

		this.state = { actionState: ActionButton.IDLE };

		this.performAction = this.performAction.bind(this);
		this.handleResult = this.handleResult.bind(this);
	}



	customIconWithName(name)
	{
		let content;

		if (this.state.actionState === ActionButton.BUSY)
		{
			content = <Icon name='spinner' color={ActionButton.colorForState(this.state.actionState)} loading={true} size='large' />
		}
		else
		{
			if (name === 'multishot')
			{
				content = (
					<svg width="28.3" height="21">
						<path stroke="none" fill={ActionButton.colorForState(this.state.actionState)} d="M 11.76,8.69 L 9.25,8.69 7.82,10.76 6.36,8.69 3.77,8.69 6.49,12.46 3.52,16.64 6.06,16.64 7.78,14.13 9.51,16.64 12.1,16.64 9.05,12.41 11.76,8.69 Z M 17.08,8.61 L 17.08,12.35 14.14,12.35 17.04,8.61 17.08,8.61 17.08,8.61 Z M 19.24,5.87 L 17.21,5.87 12.35,12.15 12.35,14.15 17.08,14.15 17.08,16.64 19.24,16.64 19.24,14.15 20.73,14.15 20.73,12.35 19.24,12.35 19.24,5.87 Z M 17.8,3.56 C 17.83,3.73 17.84,3.9 17.84,4.08 L 21.3,4.08 C 23.07,4.08 24.5,5.45 24.5,7.15 L 24.5,17.92 C 24.5,19.62 23.07,21 21.3,21 L 3.2,21 C 1.43,21 0,19.62 0,17.92 L 0,7.15 C 0,5.45 1.43,4.08 3.2,4.08 L 6.66,4.08 C 6.66,3.31 6.95,2.61 7.43,2.07 8.02,1.41 8.89,1 9.85,1 L 14.65,1 C 16.23,1 17.54,2.11 17.8,3.56 Z M 17.8,3.56" />
					</svg>
				);
			}
		}

		return (
			<div className={this.props.className} onClick={this.performAction}>
				{content}
			</div>
		);
	}

	performAction()
	{
		if (this.state.actionState === ActionButton.IDLE && this.props.action)
		{
			if (this.props.needsResult)
			{
				this.setState({actionState: ActionButton.BUSY});
				this.props.action(this.handleResult);
			}
			else
			{
				this.props.action();
			}
		}
	}

	handleResult(result)
	{
		const actionResult = (result === true ? ActionButton.SUCCEEDED : ActionButton.FAILED);
		this.setState({actionState: actionResult});

		setTimeout(() => {this.setState({actionState: ActionButton.IDLE})}, 2000);
	}

	render()
	{
		if (this.props.classicIcon)
		{
			return (
				<div className={this.props.className} onClick={this.performAction}>
					<Icon name={(this.state.actionState === 1 ? 'spinner' : this.props.classicIcon)} style={{color: ActionButton.colorForState(this.state.actionState)}} loading={this.state.actionState === 1} size='large' />
				</div>
			);
		}
		else
		{
			return (this.customIconWithName(this.props.customIcon));
		}
	}
}

export default ActionButton;