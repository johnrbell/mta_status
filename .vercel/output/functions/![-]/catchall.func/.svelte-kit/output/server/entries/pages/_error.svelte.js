import { g as getContext, c as store_get, e as escape_html, u as unsubscribe_stores } from "../../chunks/index.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="container svelte-1j96wlh">`);
    if (store_get($$store_subs ??= {}, "$page", page).status === 404 && store_get($$store_subs ??= {}, "$page", page).error?.message) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="error-msg svelte-1j96wlh">Sorry, <em class="svelte-1j96wlh">${escape_html(store_get($$store_subs ??= {}, "$page", page).error.message)}</em> is not a valid NYC Subway line!</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<p class="error-msg svelte-1j96wlh">Something went wrong.</p>`);
    }
    $$renderer2.push(`<!--]--> <a href="/" class="error-link svelte-1j96wlh">back to all trains</a></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _error as default
};
