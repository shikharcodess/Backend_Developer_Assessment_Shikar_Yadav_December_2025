export declare const ProjectRole: {
    readonly OWNER: "OWNER";
    readonly COLLABORATOR: "COLLABORATOR";
    readonly VIEWER: "VIEWER";
};
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];
export declare const JobStatus: {
    readonly PENDING: "PENDING";
    readonly PROCESSING: "PROCESSING";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
};
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
export declare const JobType: {
    readonly CODE_EXECUTION: "CODE_EXECUTION";
    readonly BACKGROUND_TASK: "BACKGROUND_TASK";
};
export type JobType = (typeof JobType)[keyof typeof JobType];
export declare const PorjectInviteStatus: {
    readonly SENT: "SENT";
    readonly ACCEPTED: "ACCEPTED";
    readonly REJECTED: "REJECTED";
};
export type PorjectInviteStatus = (typeof PorjectInviteStatus)[keyof typeof PorjectInviteStatus];
