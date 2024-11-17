/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
  Customers = "customers",
  PaymentMethods = "payment_methods",
  Subscriptions = "subscriptions",
  Tags = "tags",
  Urls = "urls",
  Users = "users",
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

export type CustomersRecord = {
  stripe_customer_id: string;
  user_id?: RecordIdString;
};

export type PaymentMethodsRecord = {
  card_brand?: string;
  card_exp_month?: string;
  card_exp_year?: string;
  card_last4?: string;
  customer_id?: RecordIdString;
  is_default?: string;
  stripe_payment_method_id?: string;
};

export enum SubscriptionsStatusOptions {
  "active" = "active",
  "cancelled" = "cancelled",
  "past_due" = "past_due",
  "trialing" = "trialing",
  "incomplete" = "incomplete",
}
export type SubscriptionsRecord = {
  cancel_at_period_end?: IsoDateString;
  current_period_end?: IsoDateString;
  current_period_start?: IsoDateString;
  customer_id?: RecordIdString;
  plan_name?: string;
  status?: SubscriptionsStatusOptions;
  stripe_price_id?: string;
  stripe_subscription_id?: string;
  user_id?: RecordIdString;
};

export type TagsRecord = {
  color?: string;
  created_by?: RecordIdString;
  name?: string;
};

export type UrlsRecord = {
  clicks?: number;
  created_by?: RecordIdString;
  expiration?: IsoDateString;
  expiration_url?: string;
  meta_description?: string;
  meta_image_url?: string;
  meta_title?: string;
  password_hash?: string;
  qr_code?: string;
  slug: string;
  tags_id?: RecordIdString[];
  url: string;
};

export type UsersRecord = {
  avatar?: string;
  name?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type CustomersResponse<Texpand = unknown> = Required<CustomersRecord> &
  BaseSystemFields<Texpand>;
export type PaymentMethodsResponse<Texpand = unknown> =
  Required<PaymentMethodsRecord> & BaseSystemFields<Texpand>;
export type SubscriptionsResponse<Texpand = unknown> =
  Required<SubscriptionsRecord> & BaseSystemFields<Texpand>;
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> &
  BaseSystemFields<Texpand>;
export type UrlsResponse<Texpand = unknown> = Required<UrlsRecord> &
  BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  customers: CustomersRecord;
  payment_methods: PaymentMethodsRecord;
  subscriptions: SubscriptionsRecord;
  tags: TagsRecord;
  urls: UrlsRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  customers: CustomersResponse;
  payment_methods: PaymentMethodsResponse;
  subscriptions: SubscriptionsResponse;
  tags: TagsResponse;
  urls: UrlsResponse;
  users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: "customers"): RecordService<CustomersResponse>;
  collection(
    idOrName: "payment_methods",
  ): RecordService<PaymentMethodsResponse>;
  collection(idOrName: "subscriptions"): RecordService<SubscriptionsResponse>;
  collection(idOrName: "tags"): RecordService<TagsResponse>;
  collection(idOrName: "urls"): RecordService<UrlsResponse>;
  collection(idOrName: "users"): RecordService<UsersResponse>;
};
