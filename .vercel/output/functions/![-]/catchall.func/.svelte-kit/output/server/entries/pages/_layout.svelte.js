import { a as attr_style, b as stringify } from "../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, data } = $$props;
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="header svelte-12qhfyh"><h1 class="svelte-12qhfyh"><a href="/" class="svelte-12qhfyh">MTA STATUS</a></h1> <h2 class="svelte-12qhfyh">Subway, at a glance.</h2></div> `);
    children($$renderer2);
    $$renderer2.push(`<!----> <div class="bg svelte-12qhfyh"${attr_style(`background-image: url(${stringify(data.bgImg)})`)}></div> <div class="screen svelte-12qhfyh"></div>`);
  });
}
export {
  _layout as default
};
