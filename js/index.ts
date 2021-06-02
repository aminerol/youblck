const varsFile = require("./vars");
const preMainFile = require("./pre-main");
const interceptFile = require("./intercept");
const utilsFile = require("./utils");
const filterUtilsFile = require("./filter-utils");
const filterFile = require("./filter");
const mainFile = require("./main");

export const jsFiles = [
  varsFile,
  preMainFile,
  interceptFile,
  utilsFile,
  filterUtilsFile,
  filterFile,
  mainFile,
];
