// Shared type definitions
export var SessionStatus;
(function (SessionStatus) {
    SessionStatus["Active"] = "active";
    SessionStatus["Paused"] = "paused";
    SessionStatus["Completed"] = "completed";
    SessionStatus["Archived"] = "archived";
})(SessionStatus || (SessionStatus = {}));
// Export project types
export * from './project';
// Export filesystem types
export * from './filesystem';
