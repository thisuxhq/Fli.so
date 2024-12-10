export let requestIp: string;

import { type Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { createInstance } from "$lib/pocketbase";
import type { TypedPocketBase } from '$lib/types';
import { env } from "$env/dynamic/public";
import PocketBase from "pocketbase";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.pb = createInstance();
  event.locals.pb.autoCancellation(false);
  const cookie = event.request.headers.get("cookie") || "";
  event.locals.pb.authStore.loadFromCookie(cookie);

  event.locals.cmsPb = new PocketBase(env.PUBLIC_POCKETBASE_CMS_URL) as TypedPocketBase;
  event.locals.cmsPb.autoCancellation(false);

  try {
    if (event.locals.pb.authStore.isValid) {
      await event.locals.pb.collection("users").authRefresh();
      event.locals.user = event.locals.pb.authStore.model;
    } else {
      console.log("Auth not valid");
    }
  } catch (error) {
    console.error("Error refreshing auth:", error);
    event.locals.pb.authStore.clear();
  }

  const response = await resolve(event);
  const setCookie = event.locals.pb.authStore.exportToCookie({
    sameSite: "lax",
    secure: !dev,
    httpOnly: false,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  response.headers.set("set-cookie", setCookie);

  return response;
};
