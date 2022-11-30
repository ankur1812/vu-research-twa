const fs = require('fs');
const { execSync } = require('child_process');

const DELETE_MEDIA_FILES = false // set to true to delete media files after analysis


function is_internal(site, url){
  // This funciton checks if download URL is internal or to third-party library
  url  = url.replace('www.', '').replace('.com', '') 
  if(url.includes(site)) return true;
  if(url.includes(site.split('.')[0])) return true;
  // Add cdn servers for the target URLs mobile.twitter.com and abs.twimg.com
  if (site.includes('twitter.com') && url.count('abs.twimg.com') > 0) return true
  if (site.includes('pinterest.com') && url.count('pinimg.com') > 0); return true
  if (site == 'stg.xfinity.com' && url.count('xfinity') > 0) return true
  if (site == 'pwa.snagajob.com' && url.count('snagajob') > 0) return true
  return false  
}

let all_websites_info = {} // 
let failed_requests = []
let failed_requests_url = []

let stylesheets = []
let scripts = []
let media = []

String.prototype.count = function(a) {
  let str = new String(this)
  let count = 0;
  while (str.indexOf(a) > -1 && count < 10) {
      count++; 
      index = str.indexOf(a);
      str= str.substring(0, index) + str.substring(index + a.length)
  }
  return count;
}

