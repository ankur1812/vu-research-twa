import matplotlib.pyplot as plt
import numpy as np
import json
import sys

plt.style.use('_mpl-gallery-nogrid')

def read_json(src = ''):
  if(src == 'latest'):
   f = open('../website_scrapper/results.json')
  elif(src == 'thesis-data'):
    f = open('../thesis_data/results.json')
  jsonData = json.load(f)# list
  f.close()
  return jsonData

def get_KB_size_from_str(str):
  str = str.upper() # contver str to uppercase
  if('MB' in str): size = (float(str.split('MB')[0])) * 1024 
  elif('KB' in str): size = float(str.split('KB')[0]) 
  else: size = float(str.split('BYTE')[0])
  return round(size,2)


def manual_analysis_data ():
  csv_data =  open('../thesis_data/ajax_media_info.csv').readlines()
  csv_data.remove(csv_data[0]) # remove header row
  jsonInfo_manual = {}
  for line in csv_data:
    l = line.split(',')
    url = l[1].replace('https://', '').replace('http://', '').replace('www.', '')
    url = url.split('/')[0]
    data = {
      "website": url,
      "js": {
        "total": {
          "ajaxCalls": 0,
          "xmlHttpCalls": int(l[2]),
        }
      },
      "media_info": {
        "total": {
          "count": l[4],
          "size": get_KB_size_from_str(l[5])
        },
      }
    }
    if (not url == 'freegameshub.net'):
      jsonInfo_manual[url] = data
  return jsonInfo_manual
  
jsonInfo_manual = manual_analysis_data()
# print(jsonInfo_manual)


def update_table(dict, key, value):
  try: dict[key].append(value)
  except: dict[key] = [value]


# permissions_dict = {}
# app_dict = {}
# def read_csv(appsInfo, permsInfo, pkg_arr, perm_arr):
#   # print('hello')
#   pkg_arr = []
#   perm_arr = []
#   appLines =  open('_twa_targets2.csv').readlines()
#   appLines.remove(appLines[0])
#   total_apps = len(appLines) - 1
#   for index in range(len(appLines)):
#     # print('hell2o')
#     l = appLines[index]
#     info = l.split(',')
#     # if( not info[0] == 'pkg_name'):
#     if( True):
#       # print('hell2o')
#       permissions = info[2].split(';')
#       total_perm = len(permissions)
#       name = info[0]
#       pkg_arr.append(name)
#       # print(name + " " + str(len(permissions)))

#       for i in range(len(permissions)):
#         p= permissions[i]
#         if(p == "\"INTERNET"): p = "INTERNET"
#         elif(p.count("\"")> 0): p = p.split("\"")[0]
#         elif(p.count("com.google.android")> 0): p = p.split("com.google.android")[1]
#         # update_table(permissions_dict, p, name)
#         if (not p == ""):
#           update_table(appsInfo, name, p)
#           update_table(permsInfo, p, name)

#   perm_arr = []
#   for i in permsInfo: 
#     perm_arr.append(i)
  
#   matrix = []
#   for i in range(len(pkg_arr)):
#     pkg = pkg_arr[i]
#     pkg_row = []
#     for j in range(len(perm_arr)):
#       pkg_row.append(0)
#     matrix.append(pkg_row)

#   for i in range(len(pkg_arr)):
#     pkg = pkg_arr[i]
#     pkg_row = []
#     for j in range(len(perm_arr)):
#       perm = perm_arr[j]
#       try:
#         if(appsInfo[pkg].count(perm)> 0):
#           matrix[i][j] = 1
#       except: a = 1
#   # return matrix
#   return {'packages': pkg_arr, 'permissions': perm_arr , 'matrix': [], 'appsDict': appsInfo, 'permsDict': permsInfo}
#   # return {'packages': pkg_arr, 'permissions': perm_arr , 'matrix': matrix, 'appsDict': appsInfo, 'permsDict': permsInfo}



