import React from "react";
import AbstractComponent from "./AbstractComponent.js";
import ControlPanelButton from "./ControlPanelButton.js";
import PilotPanel from "./PilotPanel.js";
import Joystick from "./Joystick.js";
import BatteryIndicator from "./BatteryIndicator";
import GamepadManager from "../common/GamepadManager.js";
import StateManager from "../common/StateManager";
import Daemon from "../common/Daemon.js";
import ajax from "../common/ajax.js";
import "../css/control-panel.css";
import EventLogger from "./EventLogger";
import i18n from "../i18n/i18n.js";
import "../css/modal.css";
import { Modal, Button } from "semantic-ui-react";
import Temperature from "./Temperature.js";
import Humidity from "./Humidity.js";

class ControlPanel extends AbstractComponent {
  constructor(props) {
    super(props);

    this.joystick = {};
    this.state = {
      controlState: 0, // 0 : hidden | 1 : disabled | 2 enabled
      batteryLevel: 0,
      displayLogModal: false,
      lightOn: false,
      alarmOn: false,
      robotState: "",
      docked: "",
      logs: [],
	  sensorsStateTemp: "",
	  sensorsStateHum: "",
      humidity: ""
    };

    this.logValue = undefined;

    this.onDrag = this.onDrag.bind(this);
    this.submitLog = this.submitLog.bind(this);
    this.closeLogModal = this.closeLogModal.bind(this);
    this.toggleLight = this.toggleLight.bind(this);
    this.toggleAlarm = this.toggleAlarm.bind(this);
    this.gotoDock = this.gotoDock.bind(this);
  
  }

  init() {
    GamepadManager.init(gamepadState => {
      this.fireEvent("gamepad-state", gamepadState);
    });
  }

  onSocketIOConnected(SocketIOClient) {
    this.subscribeEvent("robot-battery-level", batteryLevel => {
      this.setState({ batteryLevel });
      /*console.log(batteryLevel)*/
    });

    this.subscribeEvent("robot-state", robotState => {
      this.setState({ robotState });
    });

    this.subscribeEvent("temperature-state", sensorsStateTemp => {
      
      this.setState({sensorsStateTemp});
	  /*console.log(sensorsStateTemp);*/
	
	});
	
	this.subscribeEvent("humidity-state", sensorsStateHum => {
		
		this.setState({sensorsStateHum});
		
		
	  });
    /*this.subscribeEvent('robot-emergency-button', (sensorsState) =>
			{
				this.setState({sensorsState})
				console.log(JSON.stringify(sensorsState));
				});*/

    this.subscribeEvent("robot-docking-state", docked => {
      this.setState({ docked });
    });

    this.subscribeEvent("pilot-changed", pilot => {
      if (!this.checkSpectator()) {
        const controlState = pilot && pilot.yourself === true ? 2 : 1;
        const lightOn = false;

        this.setState({ controlState, lightOn });
      }
    });

    this.subscribeEvent("pilot-remaining-time", time => {
      this.setState({ remainingTime: time });
    });

    SocketIOClient.emit("robot-battery-level-request");
    SocketIOClient.emit("robot-state-request");
    SocketIOClient.emit("robot-docking-state-request");
	SocketIOClient.emit("temperature-state-request");
	SocketIOClient.emit("humidity-state-request");
  }

  onDrag(x, y) {
    this.joystick.x = x;
    this.joystick.y = y;

    if (x !== 0 || y !== 0) {
      if (!this.daemon) {
        this.daemon = new Daemon(
          "sending-joytick-values",
          0,
          500,
          undefined,
          () => {
            ajax("POST", "robot/move", {
              x: this.joystick.y,
              y: -this.joystick.x
            });
          }
        );
      }
    } else if (this.daemon) {
      this.daemon.running = false;
      this.daemon = undefined;
    }
  }

  turnBy(theta) {
    ajax("POST", "robot/turn-by", { theta });
  }

  terminate() {
    GamepadManager.terminate();
  }

  toggleLight() {
    ajax("POST", "robot/light", { state: !this.state.lightOn });
    this.setState({ lightOn: !this.state.lightOn });
  }

