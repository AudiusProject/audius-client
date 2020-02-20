import { resolve } from "path";
import preactSVGLoader from "preact-cli-svg-loader";
import envVars from "preact-cli-plugin-env-vars";

export default function(config, env, helpers) {

  // Use any `index` file, not just index.js
  config.resolve.alias["preact-cli-entrypoint"] = resolve(
    process.cwd(),
    "src",
    "index"
  );

  // Inject env vars
  envVars(config, env, helpers);

  // Vendored SVG fix
  // https://github.com/pmcalmeida/preact-cli-svg-loader/blob/master/src/index.js
  // Combined with fix for OTF fonts: https://github.com/preactjs/preact-cli/issues/774
  const urlLoader = helpers.getLoadersByName(config, "url-loader");
  urlLoader.map(
    entry =>
      (entry.rule.test = /\.(woff2?|ttf|otf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i)
  );
  const fileLoader = helpers.getLoadersByName(config, "file-loader");
  fileLoader.map(
    entry =>
      (entry.rule.test = /\.(woff2?|ttf|otf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i)
  );
  const rawLoader = helpers.getLoadersByName(config, "raw-loader");
  rawLoader.map(entry => (entry.rule.test = /\.(xml|html|txt|md)$/));
  config.module.rules.push({
    test: /\.svg$/,
    use: ["preact-svg-loader"]
  });

  // Set relative imports
  // https://github.com/preactjs/preact-cli/issues/279
  config.output.publicPath = "./";

  return config;
}
