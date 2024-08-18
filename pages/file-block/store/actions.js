import { ADD_FILE, UPDATE_FILE, DELETE_FILE, RESET } from "./constants";

export const addFile = (fieldId, fileKey, fileData) => {
    return {
        type: ADD_FILE,
        fieldId,
        fileKey,
        fileData
    };
};

export const updateFile = (fieldId, fileKey, fileData) => {
    return {
        type: UPDATE_FILE,
        fieldId,
        fileKey,
        fileData
    };
};

export const deleteFile = (fieldId, fileKey) => {
    return {
        type: DELETE_FILE,
        fieldId,
        fileKey
    };
};

export const reset = (fieldId) => {
    return {
        type: RESET,
        fieldId
    };
};
