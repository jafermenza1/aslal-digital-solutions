// Emerald/cPanel startup adapter.
// LiteSpeed/Passenger does not reliably inject the project .env into
// the standalone Node process, so load it before Next initializes.
require("dotenv/config");

// After npm run build, Next's standalone server is generated here:
// .next/standalone/server.js
require("./.next/standalone/server.js");
