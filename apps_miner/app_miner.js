const mongoose = require("mongoose");
const express = require("express");
const fs = require('fs');

const app = express();
const androzoo = require("./model_androzoo");
const googleplaystore = require("./model_kaggle");
const router = express.Router();
const port = 4000;

var uri = "mongodb://localhost:27017/vu_apps?authSource=admin";

mongoose.connect(uri, {});

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

const START_SERVER = false; // Set this to true to start the Node JS server directly and to use the APIs

if (START_SERVER) {
  app.use("/", router);
  
  app.listen(port, function() {
    console.log("Server is running on Port: " + port);
    console.log(new Date().toISOString())
  });

}


const process_results = (apps_list, result, category='') => {
  found = {};
  result.forEach(r => {
      curr = found[r.pkg_name];
      if(!curr) curr = r;
      // else if (new Date(curr.dex_date) < new Date(r.dex_date)) curr = r
      // else if (new Date(curr.vt_detection) >= new Date(r.vt_detection) && new Date(curr.vt_scan_date) <= new Date(r.vt_scan_date)) curr = r
      else if (curr.vercode < r.vercode) curr = r
      // else if (new Date(curr.vt_scan_date) < new Date(r.vt_scan_date)) curr = r
      // else if (new Date(curr.vt_detection) >= new Date(r.vt_detection)) curr = r
      found[r.pkg_name] = curr;
  })
  newres = []
  for (let r in found) { newres.push(found[r])}
  console.log('Found ' + newres.length + ' / ' + result.length );

  let missed = [];
  apps_list.forEach(a => {if (!found[a]) missed.push(a);})
  console.log('Missed ', missed.length)
  console.log(missed.toString());
  if (category) {
    console.log("Androzoo data found for category. Saving to CSV")
    save_SHA_to_CSV(newres, category)
    save_missed_apks(missed, category)
  }
  else {
    console.log("Androzoo data found. Not saving to CSV!")
  }
  return newres

}

function save_SHA_to_CSV(result, category) {
  excel = `./output/androzoo_${category}.csv`
  columns = '_id,pkg_name,sha256,sha1,md5,dex_date,apk_size,vercode,vt_detection,vt_scan_date,dex_size,markets'
  let newFile = true;
  save_to_csv(excel, result, columns, newFile)
}

function save_missed_apks(apks, category) {
  data = apks.map(a => {return {pkg_name: a, category}})    
  save_to_csv('./output/not_found.csv', data, 'pkg_name,category', false)
}


function save_to_csv(excel, data, columns_string, newFile = true) {
  if (newFile) {
    fs.writeFileSync(excel, `${columns_string}, \n`)
    // console.log('Write file' , excel,  ' with columns ', columns_string)

  } 
  columns = columns_string.split(',')
  data.forEach(a => {
    row_string = '';
    columns.forEach(c => row_string += `${a[c]},`)
    fs.appendFileSync(excel, `${row_string}\n`)
  })
  console.log(`${newFile? 'Created' : 'Updated'} ${excel}`)
}

START_SERVER && router.route("/get-androzoo-apps/:id_list").get(get_SHAs_from_app_ids);

function get_SHAs_from_app_ids(req, res) {
  let apps_list;
  if (req.params.id_list) {
    apps_list = req.params.id_list.split(',')
  }
  let category = req.params.category
  // console.log('category ', category)
  console.log(`SHA search begin @ ` + new Date().toISOString());
  androzoo.find({
      'pkg_name': { $in: apps_list}
  }).sort('-vt_scan_date').exec(function(err, result) {
    console.log('Search end @ ' + new Date().toISOString());
    if (err) {
      console.log('error ');
      res.send(err);
    } else {
      // res.send(result)
      console.log('for category ', category)
      res.send(process_results(apps_list, result, category))
    }
  });
}

  // router.route("/google-play-apps").get(function(req,res) {
  //   console.log('Playstore apps begin @ ' + new Date().toISOString());
  //   // googleplaystore.find({'App Id': 'com.ishakwe.gakondo'})
  //   googleplaystore.find({
  //       'Category': { $in: ['Adventure']}
  //   })
  //   .sort('-Maximum Installs')
  //   .allowDiskUse(true).exec(function(err, result) {
  //     if (err) {
  //       console.log('error '  + JSON.stringify(err) +  '*** @ ' + new Date().toISOString());
  //       res.send(err);
  //     } else {
  //       res.send(result)
  //       // result.forEach((a) => {
  //       //   lastChar = a.Installs[a.Installs.length - 1]
  //       //   if (lastChar == '+') a.downloads = a.Installs.slice(0, a.Installs.length - 1)
  //       //   else if (lastChar == '+') a.downloads = a.Installs.slice(0, a.Installs.length - 1)
  //       //   a.downloads = parseInt(a.downloads);

  //       // })
  //       // res.send(process_results(result))
  //     }
  //   });
  // });


