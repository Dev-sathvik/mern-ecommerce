/**
 * Optional root entry: runs the API with cwd = server/ so server/.env loads.
 * Prefer: cd server && npm run server
 */
const { execFileSync } = require("child_process");
const path = require("path");

const serverEntry = path.join(__dirname, "server", "server.js");

execFileSync(process.execPath, [serverEntry], {
  stdio: "inherit",
  cwd: path.join(__dirname, "server"),
});
