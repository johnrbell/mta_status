import { a7 as ensure_array_like, a8 as attr_class, a as attr_style, b as stringify, a9 as attr, e as escape_html } from "../../chunks/index.js";
const lineColors = {
  "1": "#EE352E",
  "2": "#EE352E",
  "3": "#EE352E",
  "4": "#00933C",
  "5": "#00933C",
  "6": "#00933C",
  "7": "#B933AD",
  "A": "#0039A6",
  "C": "#0039A6",
  "E": "#0039A6",
  "B": "#FF6319",
  "D": "#FF6319",
  "F": "#FF6319",
  "M": "#FF6319",
  "G": "#6CBE45",
  "J": "#996633",
  "Z": "#996633",
  "L": "#A7A9AC",
  "N": "#FCCC0A",
  "Q": "#FCCC0A",
  "R": "#FCCC0A",
  "W": "#FCCC0A",
  "S": "#808183"
};
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="container svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(data.trains);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let train = each_array[$$index];
      if (train) {
        $$renderer2.push("<!--[0-->");
        if (train.route === "A" || train.route === "G") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<br class="for_desktop svelte-1uha8ag"/>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <div${attr_class("trainname svelte-1uha8ag", void 0, { "has-alerts": train.alerts && train.alerts.length > 0 })}${attr_style(`background-color: ${stringify(lineColors[train.route] || "#888")}`)}${attr("role", train.alerts?.length > 0 ? "button" : void 0)}${attr("tabindex", train.alerts?.length > 0 ? 0 : void 0)}><div class="letter svelte-1uha8ag">${escape_html(train.route)}</div> <div class="status svelte-1uha8ag">${escape_html(train.statusDetails.statusSummary)}</div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="hint svelte-1uha8ag">click a train for more info</div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
