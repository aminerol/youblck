const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { build } = require("esbuild");
const path = require("path");
const argv = yargs(hideBin(process.argv)).default("env", process.env.ENV).argv;

require("dotenv").config({
  path: path.resolve(__dirname, "../.env." + argv.env),
});

const define = {};
for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  loader: { ".ts": "ts", ".js": "js" },
  outfile: argv.outfile,
  watch: argv.watch
    ? {
        onRebuild(error, result) {
          if (error) console.error("watch build failed");
          else console.log("watch build succeeded");
        },
      }
    : false,
  define,
};

build(options).catch(() => process.exit(1));
