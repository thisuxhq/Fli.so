/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
	Issues = 'issues',
	Projects = 'projects',
	Users = 'users'
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString;
	created: IsoDateString;
	updated: IsoDateString;
	collectionId: string;
	collectionName: Collections;
	expand?: T;
};

export type AuthSystemFields<T = never> = {
	email: string;
	emailVisibility: boolean;
	username: string;
	verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export enum IssuesStatusOptions {
	'Backlog' = 'Backlog',
	'Todo' = 'Todo',
	'In Progress' = 'In Progress',
	'Done' = 'Done',
	'Cancelled' = 'Cancelled'
}

export enum IssuesPriorityOptions {
	'None' = 'None',
	'Low' = 'Low',
	'Medium' = 'Medium',
	'High' = 'High',
	'Urgent' = 'Urgent'
}

export enum IssuesLabelOptions {
	'Bug' = 'Bug',
	'Feature' = 'Feature',
	'Documentation' = 'Documentation',
	'Question' = 'Question',
	'Task' = 'Task'
}
export type IssuesRecord = {
	created_by?: RecordIdString;
	description?: string;
	due_date?: IsoDateString;
	identifier: string;
	label?: IssuesLabelOptions[];
	priority?: IssuesPriorityOptions[];
	status?: IssuesStatusOptions;
	title: string;
};

export enum ProjectsColourOptions {
	'Red' = 'Red',
	'Green' = 'Green',
	'Blue' = 'Blue',
	'Pink' = 'Pink',
	'Light Blue' = 'Light Blue',
	'Orange' = 'Orange',
	'Purple' = 'Purple',
	'Turquoise' = 'Turquoise',
	'Lime' = 'Lime'
}

export enum ProjectsStatusOptions {
	'Backlog' = 'Backlog',
	'Todo' = 'Todo',
	'In Progress' = 'In Progress',
	'Done' = 'Done',
	'Cancelled' = 'Cancelled'
}
export type ProjectsRecord = {
	colour?: ProjectsColourOptions;
	created_by?: RecordIdString;
	description?: string;
	end_date?: IsoDateString;
	identifier?: string;
	start_date?: IsoDateString;
	status?: ProjectsStatusOptions;
	title?: string;
};

export type UsersRecord = {
	avatar?: string;
	name?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type IssuesResponse<Texpand = unknown> = Required<IssuesRecord> & BaseSystemFields<Texpand>;
export type ProjectsResponse<Texpand = unknown> = Required<ProjectsRecord> &
	BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	issues: IssuesRecord;
	projects: ProjectsRecord;
	users: UsersRecord;
};

export type CollectionResponses = {
	issues: IssuesResponse;
	projects: ProjectsResponse;
	users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'issues'): RecordService<IssuesResponse>;
	collection(idOrName: 'projects'): RecordService<ProjectsResponse>;
	collection(idOrName: 'users'): RecordService<UsersResponse>;
};
