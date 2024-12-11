import type { Url, Tag, User, Subscription } from "$lib/server/db/schema";

// url with tags
export type UrlWithTagsResponse = Url & {
  tags: Tag[];
};

export type UrlsResponseWithTags = Url & {
  expand?: {
    tags_id: Tag[];
  };
};

export type TagsResponse = Tag;

export type UrlsResponse = Url;

export type UsersResponse = User;

export type SubscriptionsResponse = Subscription;
