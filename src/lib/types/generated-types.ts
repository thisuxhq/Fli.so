/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Tags = "tags",
	Urls = "urls",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type TagsRecord = {
	color?: string
	created_by?: RecordIdString
	name?: string
}

export type UrlsRecord = {
	clicks?: number
	created_by?: RecordIdString
	expiration?: IsoDateString
	expiration_url?: string
	meta_description?: string
	meta_image_url?: string
	meta_title?: string
	password_hash?: string
	qr_code?: string
	slug: string
	tags?: RecordIdString[]
	url: string
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> & BaseSystemFields<Texpand>
export type UrlsResponse<Texpand = unknown> = Required<UrlsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	tags: TagsRecord
	urls: UrlsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	tags: TagsResponse
	urls: UrlsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'tags'): RecordService<TagsResponse>
	collection(idOrName: 'urls'): RecordService<UrlsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
