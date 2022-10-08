import {writable} from "svelte/store";

export const page = writable("");
export const next = writable("");
export const params = writable({});

export function navigateTo(_page, _params, _origin) {
  params.set(_params);
  page.set(_page);
  if(_origin) next.set(_origin);
}

export function sneakPeakTo(_page, _origin) {
  next.set(_origin);
  page.set(_page);
}
