import keplerGlReducer from "kepler.gl/reducers";
import window from "global/window";
import {createStore, applyMiddleware, compose} from "redux";
import {taskMiddleware} from "react-palm/tasks";

export const enhancers = [applyMiddleware(taskMiddleware)];

// This adds redux devtools to help in debugging
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(keplerGlReducer, {}, composeEnhancers(...enhancers));