# appsInfo = {}
# permsInfo = {}
# perm_table = []
# pkg_arr = []
# perm_arr = []

# csv_data  = read_csv(appsInfo, permsInfo, pkg_arr, perm_arr)
# # print(str(csv_data['matrix']) +  '\n\nhellow')
# # print( '\n\nhellow')
# # print(str(csv_data['permsDict']) +  '\n\nhellow')

# permsCount = {}
# for p in csv_data['permsDict']:
#   permsCount[p] = len(csv_data['permsDict'][p])

# print(str(len(csv_data['permissions']))  + ' permissions')
# # print(str(csv_data['permissions']))

# print('Saving to twa_permissions.json!')
# with open('twa_permission.json', 'w') as f:
#     json_object = json.dumps(csv_data, indent = 2) 
#     f.write(str(json_object))



# # with open('permissions_matrix.csv', 'w') as f: 
# #     f.write('*,')
# #     for i in range(len(csv_data['permissions'])):
# #       f.write(csv_data['permissions'][i] + ',')
# #     for j in range(len(csv_data['packages'])):
# #       f.write('\n' + csv_data['packages'][j] + ',')
# #       for k in range(len(csv_data['permissions'])):
# #         value = 'x,' if csv_data['matrix'][j][k] ==1 else ','
# #         f.write(value)









  

def new_barchart_data(title="", yLabel="", category= []) :
  return {
  "title": title,
  "yLabel": yLabel,
  "labels": [],
  "category": category,
  "rects": [[], [], []]
  }


def barplots(data, saveFile = ''):
  x = np.arange(len(data['labels']))  # the label locations
  width = 0.35  # the width of the bars
  singleData = False
  if(len(data['rects'][1]) == 0):
    singleData = True
  fig, ax = plt.subplots()
  if (singleData):
    rects1 = ax.bar(x, data['rects'][0], width, label=data['category'][0])
  else:
    rects1 = ax.bar(x - width/3, data['rects'][0], width/3, label=data['category'][0])
    rects2 = ax.bar(x , data['rects'][1], width/3, label=data['category'][1])
    rects3 = ax.bar(x + width/3, data['rects'][2], width/3, label=data['category'][2])

  ax.set_ylabel(data['yLabel'])
  ax.set_title(data['title'])
  ax.set_xticks(x, data['labels'])
  ax.legend()
  ax.bar_label(rects1, padding=3)
  if (not singleData):
    ax.bar_label(rects2, padding=3)
    ax.bar_label(rects3, padding=3)

#   for i in range(len(data['rects'])): 
#        print(data['groups'][i])
#        rect = ax.bar(x + width/(i+1), data['rects'][i], width, label=data['groups'][i])
#        ax.bar_label(rect, padding=3)
#     ax.bar_label(data['rects'][i], padding=3)

  fig.tight_layout()
  # plt.tick_params(
  #   axis='x',          # changes apply to the x-axis
  #   which='both',      # both major and minor ticks are affected
  #   bottom=False,      # ticks along the bottom edge are off
  #   top=False,         # ticks along the top edge are off
  #   labelbottom=False) # labels along the bottom edge are off
  ax.axes.yaxis.set_ticklabels([])

  # plt.yticks(color='w')

  plt.xticks(rotation = 60)
#   if (saveFile != ''): plt.savefig(saveFile,bbox_inches='tight',dpi=100)

  plt.show()


def analyze_external_links(jsonData, type='js', action = ''):
  title = 'Javascript' if type == 'js' else 'CSS'
  data = {
  "title": title,
  "yLabel": "Size (KB)",
  "labels": [],
  "category": ["Embedded", "Internal", "External"],
  "rects": [[],[],[]]
  }
  external_links = []
  external_links_count = {}
  listname = 'scripts' if type == 'js' else 'links'
  for site in jsonData:
    for link in jsonData[site][type][listname]:
       
      if(not link['internal'] or link['url'].count('jquery')> 0):
        external_links.append(link['url'])
        try:
          external_links_count[link['url']] += 1
        except Exception as e:
          external_links_count[link['url']] = 1
       #  print ('external ' + link['url'])
      a = 1
