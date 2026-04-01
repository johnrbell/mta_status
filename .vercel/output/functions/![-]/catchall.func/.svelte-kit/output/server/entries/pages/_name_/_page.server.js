import { redirect, error } from "@sveltejs/kit";
import { a as allRoutes } from "../../../chunks/mta.js";
function load({ params }) {
  const name = params.name.toUpperCase();
  if (allRoutes.includes(name)) {
    redirect(302, "/");
  }
  error(404, { message: params.name });
}
export {
  load
};
