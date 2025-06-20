// Project-related type definitions
// Project events
export var ProjectEvent;
(function (ProjectEvent) {
    ProjectEvent["Created"] = "project:created";
    ProjectEvent["Updated"] = "project:updated";
    ProjectEvent["Deleted"] = "project:deleted";
    ProjectEvent["Opened"] = "project:opened";
    ProjectEvent["Closed"] = "project:closed";
})(ProjectEvent || (ProjectEvent = {}));
