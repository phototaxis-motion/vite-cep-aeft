/**
 * 建立效果預設檔案
 * @param {*}
 * @returns
 */
export const PresetType = function ({
  name = "Untitled",
  filePath = "",
  description = "",
  id = "",
}) {
  return {
    name,
    filePath,
    description,
    id,
    active: false,
  };
};

export const checkFileExist = (filePath) => `
(function() {
  var file = File("${filePath}");
  var exist = file.exists;
  return exist;
})()
`;

/**
 * 取得檔案
 * @param {*} filePath
 * @returns File
 */
export const getFile = (filePath) => `
(function() {
  var file = File("${filePath}");
  if (!file.exists) {
    return false;
  }
  return file;
})()
`;

/**
 * 刪除檔案
 */
export const deleteFile = (filePath) => `
try {
  (function() {
    var file = File("${filePath}");
    if (!file.exists) {
      return true; // 檔案不存在，不用刪除
    }
    file.remove();
    return true;
  })();
} catch (e) {
  'Error: ' + e;
}
`;

/**
 * 取得使用者預設路徑
 * @returns Folder
 */
export const getUserPresetFolder = `(function() {
  var aeVersion = app.version.split(".")[0] > 20 ? "20" + app.version.split(".")[0] : app.version.split(".")[0];
  // 获取用户文档路径
  var userDocumentsFolder = Folder.myDocuments;
  var presetFolder = userDocumentsFolder.absoluteURI + "/Adobe/After Effects " + aeVersion + "/User Presets";
  if (!Folder(presetFolder).exists) {
    alert("錯誤: 找不到 User Presets 資料夾(" + presetFolder + ")");
    if (confirm("幫你建立 User Presets 資料夾？", false, "幫你建立 User Presets 資料夾？")) {
      Folder(presetFolder).create();
    }
  }
  return Folder(presetFolder);
})()
`;

const saveSelectedEffectsAsPreset = `
(function() {
  var comp = app.project.activeItem,
    layer = comp.selectedLayers[0],
    effects = layer.property("ADBE Effect Parade"),
    selectedEffect = [],
    selectedProperty = [];

  if (!comp || !(comp instanceof CompItem)) return alert("請選擇一個Comp。");
  if (comp.selectedLayers.length === 0 || comp.selectedLayers.length > 1) return alert("請選擇一個圖層。");

  for (var i = 1; i <= effects.numProperties; i++) {
    var effect = effects.property(i);
    if (effect.selected) {
      selectedEffect.push(effect);
    }
  }
  if (selectedEffect.length === 0) return alert("請選擇至少一個效果。");

  for (var i = 0; i < layer.selectedProperties.length; i++) {
    var property = layer.selectedProperties[i];
    if (!property.isEffect) selectedProperty.push(property);
  }
  
  if (selectedProperty.length > 0) alert("注意: 儲存的屬性中有非效果屬性。");

  app.executeCommand(app.findMenuCommandId("Save Animation Preset..."));
  return true;
})()
`;

/**
 * 匯出效果預設檔案到指定路徑(強制更改檔名到指定路徑)
 * @param {*} filePath
 * @returns
 */
export const exportEffectsPreset = (filePath) => `
try {
  (function() {
    var file = File("${filePath}");
    var folder = ${getUserPresetFolder};

    if (folder.absoluteURI !== file.parent.absoluteURI) {
      alert("filePath錯誤: 請存在 User Presets 的資料夾。");
      return;
    }

    var watchBefeforeFiles = folder.getFiles();
    var beforeFilesPair = [];
    for(var i = 0; i < watchBefeforeFiles.length; i++) {
      beforeFilesPair.push([watchBefeforeFiles[i].absoluteURI, watchBefeforeFiles[i].modified]);
    }
    if (!${saveSelectedEffectsAsPreset}) {
      return;
    }
    var watchAfterFiles = folder.getFiles();
    var newFile = null;
    var isReplace = false;

    if (beforeFilesPair.length !== watchAfterFiles.length) {
      for(var i = 0; i < watchAfterFiles.length; i++) {
        var hasSameFile = false;
        for(var j = 0; j < beforeFilesPair.length; j++) {
          if (watchAfterFiles[i].absoluteURI === beforeFilesPair[j][0]) {
            hasSameFile = true;
          }
        }
        if (!hasSameFile) {
          newFile = watchAfterFiles[i];
          break;
        }
      }
    } else { // Check modified
      for(var i = 0; i < watchAfterFiles.length; i++) {
        if (watchAfterFiles[i].modified > beforeFilesPair[i][1]) {
          newFile = watchAfterFiles[i];
          isReplace = true;
          break;
        }
      }
    }

    // alert(newFile);
    newFile.rename(file.name); // TODO: 覆蓋的問題可以提出
    return true;
  })()
} catch (e) {
  'Error:' + e;
}
`;

/**
 * 套用檔案路徑的Preset到當前選擇的圖層
 * 如果圖層超過一個，Confirm是否套用到所有選取的圖層
 */
export const applyPreset = (filePath) => `
try {
  (function() {
    var file = ${getFile(filePath)};
    if (!file) {
      alert("錯誤: 找不到檔案(" + "${filePath}" + ")");
      return;
    }
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
      alert("請選擇一個Comp。");
      return false;
    }
    if (comp.selectedLayers.length === 0) {
      alert("請選擇一個圖層。");
      return false;
    }
    if (comp.selectedLayers.length > 1) {
      if (!confirm("圖層超過一個，是否套用到所有選取的圖層？", false, "圖層超過一個，是否套用到所有選取的圖層？")) {
        return false;
      }
    }

    function deselectProperties(propertyGroup) {
      for (var i = 1; i <= propertyGroup.numProperties; i++) {
          var property = propertyGroup.property(i);

          if (property.selected) {
              property.selected = false;
          }

          if (property.propertyType === PropertyType.INDEXED_GROUP || property.propertyType === PropertyType.NAMED_GROUP) {
              deselectProperties(property);
          }
      }
    }

    for (var i = 0; i < comp.selectedLayers.length; i++) {
      var layer = comp.selectedLayers[i];
      deselectProperties(layer);
      layer.applyPreset(file);
    }

    return true;
  })()
} catch (e) {
  'Error:' + e;
}
`;
