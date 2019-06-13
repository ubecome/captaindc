import React from 'react';
import { Icon } from 'semantic-ui-react';
import '../css/control-panel.css';

class ControlPanelButton extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	render()
	{
		const {size, cornerRadius} = this.props;

		let style = {};

		if(size)
		{
			style.width = size[0] + 'px';
			style.height = size[1] + 'px';
		}

		if(cornerRadius)
		{
			if(typeof cornerRadius === 'number')
			{
				style.borderBottomLeftRadius = cornerRadius + 'px';
				style.borderTopLeftRadius = cornerRadius + 'px';
				style.borderTopRightRadius = cornerRadius + 'px';
				style.borderBottomRightRadius = cornerRadius + 'px';
			}
			else
			{
				if(cornerRadius.top)
				{
					style.borderTopLeftRadius = cornerRadius.top + 'px';
					style.borderTopRightRadius = cornerRadius.top + 'px';
				}

				if(cornerRadius.bottom)
				{
					style.borderBottomLeftRadius = cornerRadius.bottom + 'px';
					style.borderBottomRightRadius = cornerRadius.bottom + 'px';
				}

				if(cornerRadius.left)
				{
					style.borderBottomLeftRadius = cornerRadius.left + 'px';
					style.borderTopLeftRadius = cornerRadius.left + 'px';
				}

				if(cornerRadius.right)
				{
					style.borderBottomRightRadius = cornerRadius.right + 'px';
					style.borderTopRightRadius = cornerRadius.right + 'px';
				}

				if(cornerRadius.topLeft)
				{
					style.borderTopLeftRadius = cornerRadius.topLeft + 'px';
				}

				if(cornerRadius.topRight)
				{
					style.borderTopRightRadius = cornerRadius.topRight + 'px';
				}

				if(cornerRadius.bottomLeft)
				{
					style.borderBottomLeftRadius = cornerRadius.bottomLeft + 'px';
				}

				if(cornerRadius.bottomRight)
				{
					style.borderBottomRightRadius = cornerRadius.bottomRight + 'px';
				}
			}
		}

		let content = [];
		if(this.props.icon)
		{
			content.push(<Icon key='icon' size={this.props.iconSize || 'large'} name={this.props.icon} color={(!this.props.disabled ? 'grey' : (this.props.color || 'grey') )} disabled={this.props.disabled}/>);
		}

		if(this.props.text)
		{
			content.push(<div style={content.length > 0 ? {marginLeft: '5px', opacity: (this.props.disabled ? 0.45 : 1)} : {}} key='text'>{this.props.text}</div>);
		}

		return (
			<div id={this.props.id} className={'control-panel-button' + (this.props.disabled ? ' disabled' : '' + (this.props.active ? ' on' : ''))} onClick={this.props.onClick} style={style} >
				{content}
			</div>
		);
	}
}

export default ControlPanelButton;