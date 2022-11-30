const fs = require('fs');
const path = require('path');
const http = require('http'); // or 'https' for https:// URLs
const https = require('https'); // or 'https' for https:// URLs
const { exec, spawn, execSync } = require('child_process')


// Clear the old output before HTML Link Extraction
execSync('rm -rf output_files');
execSync('mkdir output_files');

// Get the list of all website HTMLs from /website folder
let files = execSync('ls websites/').toString().trim().split('\n');
files.forEach((f,i) => {
  //  Read each websites content and process all the links
  // console.log(f)
  setTimeout( ()=> {read_website(f)}, 5000*i)
})


function create_folders(sitename) {
  // create the folder and files
  let sitepath = `${__dirname}/output_files/${sitename}`;
  fs.mkdir(path.join(sitepath), (err) => {
    // const newfiles = ["commented", "links", "scripts", "scripts2", "scripts_embedded", "embedded_css","inline_styles", "images", "videos", "images_background"]
    // newfiles.forEach(f => fs.writeFileSync(`./output_files/${sitename}/${f}`, ``));
    fs.copyFile(`./websites/${sitename}`, `./output_files/${sitename}/original.html`, (err) => {if (err) throw err;}); 
    fs.mkdir(path.join(sitepath, 'downloaded_css'), (err) => {})
    fs.mkdir(path.join(sitepath, 'downloaded_js'), (err) => {})
    fs.mkdir(path.join(sitepath, 'media'), (err) => {})
    fs.mkdir(path.join(sitepath, 'extracted_info'), (err) => {
      const newfiles = ["commented", "links", "scripts", "scripts2", "scripts_embedded", "embedded_css","inline_styles", "images", "videos", "images_background"]
      newfiles.forEach(f => fs.writeFileSync(`./output_files/${sitename}/extracted_info/${f}`, ``));  
    })
  })
}


function read_website(sitename) {
  
  console.log('==> ' + sitename);
  try {
    let data = fs.readFileSync('./websites/' + sitename, 'utf8');

    const extractLinks = (tagStart, tagEnd, outputfile = null) => {
        let tagsList = [];
        while (data.includes(tagStart) && data.includes(tagEnd)){
          let start = data.indexOf(tagStart)
          let end = data.indexOf(tagEnd, start + 1)
          let tagLine = data.substring(start, end + tagEnd.length)
          data = data.replace(tagLine, '')
          if (tagStart == 'style="'){
              tagLine = tagLine.replace(/style=\"/g, '')
              tagLine = tagLine.replace(/\"/g, '')
          }
          if (outputfile) {
              let target = outputfile;
              if (tagLine.includes('<script') && outputfile!= 'commented'){
                  if((tagLine.includes(' src=') || tagLine.includes(' href="')) && !tagLine.includes(';')){
                    target = 'scripts';
                    }
                  else {
                    target = 'scripts_embedded'; 
                    tagLine = tagLine + '\n\n'; 
                  }
              }
              fs.appendFileSync(`./output_files/${sitename}/extracted_info/${target}`, `${tagLine}\n`)
              if(['links', 'scripts', 'images', 'images_background', 'videos'].indexOf(target) > -1) {
              // if(target == 'links' || target == 'scripts') {
                  tagsList.push(tagLine)
              }
          }
      }
        return  tagsList;
      }

    const process_all_links = () => {
        let commentsList = extractLinks('<!--', '-->', 'commented');     // remove comments 
        let images_bk = extractLinks('background-image: url(', ')', 'images_background')
        let linkedFiles = extractLinks('<link', '>', 'links');  // Get Linked Files 
        let scriptsList = extractLinks('<script ', '</script>', 'scripts');    // Get scripts 
        let scriptsList2 = extractLinks('<script ', '>', 'scripts2'); // Get scripts 
        let embeddedScripts = extractLinks('<script', '</script>', 'scripts_embedded'); // Get Linked Files 
        let cssStyles = extractLinks('<style', '</style>', 'embedded_css');    // Get inline styles
        let stylesList = extractLinks('style="', '\"', 'inline_styles');    // Get inline styles
        let images = extractLinks('<img ', '>', 'images')
        let video = extractLinks('<video ', '>', 'videos')
        fs.writeFileSync(`./output_files/${sitename}/extracted_info/htmlcode.html`, `${data}\n`)
    }
    
    create_folders(sitename)

    setTimeout(process_all_links, 2000);

    } catch (err) {
      console.error(err);
    }

}
