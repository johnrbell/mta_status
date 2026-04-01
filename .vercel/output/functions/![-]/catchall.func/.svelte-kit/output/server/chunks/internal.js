import { r as root } from "./root.js";
import "./environment.js";
import "./shared-server.js";
let read_implementation = null;
function set_read_implementation(fn) {
  read_implementation = fn;
}
function set_manifest(_) {
}
const options = {
  app_template_contains_nonce: false,
  async: false,
  csp: { "mode": "auto", "directives": { "upgrade-insecure-requests": false, "block-all-mixed-content": false }, "reportOnly": { "upgrade-insecure-requests": false, "block-all-mixed-content": false } },
  csrf_check_origin: true,
  csrf_trusted_origins: [],
  embedded: false,
  env_public_prefix: "PUBLIC_",
  env_private_prefix: "",
  hash_routing: false,
  hooks: null,
  // added lazily, via `get_hooks`
  preload_strategy: "modulepreload",
  root,
  service_worker: false,
  service_worker_options: void 0,
  server_error_boundaries: false,
  templates: {
    app: ({ head, body, assets, nonce, env }) => '<!doctype html>\n<html lang="en">\n<head>\n	<meta charset="utf-8" />\n	<title>MTA Status</title>\n	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />\n	<meta name="theme-color" content="#000000" />\n	<meta property="og:title" content="MTA Status" />\n	<meta property="og:site_name" content="MTA Status" />\n	<meta property="og:description" content="Subway status, at a glance." />\n	<meta property="og:type" content="website" />\n	<meta name="mobile-web-app-capable" content="yes" />\n	<meta name="apple-mobile-web-app-capable" content="yes" />\n	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n	<meta name="apple-mobile-web-app-title" content="MTA Status" />\n	<meta name="msapplication-TileColor" content="#333333" />\n	<meta name="msapplication-TileImage" content="/img/icons/ms-icon-144x144.png" />\n	<link rel="manifest" href="/manifest.json" />\n	<link rel="icon" type="image/x-icon" href="/img/icons/favicon.ico" />\n	<link rel="icon" type="image/png" sizes="16x16" href="/img/icons/favicon-16x16.png" />\n	<link rel="icon" type="image/png" sizes="32x32" href="/img/icons/favicon-32x32.png" />\n	<link rel="icon" type="image/png" sizes="96x96" href="/img/icons/favicon-96x96.png" />\n	<link rel="apple-touch-icon" sizes="57x57" href="/img/icons/apple-icon-57x57.png" />\n	<link rel="apple-touch-icon" sizes="60x60" href="/img/icons/apple-icon-60x60.png" />\n	<link rel="apple-touch-icon" sizes="72x72" href="/img/icons/apple-icon-72x72.png" />\n	<link rel="apple-touch-icon" sizes="76x76" href="/img/icons/apple-icon-76x76.png" />\n	<link rel="apple-touch-icon" sizes="114x114" href="/img/icons/apple-icon-114x114.png" />\n	<link rel="apple-touch-icon" sizes="120x120" href="/img/icons/apple-icon-120x120.png" />\n	<link rel="apple-touch-icon" sizes="144x144" href="/img/icons/apple-icon-144x144.png" />\n	<link rel="apple-touch-icon" sizes="152x152" href="/img/icons/apple-icon-152x152.png" />\n	<link rel="apple-touch-icon" sizes="180x180" href="/img/icons/apple-icon-180x180.png" />\n	' + head + '\n</head>\n<body data-sveltekit-preload-data="hover">\n	<div style="display: contents">' + body + "</div>\n</body>\n</html>\n",
    error: ({ status, message }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' + message + `</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">` + status + '</span>\n			<div class="message">\n				<h1>' + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n"
  },
  version_hash: "162buwi"
};
async function get_hooks() {
  let handle;
  let handleFetch;
  let handleError;
  let handleValidationError;
  let init;
  let reroute;
  let transport;
  return {
    handle,
    handleFetch,
    handleError,
    handleValidationError,
    init,
    reroute,
    transport
  };
}
export {
  set_manifest as a,
  get_hooks as g,
  options as o,
  read_implementation as r,
  set_read_implementation as s
};