function getFilesize(filename) {
  // get File size in bytes
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

const cached_copy =  (url, targetfile) =>  {
  let cachedUrl = url.replace('http://','').replace('https://','').replace(/\"/g, '')
  cachedUrl= cachedUrl.replace(/\//g, ':')
  let srcfile = `cached_downloads/${cachedUrl}`
  console.log('checking cached ==> fs.existsSync(srcfile) ' + (srcfile))
  if (fs.existsSync(srcfile)) return srcfile;
  return false;
}

function url_fixer(url, fromSite) {
  url = url.replace(/"/g, '').replace(/'/g, '').replace(/&quot;/g, '')
  if(url.startsWith('//'))
    url = 'https:' + url
  else if(url.startsWith('/./'))
  url = 'https://' + fromSite + url.substring(2)
    // url = 'https://' + fromSite + url[2: 1000000]
  else if(url.startsWith('/'))
    url = 'https://' + fromSite + url
  else if(url.split('/')[0].count('.') ==0 && url.split('/')[0].count('http') == 0)
    url = 'https://' + fromSite + '/' +  url
  else if(url.count('/') == 0)
    url = 'https://' + fromSite + '/' +  url
  return url;
}

function download_read(url, fromSite='N/A', targetfile = '', ismediafile = false) {
  // console.log(`<down> ${fromSite} : ${url}`)
  url = url_fixer(url, fromSite)
  execSync(`wget -O ${targetfile} -o wgetlogs.txt ${url}`)
  // console.log ('downloaded ' + targetfile)
  let size = getFilesize('./' + targetfile)
  if (ismediafile) {
    DELETE_MEDIA_FILES && setTimeout(()=> {
      console.log('DELETE file ' + targetfile)
      execSync(`rm ${targetfile}`)}, 1000)
    return {url: url, size: size}
  }
  let contents = ismediafile? '' : fs.readFileSync('./' + targetfile, 'utf8')
  loc = contents.count(';')
  let xmlHttpCalls = contents.count('new XMLHttpRequest(')
  let ajaxCalls = contents.count('$.ajax(')
  let css_selectors = contents.count('{')
  let anim_keyframes = contents.count('@keyframes') + contents.count('webkit-keyframes') 
  // # console.log(site.headers['Content-Length'])
  let contentLength = contents.length
  if (contents.startsWith('<html')) {
    failed_requests.push( {'url': url, 'targetfile': targetfile})
    failed_requests_url.push(url)
    return  { 'url': url, 'anim_keyframes': 0, 'css_selectors': 0, 'loc': 0, 'size': 0, 'contentLength': 0, 'xmlHttpCalls': 0, "ajaxCalls": 0}
  }

  info =  { 'url': url, 'anim_keyframes': anim_keyframes, 'css_selectors': css_selectors, 'loc': loc, 'size': size, 'contentLength': contentLength, 'xmlHttpCalls': xmlHttpCalls, "ajaxCalls": ajaxCalls}
  return info
}


const analyse = (fileName) => {
    let data = fs.readFileSync(fileName, 'utf8').split('\n');
    data.forEach( function(line, index) {
        if(!data[index].startsWith('<!--'))  {
          line = data[index].replace(/>/g, '').replace(/"/g, '').replace(/'/g, '')
          line = line.replace('</script', '')
          line = line.replace('</', '')
          line = line.replace('\n', '')
          attribs = {'rel': '', 'href': '', 'src': '', 'as': '', 'data-src': ''}
          attribvalues = line.split(' ')
          attribvalues.forEach(function(abcd, i) {
            let values = attribvalues[i]
            keyVal = values.split('=')
            if (keyVal.length >1 )
                if (keyVal[0] == 'href')
                    attribs['href'] = values.replace('href=', '');
                else if (keyVal[0] == 'src')
                    attribs[keyVal[0]] = values.replace('src=', '')
                else
                    attribs[keyVal[0]] = keyVal[1]
          })
          if ( (line.includes('<img ')) || line.includes('<video ')) {          
            if (attribs['data-src']!= '' && attribs['src'].startsWith('data:'))
              media.push(attribs['data-src'])
            else
              media.push(attribs['src'])
          }
          else if ( (line.includes('link') && attribs['rel'] == 'stylesheet') || line.includes('stylesheet'))
            stylesheets.push(attribs['href'])
          else if ( (line.includes('<script')))
            scripts.push(attribs['src'])
        }
      
    })
}

const data_extractor = (site, index) => {
  stylesheets = []
  media = []
  scripts = []
  css_info = []
  internal_css_info = []
  scripts_info = []
  internal_scripts_info = []

  console.log('\n===> ' +  site + "\n")
  site_dir = `./output_files/${site}`
  analyse(site_dir + '/extracted_info/links')
  analyse(site_dir + '/extracted_info/scripts')
  analyse(site_dir + '/extracted_info/scripts2')
  analyse(site_dir + '/extracted_info/images')
  analyse(site_dir + '/extracted_info/videos')
  
  htmlSize = getFilesize(site_dir+ '/extracted_info/htmlcode.html')
  embedded_js = getFilesize(site_dir+ '/extracted_info/scripts_embedded')
  embedded_css_size = getFilesize(site_dir+ '/extracted_info/embedded_css')
  inline_styles = getFilesize(site_dir+ '/extracted_info/inline_styles')

  htmlcode = fs.readFileSync(site_dir+ '/extracted_info/htmlcode.html', 'utf8');
  embedded_css_info = fs.readFileSync(site_dir+ '/extracted_info/embedded_css', 'utf8');
  embedded_js_code = fs.readFileSync(site_dir+ '/extracted_info/scripts_embedded', 'utf8');

  embedded_js_loc = embedded_js_code.count(';')
  embedded_xmlHttpCalls = embedded_js_code.count('new XMLHttpRequest(')
  embedded_ajax = embedded_js_code.count('$.ajax(')

  htmlInfo = {
    "forms": htmlcode.count('<form'),
    "anchors": htmlcode.count('href='),
    "href": htmlcode.count('href='),
    "select": htmlcode.count('<select'),
    "input": htmlcode.count('<input'),
    "textArea": htmlcode.count('<textarea'),
    "button": htmlcode.count('<button')
  }

  internal_css = 0; external_css = 0; total_css = embedded_css_size

  embedded__css = {
    'anim': embedded_css_info.count('@keyframes') + embedded_css_info.count('webkit-keyframe'),
    'css_selectors': embedded_css_info.count('{'),
    'size': embedded_css_size
  }
  internal__css = {'anim': 0, 'css_selectors': 0, 'size': 0}
  external__css = {'anim': 0, 'css_selectors': 0, 'size': 0}
  total__css = Object.assign({}, embedded__css)


  function js_object(loc=0, size=0, ajax=0, xmlHttp=0, el=0) {
    obj = {}
    obj["loc"] = loc
    obj["size"] = size
    obj["ajaxCalls"] = ajax
    obj["xmlHttpCalls"] = xmlHttp
    obj["eventListeners"] = el
    return obj
  }

  embedded_js = js_object(embedded_js_loc,embedded_js,embedded_ajax, embedded_xmlHttpCalls)
  internal_js = js_object(0,0,0,0)
  external_js = js_object(0,0,0,0)
  total_js = js_object(embedded_js_loc,embedded_js,embedded_ajax, embedded_xmlHttpCalls)
  
  total_js_size = embedded_js["size"]
  
  function get_targetfile(url, site_dir, i, foldername) {
    url = url.replace('https://', '').replace(/\//g, ':')
    console.log("<down> " + i + " " +  url.substring(0,200))
    scriptname = i + '_' + url.replace(/\//g, "\\").substring(0,125)
    targetfile = site_dir.substring(2)+ '/' + foldername + '/' + scriptname
    return targetfile
  }

  scripts.forEach((url, i) => {
    url = scripts[i]
    url = url.replace(/"/g, '').replace(/'/g, '');
    if (site_dir.includes('voyage-prive') && url.includes("<\\/script')"))
      url = url.split("<\\/script')")[0]
    targetfile = get_targetfile(url, site_dir, i, 'downloaded_js')
    if (!targetfile.endsWith('.js')) targetfile = targetfile + ".js"
    info = download_read(url, site, targetfile)
    info['internal'] = is_internal(site, url)
    size = info['size']
    if(size ==0) size = info['contentLength']
    if (info['internal']) {
      internal_js["loc"] += info["loc"]
      internal_js["size"] += size
      internal_js["ajaxCalls"] += info["ajaxCalls"]
      internal_js["xmlHttpCalls"] += info["xmlHttpCalls"]
    }
    else {
      external_js["loc"] += info["loc"]
      external_js["size"] += size
      external_js["ajaxCalls"] += info["ajaxCalls"]
      external_js["xmlHttpCalls"] += info["xmlHttpCalls"]
    }
    total_js['loc'] += info["loc"]
    total_js_size += size
    total_js["ajaxCalls"] += info["ajaxCalls"]
    total_js["xmlHttpCalls"] += info["xmlHttpCalls"]
    
    delete info.css_selectors
    delete info.anim_keyframes
    scripts_info.push(info)
  })
    
  total_js['size'] = total_js_size
  
  let media_info  = {
    "internal" : { "count": 0, "size": 0},
    "external" : { "count": 0, "size": 0},
    "total" : { "count": 0, "size": 0},
    "media": []
  }
  
  //  console.log('\n\n --- CSS & Styles --- ')
  stylesheets.forEach((url,i) => {
    targetfile = get_targetfile(url, site_dir, i, 'downloaded_css')
    if (!targetfile.endsWith('.css')) targetfile = targetfile + ".css"
    info = download_read(url, site, targetfile)
    info['internal'] = is_internal(site, info['url'])
    delete info.loc
    delete info.ajaxCalls
    delete info.xmlHttpCalls
    if(info['internal']) {
      internal__css['size'] += info['size']
      internal__css['anim'] += info['anim_keyframes']
      internal__css['css_selectors'] += info['css_selectors']
    }
    else {
      external__css['size'] += info['size']
      external__css['anim'] += info['anim_keyframes']
      external__css['css_selectors'] += info['css_selectors']
    }
    total__css['size'] += info['size']
    total__css['anim'] += info['anim_keyframes']
    total__css['css_selectors'] += info['css_selectors']
    css_info.push(info)
  })

  // console.log('\n\n --- Media --- ')
  media.forEach( (url, i) => {
    targetfile = get_targetfile(media[i], site_dir, i, 'media')
    info = download_read(media[i], site, targetfile, true)
    info['internal'] = is_internal(site, url)
    if(info['internal']) {
      media_info["internal"]["count"] += 1
      media_info["internal"]["size"] += info['size']
    }
    else {
      media_info["external"]["count"] += 1
      media_info["external"]["size"] += info['size']      
      }
    media_info["total"]["count"] += 1
    media_info["total"]["size"] += info['size']
    media_info["media"].push(info)
  })
  
  
  siteInfo = {
    "website": site,
    "html": {
      "size": htmlSize,
      "info": htmlInfo
    },
    "js": {
        "scripts": scripts_info,
        "embedded": embedded_js, 
        "internal": internal_js, 
        "external": external_js, 
        "total": total_js, 
    },
    "css": {
        "links": css_info,
        "inline_styles": inline_styles,
        "embedded": embedded__css,
        "internal": internal__css,
        "external": external__css,
        "total": total__css,
    },
    "media_info": media_info
  }

  all_websites_info[site] = siteInfo

  fs.writeFileSync('results.json', JSON.stringify(all_websites_info, null, 2));
  fs.writeFileSync('failed_requests.json', JSON.stringify(failed_requests, null, 2));
  console.log('\nSuccessful! Results saved in results.json. Failed Requests saved in file requests_failed.json\n');

}

let files = execSync('ls websites/').toString().trim().split('\n');
files.forEach((f,i) => {
  data_extractor(f)
})


