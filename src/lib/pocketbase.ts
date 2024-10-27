import { env } from "$env/dynamic/public";
import PocketBase from "pocketbase";
import { dev } from "$app/environment";

export function createInstance() {
  return new PocketBase(
    !dev ? env.PUBLIC_POCKETBASE_URL : "http://localhost:8090",
  );
}

export const pb = createInstance();
