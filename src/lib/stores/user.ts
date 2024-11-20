import type { AuthModel } from "pocketbase";

import { writable } from "svelte/store";

export const currentUser = writable<AuthModel | null>();
