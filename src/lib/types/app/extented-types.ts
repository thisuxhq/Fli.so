import type {
  SubscriptionsResponse,
  TagsResponse,
  UsersResponse,
  UrlsResponse,
} from "./generated-types";

export type UrlsResponseWithTags<Texpand = unknown> = UrlsResponse<Texpand> & {
  expand: {
    tags_id: TagsResponse[];
  };
};

export type UsersResponseWithSubscription<Texpand = unknown> =
  UsersResponse<Texpand> & {
    expand: {
      subscriptions: SubscriptionsResponse;
    };
  };
