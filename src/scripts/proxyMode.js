/**
 * @description 用來設定proxy的script
 */
export const activeProxyScript = `(function() {
var outputFolder = new Folder(app.project.file.path + '/proxy/');
if (!outputFolder.exists) { // 如果文件夹不存在，则创建
  outputFolder.create();
}

var searchStr = '_Clips';
var comps = app.project.items;
var count = {
  all: 0,
  exist: 0,
  notExist: 0
}
for (var i = 1; i <= comps.length; i++) {
  var comp = comps[i];

  if (comp instanceof CompItem && comp.name.indexOf(searchStr) !== -1) {
    try {
      count.all = count.all + 1;
      var file = new File(app.project.file.path + '/proxy/' + comp.name + ".mov");
      if (file.exists) {
        count.exist = count.exist + 1;
        comp.setProxy(file);
      } else {
        count.notExist = count.notExist + 1;
      }
    } catch (e) {
      alert(e);
    }
  }
}

return true;
})()
`;

export const deactiveProxyScript = `(function() {
if (!confirm("移除所有Clips的Proxy", false, "是否要移除所有Clips的Proxy？")) {
  return true;
}

var searchStr = '_Clips';
var comps = app.project.items;
var count = {
  all: 0
}

for (var i = 1; i <= comps.length; i++) {
  var comp = comps[i];
  if (comp instanceof CompItem && comp.name.indexOf(searchStr) !== -1) {
    count.all = count.all + 1;
    comp.setProxyToNone();
  }
}
if (count.all > 0) {
  // alert("共有 " + count.all + " Clips，已移除Proxy", "Proxy Clips");
} else {
  // alert("沒有任何Clips可以移除Proxy", "Proxy Clips");
}



return false;
})();`;

/**
 * @description 用來取得 `加 Clips comps 進 Render` 的 script
 * @param {*} settingName After Effects template setting name
 * @param {*} moduleName After Effects template module name
 * @returns {string} script
 */
export const getRenderScriptBySettings = (
  settingName,
  moduleName
) => `(function() {
  //指定要渲染的文件夹路径
  var outputFolder = new Folder(app.project.file.path + '/proxy');
  if (!outputFolder.exists) { // 如果文件夹不存在，则创建
    outputFolder.create();
  }

  //指定要搜索的 Composition 名称包含的字符串
  var searchStr = '_Clips';

  //获取 RenderQueue 对象
  var renderQueue = app.project.renderQueue;
  var render = app.project.renderQueue;
  var length = app.project.items.length;
  var count = 0;

  // alert("開始搜尋包含'" + searchStr + "'的Composition", "開始搜尋");

  // 遍历所有的 Composition
  for (var i = 1; i <= length; i = i + 1) {
    var comp = app.project.item(i);

    // 检查该项目是否为 Composition，名称是否包含搜索字符串
    if (comp instanceof CompItem && comp.name.indexOf(searchStr) !== -1) {
      count = count + 1;
      // 设置输出路径和文件名 Render settings
      var outputPath = outputFolder.fsName + "/" + comp.name + ".mov";
      var queueItem = render.items.add(comp);
      var file = new File(outputPath);
      var renderSettingTemplateName = '${settingName}';
      var outputModuleTemplateName = '${moduleName}';

      // 设置 queue Setting
      queueItem.applyTemplate(renderSettingTemplateName);
      queueItem.setSetting("Proxy Use", 1);

      // outputModule addjust
      var outputModule = queueItem.outputModule(1); // 第一個 outputModule
      outputModule.file = file;
      outputModule.applyTemplate(outputModuleTemplateName);

      // Check render setting
      var hasRenderSetting = false;
      for (var j = 0; j < queueItem.templates.length; j++) {
        if (queueItem.templates[j] == renderSettingTemplateName) {
          hasRenderSetting = true;
        }
      }
      if (!hasRenderSetting) {
        alert("沒有找到Render Setting Template: " + renderSettingTemplateName + " 請安裝AOM", "錯誤", true);
      }

      // Check output module
      var hasOutputModule = false;
      for (var j = 0; j < outputModule.templates.length; j++) {
        if (outputModule.templates[j] == outputModuleTemplateName) {
          hasOutputModule = true;
        }
      }
      if (!hasOutputModule) {
        alert("沒有找到Output Module Template: " + outputModuleTemplateName + " 請安裝AOM", "錯誤", true);
      }
    }
  }
  if (count == 0) {
    alert("沒有找到任何包含「_Clips」的Composition ！", "沒有找到");
  } else {
    // alert("共有 " + count + " Clips，已經加入Render Queue", "完成");
    count = 0;
  }

  // 遍历所有的 RenderQueueItem，警告移除重複的
  var duplicate = [];
  // from end
  for (var i = render.numItems; i >= 1; i--) {
    var item = render.item(i);
    for (var j = i - 1; j >= 1; j--) {
      var item2 = render.item(j);
      if (item.comp.dynamicLinkGUID == item2.comp.dynamicLinkGUID) {
        duplicate.push(item2);
      }
    }
  }

  // Remove duplicate
  if (duplicate.length > 0) {
    if (confirm("Render Queue有重複的Clips，是否要移除重複的？", true, "移除重複渲染")) {
      for (var i = 0; i < duplicate.length; i++) {
        duplicate[i].remove();
      }
    }
  }

  // Remove proxiedAlready from End
  var proxiedAlready = [];
  for (var i = 1; i <= render.numItems; i++) {
    var item = render.item(i);
    if (item.comp.proxySource != null) {
      proxiedAlready.push(item);
    }
  }
  if (proxiedAlready.length > 0) {
    if (!confirm("Yes: 重算所有Clips，No: 只算還沒有Proxy的", false, "是否要移除已經有Proxy的Clips？")) {
      for (var i = 0; i < proxiedAlready.length; i++) {
        proxiedAlready[i].remove();
      }
    } else {
      // remove proxy first
      for (var i = 0; i < proxiedAlready.length; i++) {
        proxiedAlready[i].comp.setProxyToNone();
      }
    }
  }

  // 将项目添加到渲染队列
  if (render.numItems > 0) {
    if (confirm("是否要開始渲染？", true, "Start Render")) {
      render.render();
    }
  } else {
    // alert("沒有任何Clips可以渲染！", "No Clips", true);
  }

})();`;

/**
 * 取得有多少個 Proxy
 */
export const getNumItemsProxy = `(function(){
  var comps = app.project.items;
  var count = 0;
  for (var i = 1; i <= comps.length; i++) {
    var comp = comps[i];
    if (comp instanceof CompItem && comp.proxySource != null) {
      count = count + 1;
    }
  }
  return count;
})();`;
