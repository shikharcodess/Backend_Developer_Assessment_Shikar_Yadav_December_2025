/**
 * Real-time event types and interfaces
 */
export declare enum RealtimeEventType {
    USER_JOINED = "user:joined",
    USER_LEFT = "user:left",
    USER_PRESENCE_UPDATE = "user:presence-update",
    FILE_CHANGED = "project:file-changed",
    FILE_CREATED = "project:file-created",
    FILE_DELETED = "project:file-deleted",
    CURSOR_MOVED = "cursor:moved",
    ACTIVITY_UPDATE = "activity:update",
    PROJECT_WORKSPACE_JOIN = "project-workspace:join",
    PROJECT_WORKSPACE_LEAVE = "project-workspace:leave"
}
export interface CurrentProjectWorkspaceMetadata {
    userId: string;
    userName: string;
    workspaceId: string;
    workspaceName: string;
    projectId: string;
    projectName: string;
    lastSeenAt: number;
    userRole: "OWNER" | "COLLABORATOR" | "VIEWER";
}
export interface ProjectWorkspaceJoinPayload {
    userId: string;
    workspaceId: string;
    projectId: string;
    timestamp: number;
}
export interface UserJoinedPayload {
    userId: string;
    workspaceId: string;
    projectId?: string;
    username: string;
    timestamp: number;
}
export interface UserLeftPayload {
    userId: string;
    workspaceId: string;
    projectId?: string;
    timestamp: number;
}
export interface UserPresenceUpdatePayload {
    userId: string;
    status: "online" | "offline" | "idle";
    lastActive: number;
}
export interface FileChangedPayload {
    projectId: string;
    filePath: string;
    changes: {
        type: "insert" | "delete" | "modify";
        content?: string;
        lineNumber?: number;
        charPosition?: number;
    };
    userId: string;
    timestamp: number;
    version: number;
}
export interface FileCreatedPayload {
    projectId: string;
    filePath: string;
    userId: string;
    timestamp: number;
}
export interface FileDeletedPayload {
    projectId: string;
    filePath: string;
    userId: string;
    timestamp: number;
}
export interface CursorMovedPayload {
    userId: string;
    projectId: string;
    filePath: string;
    position: {
        x: number;
        y: number;
        line: number;
        column: number;
    };
    timestamp: number;
}
export interface SocketMetadata {
    userId: string;
    connectedAt: number;
    currentProjectAndWorkspace?: CurrentProjectWorkspaceMetadata;
}
export interface RealtimeEvent<T = any> {
    type: RealtimeEventType;
    payload: T;
    timestamp: number;
    userId?: string;
}
