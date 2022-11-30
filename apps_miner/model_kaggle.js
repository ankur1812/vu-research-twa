const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// {
//   _id: ObjectId('6306a78c5d557ed7fdac3f5e'),
//   'App Name': 'Gakondo',
//   'App Id': 'com.ishakwe.gakondo',
//   Category: 'Adventure',
//   Rating: '0.0',
//   'Rating Count': '0',
//   Installs: '10+',
//   'Minimum Installs': '10',
//   'Maximum Installs': '15',
//   Free: 'True',
//   Price: '0',
//   Currency: 'USD',
//   Size: '10M',
//   'Minimum Android': '7.1 and up',
//   'Developer Id': 'Jean Confident Irénée NIYIZIBYOSE',
//   'Developer Website': 'https://beniyizibyose.tk/#/',
//   'Developer Email': 'jean21101999@gmail.com',
//   Released: 'Feb 26, 2020',
//   'Last Updated': 'Feb 26, 2020',
//   'Content Rating': 'Everyone',
//   'Privacy Policy': 'https://beniyizibyose.tk/projects/',
//   'Ad Supported': 'False',
//   'In App Purchases': 'False',
//   'Editors Choice': 'False',
//   'Scraped Time': '2021-06-15 20:19:35'
// }

let googleplaystore = new Schema(
  {
    'App Name': {type: String},
    'App Name': {type: String},
    'App Id': {type: String},
    Category: {type: String},
    Rating: {type: Number},
    'Rating Count': {type: Number},
    Installs: {type: String},
    'Minimum Installs': {type: Number},
    'Maximum Installs': {type: Number},
    Free: {type: Boolean},
    Price: {type: Number},
    Currency: {type: String},
    Size: {type: String},
    'Minimum Android': {type: String},
    'Developer Id': {type: String},
    'Developer Website': {type: String},
    'Developer Email': {type: String},
    Released: {type: String},
    'Last Updated': {type: String},
    'Content Rating': {type: String},
    'Privacy Policy': {type: String},
    'Ad Supported': {type: String},
    'In App Purchases': {type: String},
    'Editors Choice': {type: String},
    'Scraped Time': {type: Date},
  },
  { collection: "googleplaystore" }
);

module.exports = mongoose.model("googleplaystore", googleplaystore);
