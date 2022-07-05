"use strict";

const path = require("path");
const {newConfigBuilder} = require("webpack-config-builder");
const pathBuild = path.resolve(__dirname, "build");

const externals = {
    react: "React",
};

module.exports = newConfigBuilder()
    .withCss("index.css")
    .withReact()
    .withExternals(externals)
    .asLibrary("umd", "extension")
    .compile("web", "/src/index.ts", pathBuild, "index.js");