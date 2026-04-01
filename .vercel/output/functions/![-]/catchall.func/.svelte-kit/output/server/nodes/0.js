import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["_app/immutable/nodes/0.DkkMn6qK.js","_app/immutable/chunks/Bfz6McSh.js","_app/immutable/chunks/A8gynDYt.js","_app/immutable/chunks/DI026r4S.js","_app/immutable/chunks/DORGF2Cf.js","_app/immutable/chunks/DoQjel6k.js"];
export const stylesheets = ["_app/immutable/assets/0.DdgObZGj.css"];
export const fonts = [];
