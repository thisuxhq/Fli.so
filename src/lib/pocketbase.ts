import { env } from "$env/dynamic/public";
import PocketBase from "pocketbase";
import { dev } from "$app/environment";
import type { TypedPocketBase } from "./types";

export function createInstance() {
  return new PocketBase(
    dev ? "http://0.0.0.0:8090" : env.PUBLIC_POCKETBASE_URL,
  ) as TypedPocketBase;
}

export const pb = createInstance() as TypedPocketBase;
