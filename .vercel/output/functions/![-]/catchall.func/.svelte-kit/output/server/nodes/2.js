import * as server from '../entries/pages/_page.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/2.CzYNRXsA.js","_app/immutable/chunks/Bfz6McSh.js","_app/immutable/chunks/A8gynDYt.js","_app/immutable/chunks/DI026r4S.js"];
export const stylesheets = ["_app/immutable/assets/2.DcgqAahK.css"];
export const fonts = [];
