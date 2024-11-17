import type { TagsResponse, UrlsResponse } from "./generated-types";

export type UrlsResponseWithTags<Texpand = unknown> = UrlsResponse<Texpand> & {
  expand: {
    tags_id: TagsResponse[];
  };
};
