import {writable} from "svelte/store";

export const page = writable("");
export const params = writable({});
export const next = writable("");
export const next_params = writable({});

let _current;
page.subscribe((v) => {
  _current = v;
  console.log("router.page changed to ", _current);
});

let _next;
next.subscribe((v) => {
  _next = v;
  console.log("router.next changed to ", _next);
});

let _next_params;
next_params.subscribe((v) => {
  _next_params = v;
  console.log("router._next_params changed to ", _next_params);
});

export function navigateTo(_page, _params) {
  if(_next) {
    next.set(null);
    next_params.set(null);
    params.set(_next_params);
    page.set(_next); // will trigger reload
    return;
  }
  params.set(_params);
  page.set(_page);
}

/**
 * 
 * @param {string} __page where to navigate
 * @param {object} __next_params parameters when going back to origin
 */
export function sneakPeakTo(__page, __next_params) {
  next.set(_current);
  next_params.set(__next_params);
  page.set(__page); // will trigger reload
}
