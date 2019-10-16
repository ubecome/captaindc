const socketio = require("socket.io");
const SessionManager = require("../core/SessionManager.js");
const Daemon = require("../core/Daemon.js");
const StateManager = require("../core/StateManager.js");
const PilotManager = require("../core/PilotManager.js");
const RobotLink = require("../core/RobotLink.js");
const log = require("../core/Logger.js");
const TAG = "SocketIOServer";

const homeRoom = "home";
const pilotRoom = "pilot";

module.exports = server => {
  let robotState;
  let robotStateCallbacks = [];
  let startRobotStatePolling, stopRobotStatePolling;
  let robotStatePollingDaemon;

  const callWhenRobotStateAvailable = f => {
    if (robotState) {
      f();
    } else {
      robotStateCallbacks.push(f);
    }
  };

  let io = socketio(server);
  io.on("connection", socket => {
    const user = SessionManager.findUserByToken(socket.handshake.query.token);

    if (user) {
      log(TAG, "User connected " + socket.id);

      const pilotLeave = (user, cb) => {
        PilotManager.leave(user, ok => {
          if (ok) {
            socket.leave(pilotRoom);
            io.to(homeRoom).emit("pilot-changed");

            if (cb) {
              cb();
            }
          }
        });
      };

      socket.on("home-on", () => {
        socket.join(homeRoom);

        if (io.sockets.adapter.rooms[homeRoom].length === 1) {
          startRobotStatePolling();
        }
      });

      socket.on("home-off", () => {
        if (io.sockets.adapter.rooms[homeRoom].length === 1) {
          stopRobotStatePolling();
        }

        socket.leave(homeRoom);
      });

      socket.on("robot-battery-level-request", () => {
        callWhenRobotStateAvailable(() =>
          socket.emit("robot-battery-level", robotState.battery.percent)
        );
      });

      socket.on("robot-docking-state-request", () => {
        callWhenRobotStateAvailable(() =>
          socket.emit(
            "robot-docking-state",
            robotState.sensors["/sensors/docking_status"]
          )
        );
      });

      socket.on("robot-position-request", () => {
        callWhenRobotStateAvailable(() =>
          socket.emit("robot-position", robotState.position)
        );
      });

      socket.on("robot-state-request", () => {
        callWhenRobotStateAvailable(() =>
          socket.emit("robot-state", robotState.robot_state.state)
        );
      });

      socket.on("robot-emergency-button-request", () => {
        callWhenRobotStateAvailable(() =>
          socket.emit(
            "robot-emergency-button",
            robotState.sensors.emergency_button
          )
        );
      });

      socket.on("temperature-state-request", () => {
    
        callWhenRobotStateAvailable(() =>
          socket.emit(
            "temperature-state",
            robotState.sensors["/sensors/up/temperature"]
          )
        );
	  });
	  
	  socket.on("humidity-state-request", () => {
        callWhenRobotStateAvailable(() =>
          socket.emit(
            "humidity-state",
            robotState.sensors["/sensors/up/humidity"]
          )
        );
      });






      socket.on("pilot-request", () => {
        const granted = PilotManager.changePilot(user);
        socket.emit("pilot-response", granted);

        if (granted) {
          socket.join(pilotRoom);
          socket.emit("pilot-changed", { name: user.name, yourself: true });
          socket.broadcast
            .to(homeRoom)
            .emit("pilot-changed", { name: user.name });
        }
      });

      socket.on("pilot-keep-alive", () => {
        PilotManager.keepAlive(user);
      });

      socket.on("pilot-leave", () => {
        pilotLeave(user);
      });

      socket.on("pilot-state-request", () => {
        let response;

        const pilot = PilotManager.getPilot();
        if (pilot) {
          response = { name: pilot.name, yourself: user.token === pilot.token };
        }

        socket.emit("pilot-changed", response);
      });

      socket.on("start-recording", camera => {
        PilotManager.startRecording(user, camera, ok => {
          socket.emit("start-recording-response", ok);
        });
      });

      socket.on("stop-recording", () => {
        PilotManager.stopRecording(user);
      });

      socket.on("error", error => {
        log(TAG, "ERROR on socket", error);
      });

      socket.on("disconnect", reason => {
        debugger;
        const cb = () => {
          if (!io.sockets.adapter.rooms[homeRoom]) {
            stopRobotStatePolling();
          }
        };

        const pilot = PilotManager.getPilot();
        if (pilot && pilot.token === user.token) {
          pilotLeave(user, cb);
        } else {
          cb();
        }

        log(TAG, "disconnect", socket.id, reason);
      });
    } else {
      socket.disconnect();
    }
  });

  StateManager.subscribe("pilot-remaining-time", io, time => {
    io.to(pilotRoom).emit("pilot-remaining-time", time);
  });

  StateManager.subscribe("pilot-recording-remaining-time", io, time => {
    io.to(pilotRoom).emit("pilot-recording-remaining-time", time);
  });

  StateManager.subscribe("pilot-recording-stopped", io, url => {
    io.to(pilotRoom).emit("pilot-recording-stopped", url);
  });

  StateManager.subscribe("pilot-timeout", io, () => {
    io.to(homeRoom).emit("pilot-changed");
  });

  StateManager.subscribe("pilot-leaved-after-emergency-stop", io, () => {
    io.to(homeRoom).emit("pilot-changed");
  });

  startRobotStatePolling = () => {
    if (!robotStatePollingDaemon) {
      robotStatePollingDaemon = new Daemon(
        "robot-state-polling",
        0,
        500,
        null,
        () => {
          RobotLink.api({ url: "/state" }, (err, response) => {
            debugger;
            if (!err) {
              const newRobotState = JSON.parse(response.body);

              if (
                newRobotState.result &&
                newRobotState.result === "Unauthorized"
              ) {
                log(TAG, "Can not reach robot (Unauthorized)");
                return;
              }

              newRobotState.position.x = parseInt(newRobotState.position.x);
              newRobotState.position.y = parseInt(newRobotState.position.y);
              newRobotState.position.theta = parseFloat(
                parseFloat(newRobotState.position.theta).toFixed(1)
              );
              newRobotState.battery.percent = Math.round(
                newRobotState.battery.percent
              );

              newRobotState.sensors["/sensors/docking_status"] =
                newRobotState.sensors["/sensors/docking_status"] ;
              newRobotState.sensors["/sensors/up/temperature"] =
				newRobotState.sensors["/sensors/up/temperature"] ;
				newRobotState.sensors["/sensors/up/humidity"] =
				newRobotState.sensors["/sensors/up/humidity"] ;
				
              if (robotState) {
               /* console.log(JSON.stringify(robotState));*/
                if (
                  newRobotState.battery.percent !== robotState.battery.percent
                ) {
                  io.to(homeRoom).emit(
                    "robot-battery-level",
                    newRobotState.battery.percent
                  );
                }

                if (newRobotState.robot_state.state !== robotState.state) {
                  io.to(homeRoom).emit(
                    "robot-state",
                    newRobotState.robot_state.state
                  );
                }

                if (
                  newRobotState.sensors["/sensors/docking_status"] !==
                  robotState.sensors["/sensors/docking_status"]
                ) {
                  io.to(homeRoom).emit(
                    "robot-docking-state",
                    newRobotState.sensors["/sensors/docking_status"]
                  );
                }
                if (
                  newRobotState.sensors["/sensors/up/temperature"] !==
                  robotState.sensors["/sensors/up/temperature"]
                ) {
                  io.to(homeRoom).emit(
                    "temperature-state",
                    newRobotState.sensors["/sensors/up/temperature"]
                  );
				}
				if (
					newRobotState.sensors["/sensors/up/humidity"] !==
					robotState.sensors["/sensors/up/humidity"]
				  ) {
					io.to(homeRoom).emit(
					  "humidity-state",
					  newRobotState.sensors["/sensors/up/humidity"]
					);
				  }
                if (
                  newRobotState.position.x !== robotState.position.x ||
                  newRobotState.position.y !== robotState.position.y ||
                  newRobotState.position.theta !== robotState.position.theta
                ) {
                  io.to(homeRoom).emit(
                    "robot-position",
                    newRobotState.position
                  );
                }

                if (
                  newRobotState.sensors.emergency_button !==
                  robotState.sensors.emergency_button
                ) {
                  io.to(homeRoom).emit(
                    "robot-emergency-button",
                    newRobotState.sensors.emergency_button
                  );

                  if (newRobotState.sensors.emergency_button === "DOWN") {
                    StateManager.update("emergency-stop");
                  }
                }

                robotState = newRobotState;
              } else {
                robotState = newRobotState;

                for (let cb of robotStateCallbacks) {
                  cb();
                }
              }
            }
          });

          if (!io.sockets.adapter.rooms[homeRoom]) {
            stopRobotStatePolling();
          }
        }
      );
    }
  };

  stopRobotStatePolling = () => {
    if (robotStatePollingDaemon) {
      robotStatePollingDaemon.running = false;
      robotStatePollingDaemon = undefined;
      robotState = undefined;

      robotStateCallbacks = [];
    }
  };
};