START_SERVER && router.route("/google-play-category/:cat").get(fetchCategoryData);

function fetchCategoryData(req,res) {
  cat = req.params.cat;
  console.log('Playstore app search begin *' + cat + '* @ ' + new Date().toISOString());
  googleplaystore.find({
    'Category': cat,
    'Maximum Installs': { $nin: [0, '0']}
  })
  .sort('-Maximum Installs')
  .allowDiskUse(true).exec(function(err, result) {
    if (err) {
      console.log('error '  + JSON.stringify(err) +  '*** @ ' + new Date().toISOString());
      res.send(err);
    } else {
      excel = `./output/top_500_${result[0].Category}.csv`
      fs.writeFileSync(excel, `appID, appName,rating,max_installs,category\n`)

      result = result.filter(a => a['Maximum Installs'] > 0)
      result = result.sort((a,b) => b['Maximum Installs'] - a['Maximum Installs'])
      console.log(result.length + ' fetched')
      result = result.slice(0, 500);
      result.forEach(a => {
        a['App Name'] = a['App Name'].replace(',', ';')
        fs.appendFileSync(excel, `${a['App Id']},${a['App Name']},${a['Rating']},${a['Maximum Installs']},${a['Category']}\n`)
      })
      
      res.send(result)
    }
  });
}
START_SERVER && router.route("/google-play-category/:cat").get(fetchCategoryData);


// Get DISTINCT CATEGORIES
function get_playstore_categories(req,res) {
  console.log('Playstore apps categories begin @ ' + new Date().toISOString());
  // googleplaystore.find({'App Id': 'com.ishakwe.gakondo'})
  googleplaystore.find().distinct('Category', function(error, results) {
    // ids is an array of all ObjectIds
    console.log(results.length + ' fetched')
    console.log(results)
    res.send(results);
  });
}
START_SERVER && router.route("/google-play-categories/all").get(get_playstore_categories);


function fetch_all_apps_with_sha(){
  console.log('** Fetching CSV Data **');
  let catlist = [

    // // "Action",// "Adventure",// "Arcade",
    // "Art & Design",
    // "Auto & Vehicles",
    // "Beauty",
    // // "Board",
    // "Books & Reference",
    // "Business",
    // // "Card",// "Casino",// "Casual",
    // "Comics",
    // "Communication",
    // "Dating",


    "Education",
    // "Educational",
    "Entertainment",
    "Events",
    "Finance",
    "Food & Drink",
    "Health & Fitness",
    "House & Home",
    "Libraries & Demo",
    "Lifestyle",
    "Maps & Navigation",
    "Medical",
    // "Music",
    "Music & Audio",
    "News & Magazines",
    "Parenting",
    "Personalization",
    "Photography",
    "Productivity",
    // "Puzzle",
    // "Racing",
    // "Role Playing",
    "Shopping",
    // "Simulation",
    "Social",
    "Sports",
    // "Strategy",
    "Tools",
    "Travel & Local",
    // "Trivia",
    "Video Players & Editors",
    "Weather",
    // "Word"
  ]

  catlist = ['Education', "News & Magazines", "Lifestyle"]
  
  console.log(`Fetching apps from ${catlist.length} categories`)
  let i=0;
  let intv;
  const mine_top_apps = () => {
    c = catlist[i]
    if (i++ == catlist.length) {
      console.log('All categories fetched');
      clearInterval(intv);
      console.log('Ending operation');
      return 0;
    }
    fetchCategoryData({params: {cat: c}}, {send: (results) => {
      console.log('*** CSV generated for ' + results[0].Category )
      pkg_list = results.map( a => a['App Id'])

      req = { params: {category: results[0].Category, id_list: pkg_list.join(',')}}
      res = {send : (a) => {console.log('\n*** Fetching SHAs for the apps')}}
      get_SHAs_from_app_ids(req, res);
  }})
  }
  intv = setInterval(mine_top_apps, 150000 )
}

// Call function to automatically feth all apps:
!START_SERVER && fetch_all_apps_with_sha()