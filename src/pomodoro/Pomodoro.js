import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";
import { checkMax, checkMin, checkHour } from "./sideFunctions/math-equations";
import { secondsToDuration } from "../utils/duration";
import sessionRunning from "./sideFunctions/session-updates";
import PercentageBar from "./components/PercentageBar";
import SessionView from "./components/SessionView";
import PausedTimer from "./components/PausedTimer";
import {
  disableWhenStopped,
  disableWhenRunning,
} from "./sideFunctions/button-disablers";

const sound = `https://bigsoundbank.com/UPLOAD/mp3/1482.mp3`;

function Pomodoro() {
  //Initial state object variable
  const initialSessionState = {
    focusTimer: 1500,
    breakTimer: 300,
    elapsed: 0,
    sessionStatus: "Focusing",
    isStopped: true,
  };
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionStates, setSessionStates] = useState(initialSessionState);
  //Audio element to be passed to session states function

  // ToDo: Allow the user to adjust the focus and break duration.

  //Click handlers

  //Increase the session timer
  //Will use checkMax to update the sessionState variable (focus/break) timer, depending on which was clicked
  const increaseSessionClick = (value, max) => {
    setSessionStates((sessionStates) => ({
      ...sessionStates,
      [value]:
        sessionStates[value] + checkMax(value, sessionStates[value], max),
    }));
  };

  //Decrease the session timmer
  //Will use checkMin to update the sessionState variable (focus/break) timer, depending on which was clicked
  const decreaseSessionClick = (value, min) => {
    setSessionStates((sessionStates) => ({
      ...sessionStates,
      [value]:
        sessionStates[value] - checkMin(value, sessionStates[value], min),
    }));
  };

  //Stop button event handler
  //Resets the initial values and sets isTimerRunning back to false
  const stopSession = () => {
    setSessionStates((sessionStates) => ({
      ...initialSessionState,
    }));
    setIsTimerRunning(false);
  };

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(
    () => {
      // Function that updates elapsed, remaining, and session status
      // Will return object to update sessionStates state object
      const updatedSessionStates = sessionRunning(sessionStates, sound);

      setSessionStates((sessionStates) => ({
        ...sessionStates,
        ...updatedSessionStates,
      }));
      // Funciton that will check for the timer to run out and play the audio
    },
    isTimerRunning ? 1000 : null
  );

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => !prevState);
    //Will ensure isStopped is false
    setSessionStates((sessionStates) => ({
      ...sessionStates,
      isStopped: false,
    }));
  }

  return (
    <div className="pomodoro">
      <div className="row">
        <div className="col">
          <div className="input-group input-group-lg mb-2">
            <span className="input-group-text" data-testid="duration-focus">
              Focus Duration: {checkHour(sessionStates.focusTimer)}
            </span>

            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-secondary"
                data-testid="decrease-focus"
                onClick={() => decreaseSessionClick("focusTimer", 300)}
                {...disableWhenRunning(sessionStates.isStopped)}
              >
                <span className="oi oi-minus" />
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                data-testid="increase-focus"
                onClick={() => increaseSessionClick("focusTimer", 3600)}
                {...disableWhenRunning(sessionStates.isStopped)}
              >
                <span className="oi oi-plus" />
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="float-right">
            <div className="input-group input-group-lg mb-2">
              <span className="input-group-text" data-testid="duration-break">
                Break Duration: {secondsToDuration(sessionStates.breakTimer)}
              </span>

              <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="decrease-break"
                  onClick={() => decreaseSessionClick("breakTimer", 60)}
                  {...disableWhenRunning(sessionStates.isStopped)}
                >
                  <span className="oi oi-minus" />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="increase-break"
                  onClick={() => increaseSessionClick("breakTimer", 900)}
                  {...disableWhenRunning(sessionStates.isStopped)}
                >
                  <span className="oi oi-plus" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div
            className="btn-group btn-group-lg mb-2"
            role="group"
            aria-label="Timer controls"
          >
            <button
              type="button"
              className="btn btn-primary"
              data-testid="play-pause"
              title="Start or pause timer"
              onClick={playPause}
            >
              <span
                className={classNames({
                  oi: true,
                  "oi-media-play": !isTimerRunning,
                  "oi-media-pause": isTimerRunning,
                })}
              />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              title="Stop the session"
              data-testid="stop"
              onClick={stopSession}
              {...disableWhenStopped(sessionStates.isStopped)}
            >
              <span className="oi oi-media-stop" />
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="row mb-2">
          <div className="col">
            <SessionView
              sessionStatus={sessionStates.sessionStatus}
              focusTimer={sessionStates.focusTimer}
              breakTimer={sessionStates.breakTimer}
              isStopped={sessionStates.isStopped}
              elapsed={sessionStates.elapsed}
            />
          </div>
        </div>

        <PausedTimer
          isStopped={sessionStates.isStopped}
          isTimerRunning={isTimerRunning}
        />

        <div className="row mb-2">
          <div className="col">
            <PercentageBar
              elapsed={sessionStates.elapsed}
              sessionStatus={sessionStates.sessionStatus}
              focusTimer={sessionStates.focusTimer}
              breakTimer={sessionStates.breakTimer}
              isStopped={sessionStates.isStopped}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pomodoro;
