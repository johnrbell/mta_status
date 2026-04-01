export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["img/bg/1775066825.jpg","img/icons/android-icon-144x144.png","img/icons/android-icon-192x192.png","img/icons/android-icon-36x36.png","img/icons/android-icon-48x48.png","img/icons/android-icon-512x512.png","img/icons/android-icon-72x72.png","img/icons/android-icon-96x96.png","img/icons/apple-icon-114x114.png","img/icons/apple-icon-120x120.png","img/icons/apple-icon-144x144.png","img/icons/apple-icon-152x152.png","img/icons/apple-icon-180x180.png","img/icons/apple-icon-57x57.png","img/icons/apple-icon-60x60.png","img/icons/apple-icon-72x72.png","img/icons/apple-icon-76x76.png","img/icons/apple-icon-precomposed.png","img/icons/apple-icon.png","img/icons/favicon-16x16.png","img/icons/favicon-32x32.png","img/icons/favicon-96x96.png","img/icons/favicon.ico","img/icons/ms-icon-144x144.png","img/icons/ms-icon-150x150.png","img/icons/ms-icon-310x310.png","img/icons/ms-icon-70x70.png","manifest.json"]),
	mimeTypes: {".jpg":"image/jpeg",".png":"image/png",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.CoveGyuZ.js",app:"_app/immutable/entry/app.CZDiNr5X.js",imports:["_app/immutable/entry/start.CoveGyuZ.js","_app/immutable/chunks/DORGF2Cf.js","_app/immutable/chunks/DoQjel6k.js","_app/immutable/chunks/A8gynDYt.js","_app/immutable/entry/app.CZDiNr5X.js","_app/immutable/chunks/A8gynDYt.js","_app/immutable/chunks/Bfz6McSh.js","_app/immutable/chunks/DoQjel6k.js","_app/immutable/chunks/BFhtKsmk.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/[name]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
