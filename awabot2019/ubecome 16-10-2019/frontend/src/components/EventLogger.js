import React from 'react';
import '../css/event-logger.css';
import i18n from '../i18n/i18n';
import ajax from "../common/ajax";
//import { array } from 'prop-types';

class EventLogger extends React.Component
{
	/*
		state params are :
		logs - array of maximum 5 event strings
	*/

	constructor()
	{
		super();

		this.state = {
			logs: []
		};
		this.handelLoger = this.handelLoger.bind(this);
		setTimeout(this.handelLoger(), 200);
		
	}

	handelLoger()
	{
		//this.setState({logs:this.props.data})
		//this._addLog();

		
		ajax('GET', 'robot/log', null, ( logs ) =>
		{
			
		 let content=[];
		if( logs && logs.logs && logs.logs.length >=5){
		for (let i=0; i<5; i++){
				let obj={
					date:logs.logs[i].date,
					state: logs.logs[i].path,
					ip: logs.logs[i].source_ip
				}
			 	content.push(obj);
		}
	    }	else
		{
			content.push(<div key='empty-log'>{i18n.get('event-log.empty')}</div>);
		}
		this.setState({logs:  content} );
		setTimeout(this.handelLoger, 2000);
 	})

}


	
	/*testLog()
	{
		this._addLog('14/02/18 14:03:49', 'Longue phrase de test pour vérifier l\'affichage dans les cas limites');
		setTimeout(this.testLog, 2000);
		this._addLog('bb');
	}*/
	/*/_addLog(timestamp, text)
	{
		let logs = this.state.logs;
		logs.unshift(timestamp + ' - ' + text);
 		ajax('GET', 'robot/log', null, ( logs ) =>
		{ console.log("fonction ok")
 		if (logs.length > 5)
		{
			logs = logs.slice(0, 5);
		
			
		//}
		this.setState({ logs });
 	//});
	   o}//*/ 
	render()
	{
	
 	let { logs } = this.state;
   
		return (
			<div id='event-logger'>
				<div className='container'>
					{logs.map((item,key)=>{
						return(
							<li key={key} >{item.date+"  "+item.state+" from ip_source"+ item.ip}</li>
						)
					}
                                    
					)

					}
					
				</div>
			</div>
		);
	}
}

export default EventLogger;

 

