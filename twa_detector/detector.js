const fs = require('fs');
const { exec, spawn, execSync } = require('child_process')

const APIKEY='a422a804c1aa7c5085a09214425722ca0a08aa968f6867feca52eb2556baacd8'
categoryCSVs = execSync('ls ../AppsList | grep androzoo').toString().trim().split('\n')

execSync(`echo "sha,pkg_name,permissions,detected" > TWAs.csv`);

const executeShell = (str) => {
    try {execSync(str);}
    catch { }
}

const detectTWA = (SHA) => {
    let manifest = fs.readFileSync(`./${SHA}/AndroidManifest.xml`, 'utf8').toString().trim();
    let app_name, app_permissions = []
    TWAKeywords = [
        // 'com.google.androidbrowserhelper.trusted.LauncherActivity',
        'com.google.androidbrowserhelper.trusted',
        'android.support.customtabs.trusted',
        'com.google.androidbrowserhelper.launchtwa'
    ]
    manifest.split('\n').forEach(l => {
        l = l.replace(/\'/g, '\"').replace(/= /g, '=').replace(/ =/g, '=')
        if (l.indexOf('package=') > -1) {
            app_name = (l.split('package=')[1]).split('\"')[1]
        }
        if (l.indexOf('<uses-permission android:name="') > -1){
            let perms = (l.split('<uses-permission android:name="')[1].replace('android.permission.', '').replace('"/>', ''));
            app_permissions.push(perms)
        }
    })
    let hasTWA = TWAKeywords.some(k => (manifest.indexOf(k) > -1) ) 
    if(hasTWA) {
        console.log('--> Found TWA :  ' + app_name)
        fs.appendFileSync("TWAs.csv", `${SHA}, ${app_name},${app_permissions.join(';')},\n`)
    }
    return hasTWA
}

categoryCSVs.forEach((cat,i) => {
    let apk_list;
    try {
        apk_list = fs.readFileSync(`../AppsList/${cat}`, 'utf8').toString().trim().split('\n');
    }
    catch {console.log ('Cannot find Android Manifest')}
    apk_list = apk_list.slice(1)
    category_nam = cat.split('.csv')[0].split('_')[1]
    console.log('Category: ' + category_nam)
    apk_list.forEach((apk_info, j) => {
        // check = apk_info.includes('pinterest') || apk_info.includes('twitt3er') || apk_info.includes('sharechat')
        // if (check){ // #### Delete this check
        let apk_values = apk_info.split(',')
        let sha = apk_values[2]
        let app_name = apk_values[1]
        console.log(`${j} ${app_name} (${sha})`)

        executeShell(`curl -O --remote-header-name -G -d apikey=${APIKEY} -d sha256=${sha} \https://androzoo.uni.lu/api/download
        `)
        executeShell(`apktool d ${sha}.apk`);
        isTWA = detectTWA(sha)
        // execSync(`node analyze_dex.js ${sha}`)
        executeShell(`rm ${sha}.apk`);
        // if(!isTWA) executeShell(`rm -rf ${sha}`);
        setTimeout( () => {
            executeShell(`rm -rf ${sha}`);
        }, 5000)

        // } // #### Delete this 

    })
})
console.log('------\nTWA Detection is completed. Results saved in TWAs.csv')