#       print(str(external_links_count))
  for url in external_links_count:
       if (external_links_count[url]> 1):
         print(url + ": " + str(external_links_count[url]))
  print("total external links " + str(len(external_links)))
      
#   print(str(data))
#   barplots(data, 'jsCharts.png')

def getSizeinKB(i, js_css, type, loc_or_size):
  # if (js_css == 'media_info'): return jsonData[i][js_css][type]
  if (loc_or_size == 'loc'): return round(jsonData[i][js_css][type]['loc'])
  return round(jsonData[i][js_css][type]['size']/1024, 2)

def process_js_css(jsonData, type='js', action = ''):
  title = 'JavaScript' if type == 'js' else 'CSS' if type == 'css' else 'Media'
  yLabel = 'Size (KB)' 
  data = new_barchart_data(title, yLabel, ["Embedded", "Internal", "External"])
  size_loc_key = 'size'
  if (action == 'showLoc'):
    data['yLabel'] = 'LOC' 
    size_loc_key = 'loc'
  for i in jsonData:
    if(action == 'showPercentage' ):
       data['yLabel'] = "Size (%)"
       data['category'] = ["External JS"] if type == 'js' else ["External CSS"]
       codePercentage= round(jsonData[i][type]['external'][size_loc_key]*100/jsonData[i][type]['total'][size_loc_key], 2)
       data["rects"][0].append(codePercentage)
    else:
      embedded = getSizeinKB(i, type, 'embedded', size_loc_key)
      internal = getSizeinKB(i, type, 'internal', size_loc_key)
      external = getSizeinKB(i, type, 'external', size_loc_key)
      data["rects"][0].append(embedded)
      data["rects"][1].append(internal)
      data["rects"][2].append(external)
      
    data["labels"].append(i)
#   print(str(data))
  barplots(data, 'jsCharts.png')

def analyze_counts(jsonData, countKey = ''):
  type=''
  title = '' 
  category = ''
  yLabel = 'Size (KB)'
  if (countKey == 'ajaxCalls'): 
       type='js'
       title = 'Ajax/HTTP Calls'
       category = ['Ajax & xmlHttp Calls']
  if (countKey == 'anim_keyframes'): 
       type='css'
       title = 'CSS Animations'
       category = ['Keyframes']
  if (countKey == 'href'): 
       type='html'
       title = 'Href Navigation'
       category = ['Anchor Tags']
  if (countKey == 'forms'): 
       type='html'
       title = 'Input Forms'
       category = ['Forms']
  if (countKey == 'input'): 
       type='html'
       title = 'Input Boxes'
       category = ['Inputs']
  if (countKey == 'htmlsize'): 
       type='html'
       title = 'HTML content'
       category = ['HTML']
  if (countKey == 'mediaSize'): 
       type='media_info'
       title = 'Media'
       yLabel = 'Size (MB)'
       category = ['Images/Videos']
  data = new_barchart_data(title, yLabel, category)
  for site in jsonData:
    count = 0
    data["labels"].append(site)
    if (countKey == 'htmlsize'): 
       count = jsonData[site]['html']['size']/(1024)
    elif (type == 'html'): 
       print (str(jsonData[site]))
       count = jsonData[site][type]['info'][countKey]
    elif (countKey == 'mediaSize'): 
       count = jsonData[site]['media_info']['total']['size']/(1024)
    elif (countKey == 'ajaxCalls'): 
       sitedata = jsonData[site]['js']['total']
       count = sitedata['ajaxCalls'] + sitedata['xmlHttpCalls']
    else:
      listname = 'scripts' if type == 'js' else 'links'
      for link in jsonData[site][type][listname]:
        # if (countKey == 'ajaxCalls'):  
        #  count+= link['ajaxCalls'] + link['xmlHttpCalls']
        if (countKey == 'anim_keyframes'): 
         count+= link['anim_keyframes']
       #   if (link[countKey]) : print(str(link[countKey]) + " " + countKey + " in " + link["url"] )
    data["rects"][0].append(count)
