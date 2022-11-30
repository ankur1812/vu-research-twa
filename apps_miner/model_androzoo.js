const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let androzoo = new Schema(
  {
    sha256: {type: String},
    sha1: {type: String},
    md5: {type: String},
    dex_date: {type: Date},
    apk_size: {type: String},
    pkg_name: {type: String},
    vercode: {type: String},
    vt_detection: {type: String},
    vt_scan_date: {type: String},
    dex_size: {type: String},
    markets: {type: String},
  },
  { collection: "apps_collection" }
);

module.exports = mongoose.model("androzoo", androzoo);
