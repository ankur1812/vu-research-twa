# sh clear.sh
echo "> node extract_links.js  @ " $(date -u) 
echo ""
node extract_links.js
echo ">node download_links_analyze @ " $(date -u) 
node download_links_analyze.js
rm wgetlogs.txt