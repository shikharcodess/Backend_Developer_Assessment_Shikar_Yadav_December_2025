"use strict";
/**
 * Real-time event types and interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeEventType = void 0;
var RealtimeEventType;
(function (RealtimeEventType) {
    // User presence
    RealtimeEventType["USER_JOINED"] = "user:joined";
    RealtimeEventType["USER_LEFT"] = "user:left";
    RealtimeEventType["USER_PRESENCE_UPDATE"] = "user:presence-update";
    // Project/File events
    RealtimeEventType["FILE_CHANGED"] = "project:file-changed";
    RealtimeEventType["FILE_CREATED"] = "project:file-created";
    RealtimeEventType["FILE_DELETED"] = "project:file-deleted";
    // Cursor and activity
    RealtimeEventType["CURSOR_MOVED"] = "cursor:moved";
    RealtimeEventType["ACTIVITY_UPDATE"] = "activity:update";
    // Select Project and Workspace
    RealtimeEventType["PROJECT_WORKSPACE_JOIN"] = "project-workspace:join";
    RealtimeEventType["PROJECT_WORKSPACE_LEAVE"] = "project-workspace:leave";
})(RealtimeEventType || (exports.RealtimeEventType = RealtimeEventType = {}));
//# sourceMappingURL=realtime.js.map