  toggleAlarm() {
    ajax("POST", "robot/siren", { state: !this.state.alarmOn });
    this.setState({ alarmOn: !this.state.alarmOn });
  }

  closeLogModal() {
    this.setState({ displayLogModal: false });
    this.logValue = undefined;
  }

  submitLog() {
    if (this.logValue) {
      ajax("POST", "robot/log", { data: this.logValue });
    }

    this.closeLogModal();
  }
  

  checkSpectator() {
    return StateManager.get("logged-user").profile === "profile.spectator";
  }

  /*componentDidMount(){
		this.getState();
	/*}
	_addLog(timestamp, text)
	{
		let logs = this.state.logs;
		logs.unshift(timestamp + ' - ' + text);
 		ajax('GET', 'robot/log', null, ( logs ) =>
		{ console.log("fonction ok")
 		if (logs.length > 5)
		{
			logs = logs.slice(0, 5);
		
			
		}
		console.log(logs)
		this.setState({ logs });
 	});

	}*/

  gotoDock() {
    ajax("POST", "robot/goto-dock", null, () => {
      this.fireEvent("goto-dock");
    });
  }

  render() {
    const hidden = this.state.controlState === 0;
    const disabled = this.state.controlState === 1;

    return (
      <div id="control-panel-container" className="horizontal">
        <div className="control-widget vertical">
          <PilotPanel remainingTime={this.state.remainingTime || 0} />
        </div>
        <div className="control-widget horizontal" hidden={hidden}>
          <ControlPanelButton
            size={[55, 90]}
            cornerRadius={{ left: 40 }}
            icon="undo"
            disabled={disabled}
            onClick={() => this.turnBy(-2 * Math.PI)}
          />
          <Joystick onDrag={this.onDrag} disabled={disabled} />
          <ControlPanelButton
            size={[55, 90]}
            cornerRadius={{ right: 40 }}
            icon="repeat"
            disabled={disabled}
            onClick={() => this.turnBy(2 * Math.PI)}
          />
        </div>
        <div className="control-widget horizontal" hidden={hidden}>
          <ControlPanelButton
            id="light-button"
            size={[80, 45]}
            cornerRadius={{ left: 30 }}
            icon="lightbulb"
            disabled={disabled}
            active={this.state.lightOn}
            onClick={this.toggleLight}
          />
          <ControlPanelButton
            id="alarm-button"
            size={[80, 45]}
            icon="alarm"
            disabled={disabled}
            active={this.state.alarmOn}
            onClick={this.toggleAlarm}
          />
          <ControlPanelButton
            id="go-to-dock-button"
            size={[80, 45]}
            cornerRadius={{ right: 30 }}
            icon="plug"
            disabled={disabled}
            onClick={this.gotoDock}
          />

          <ControlPanelButton
            id="log-button"
            size={[80, 45]}
            cornerRadius={{ topRight: 30 }}
            icon="write"
            disabled={disabled}
            onClick={() => {
              this.setState({ displayLogModal: true });
            }}
          />
          <Modal
            basic
            size="small"
            open={this.state.displayLogModal}
            onClose={this.closeLogModal}
          >
            <Modal.Content>
              <form
                type="text"
                fluid
                placeholder={i18n.get("event-log.message-placeholder")}
                onChange={e => {
                  this.logValue = e.target.value;
                }}
                action
              >
                <input
                  onKeyPress={e => {
                    if (e.key === "Enter") this.submitLog();
                  }}
                  autoFocus
                />
                <Button type="submit" onClick={this.submitLog}>
                  {i18n.get("submit")}
                </Button>
              </form>
            </Modal.Content>
          </Modal>
        </div>

        <div className="control-widget">
          <EventLogger /*data={this.state.logs}*/ />
        </div>
        <div className="temperature">
          <Temperature  sensorsStateTemp={this.state.sensorsStateTemp} 
           onClose={this.tempAlert}/>
        </div>
        <div className="humidity">
          <Humidity sensorsStateHum={this.state.sensorsStateHum} />
        </div>
        <div className="control-widget control-widget-right">
          <BatteryIndicator
            level={this.state.batteryLevel}
            charging={this.state.docked}
            robotState={this.state.robotState}
          />
        </div>
      </div>
    );
  }
}

export default ControlPanel;