#   print(str(data))
  barplots(data, 'jsCharts.png')


def vizualize_inputs(jsonData, type='html', action = ''):
  data = new_barchart_data('Form Inputs', 'Count', ["Inputbox", "Dropdown", "Textarea"])
  for i in jsonData:
    inputbox = jsonData[i]['html']['info']['input']
    dropdown = jsonData[i]['html']['info']['select']
    textarea = jsonData[i]['html']['info']['textArea']
    data["rects"][0].append(inputbox)
    data["rects"][1].append(dropdown)
    data["rects"][2].append(textarea)
    data["labels"].append(i)
  barplots(data, 'jsCharts.png')



# def barchart():
#   x = [1, 2, 3, 4]
#   colors = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(x)))
#   fig, ax = plt.subplots()
#   ax.pie(x, colors=colors, radius=3, center=(4, 4),
#     wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#   ax.set(xlim=(0, 8), xticks=np.arange(1, 8),
#     ylim=(0, 8), yticks=np.arange(1, 8))
#   plt.show()
# # barchart()
  

def boxplot():
  np.random.seed(10)
  data = np.random.normal(100, 20, 200) 
  fig = plt.figure(figsize =(10, 7))
  plt.boxplot(data) 
  plt.show()
# boxplot()

def viz_perms(permsCount):
  data = new_barchart_data('Permissions Requested', 'Apps', ['Permissions'])
  for p in permsCount:
    count = permsCount[p] 
    if (count > 6):
      data["labels"].append(p)
      data["rects"][0].append(count)
  print(str(data))
  barplots(data, 'jsCharts.png')

# viz_perms(permsCount)


type = 'js'
# type = 'css'
option = 'showPercentage'
# process_js_css(jsonData, type, option)
# process_js_css(jsonData, 'js')
# process_js_css(jsonData, 'js', 'showLoc')
# process_js_css(jsonData, 'css', 'showPercentage')
# process_js_css(jsonData, 'css')
# process_js_css(jsonData, 'media_info', 'count')

# analyze_counts(jsonData, 'ajaxCalls')
# analyze_counts(jsonData, 'anim_keyframes')
# analyze_counts(jsonData, 'htmlsize')
# analyze_counts(jsonData, 'forms')
# analyze_counts(jsonData, 'input')

# analyze_counts(jsonInfo_manual, 'mediaSize')
# analyze_counts(jsonInfo_manual, 'ajaxCalls')

# vizualize_inputs(jsonData)




if (sys.argv[1] == 'thesis-data') : jsonData = read_json('thesis-data') # Don't show latest data
elif (sys.argv[1] == 'latest') : jsonData = read_json('latest') #  show latest data
else: print('Incorrect arguments: arg1 should be either thesis-data or latest' )

if (sys.argv[2] == 'js'): process_js_css(jsonData, 'js')
elif (sys.argv[2] == 'js-loc'): process_js_css(jsonData, 'js', 'showLoc')
elif (sys.argv[2] == 'js-percent'): process_js_css(jsonData, 'js', 'showPercentage')
elif (sys.argv[2] == 'css'): process_js_css(jsonData, 'css')
elif (sys.argv[2] == 'css-percent'): process_js_css(jsonData, 'css', 'showPercentage')
elif (sys.argv[2] == 'html'): analyze_counts(jsonInfo_manual, 'htmlsize')
elif (sys.argv[2] == 'forms'): analyze_counts(jsonInfo_manual, 'forms')
elif (sys.argv[2] == 'css-animations'): analyze_counts(jsonInfo_manual, 'anim_keyframes')
elif (sys.argv[2] == 'ajax'): analyze_counts(jsonInfo_manual, 'ajaxCalls')
elif (sys.argv[2] == 'media'): analyze_counts(jsonInfo_manual, 'mediaSize')
