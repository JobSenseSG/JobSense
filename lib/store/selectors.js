/**
 * Get field files
 *
 * @param {Object} state  Global application state.
 * @param {int} fieldId
 * @returns {Object}
 */
export function getFiles(state, fieldId) {
    return state.files[fieldId];
}
