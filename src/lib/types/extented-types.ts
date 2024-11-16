export type UrlsResponseWithTags<Texpand = unknown> = UrlsResponse<Texpand> & {
  expand: {
    tags: TagsResponse[];
  };
};
