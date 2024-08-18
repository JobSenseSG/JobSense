/**
 * WordPress dependencies
 */
import { combineReducers } from "@wordpress/data";

/**
 * Constants
 */
import { ADD_FILE, UPDATE_FILE, DELETE_FILE, RESET } from "./constants";

const files = (state = {}, action) => {
    switch (action.type) {
        case ADD_FILE: {
            let _state = { ...state };
            if (!_state[action.fieldId]) {
                _state[action.fieldId] = {};
            }
            _state[action.fieldId] = {
                ..._state[action.fieldId],
                [action.fileKey]: action.fileData
            };
            return _state;
        }

        case UPDATE_FILE: {
            let _state = { ...state };
            if (!_state[action.fieldId] || !_state[action.fieldId][action.fileKey]) {
                return state;
            }
            _state[action.fieldId] = {
                ..._state[action.fieldId],
                [action.fileKey]: {
                    ..._state[action.fieldId][action.fileKey],
                    ...action.fileData
                }
            };
            return _state;
        }

        case DELETE_FILE: {
            let _state = { ...state };
            if (!_state[action.fieldId] || !_state[action.fieldId][action.fileKey]) {
                return state;
            }
            delete _state[action.fieldId][action.fileKey];
            _state[action.fieldId] = { ..._state[action.fieldId] };
            return _state;
        }

        case RESET: {
            let _state = { ...state };
            _state[action.fieldId] = {};
            return _state;
        }
    }

    return state;
};

export default combineReducers({ files });
