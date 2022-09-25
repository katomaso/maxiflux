import {writable} from "svelte/store";

export const page = writable("");
export const next = writable("");
export const params = writable({});

export function navigateTo(_page, _params) {
  params.set(_params);
  page.set(_page);
}
