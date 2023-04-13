/**
 * 找到 EffectsStorageComp 名為 EffectsStorageComp 的 CompItem
 * 若沒有則創建一個
 */
const scriptGetEffectStorageComp = `(function () {
  var project = app.project;
  var effectsStorageComp = null;
  for (var i = 1; i <= project.numItems; i++) {
      var item = project.item(i);
      if (item instanceof CompItem && item.name === "EffectsStorageComp") {
          effectsStorageComp = item;
          break;
      }
  }
  if (!effectsStorageComp) {
    effectsStorageComp = project.items.addComp("EffectsStorageComp", 1920, 1080, 1, 1, 1);
  }
  return effectsStorageComp;
})()`;

/**
 * 找到 EffectsStorage 名為 EffectsStorage 的 FolderItem
 * 若沒有則創建一個
 */
const scriptGetEffectStorageFolder = `(function () {
  var project = app.project;
  var effectsStorageFolder = null;
  for (var i = 1; i <= project.numItems; i++) {
      var item = project.item(i);
      if (item instanceof FolderItem && item.name === "EffectsStorage") {
          effectsStorageFolder = item;
          break;
      }
  }
  if (!effectsStorageFolder) {
      effectsStorageFolder = project.items.addFolder("EffectsStorage");
  }
  return effectsStorageFolder;
})()`;

/**
 * 初始化 EffectsStorageComp
 * 將 EffectsStorageComp 移動到 EffectsStorage 文件夾中
 * 若 EffectsStorageComp 已經在 EffectsStorage 文件夾中則不做任何操作
 */
const initEffectStorageComp = `(function () {
  var project = app.project;
  var effectsStorageComp = ${scriptGetEffectStorageComp};
  var effectsStorageFolder = ${scriptGetEffectStorageFolder};

  // if comp is not in folder, move it to folder
  if (effectsStorageComp.parentFolder !== effectsStorageFolder) {
    effectsStorageComp.parentFolder = effectsStorageFolder;
  }
})()`;

/**
 * 取得 EffectsStorage 中，名稱為 inputLayerName 的圖層
 */
const getScriptGetEffectStorageLayerByName = (inputLayerName) => `
(function() {
  ${initEffectStorageComp};
  var comp = ${scriptGetEffectStorageComp};
  var layer = comp.layer('${inputLayerName}');
  return layer;
})()
`;

/**
 * 取得當前選中的圖層的效果數據 JSON 字符串
 * @param {*} layersArray 只會取得第一個圖層的效果
 * @param {*} defaultProperties 預設為圖層的選中效果
 * @returns {string} 效果數據陣列的JSON字符串
 */
const getEffectsJsonByLayersArray = (
  layersArray,
  defaultProperties = "layer.selectedProperties"
) => `
try {
  (function() {
    // 獲取當前選中的圖層
    var selectedLayers = ${layersArray};

    // 檢查是否有選中的圖層
    if (selectedLayers.length === 0) {
      alert("請先選擇圖層中的效果");
    } else {
      // 獲取第一個選中的圖層
      var layer = selectedLayers[0];

      // 獲取圖層的效果
      var properties = ${defaultProperties};
      var effects = layer.property("ADBE Effect Parade");

      // 檢查圖層是否有效果
      if (effects.numProperties === 0) {
        alert("當前圖層沒有效果");
      } else {
        // 檢查是否有選中的效果
        if (properties.length === 0) {
          alert("請先選擇一個效果");
        } else {
          // 初始化一個對象來存儲效果數據
          var effectsData = [];
          var isNoEffect = true;
          // 遍歷選中的所有效果
          for (var i = 0; i < properties.length; i++) {
            var currentProperty = properties[i];
            if (!currentProperty.isEffect) {
              continue;
            }
            isNoEffect = false;
            var effect = effects.property(currentProperty.name);
            var effectData = {
              name: effect.name,
              matchName: effect.matchName,
              children: [],
            };

            // 遍歷效果的所有屬性
            for (var j = 1; j <= effect.numProperties; j++) {
              var property = effect.property(j);

              // 存儲屬性值 CUSTOM_VALUE
              if (property.propertyValueType !== PropertyValueType.NO_VALUE && property.propertyValueType !== PropertyValueType.CUSTOM_VALUE ) {
                effectData.children.push({
                  name: property.name,
                  value: property.value,
                  matchName: property.matchName,
                });
              }
            }

            // 將效果數據添加到效果數據對象中
            effectsData.push(effectData);
          }
          if (isNoEffect) {
            alert("請先至少選擇一個效果");
            return;
          }
          // 將效果數據對象轉換為JSON字符串
          var effectsDataJSON = JSON.stringify(effectsData, null, 2);
          return effectsDataJSON;
        }
      }
    }
  })()
} catch (e) {
  'Error:' + e;
}
`;

// ----------------------------------------------export----------------------------------------------

/**
 * 確認當前選擇的Effects中，不包含任何CUSTOM_VALUE的屬性
 */
export const checkSelectedLayerEffectHasNoCustomValue = `
(function() {
  var layer = app.project.activeItem.selectedLayers[0];
  var effects = layer.property("ADBE Effect Parade");
  var selectedEffect = [];
  for (var i = 1; i <= effects.numProperties; i++) {
    var effect = effects.property(i);
    if (effect.selected) {
      selectedEffect.push(effect);
    }
  }
  for (var i = 0; i < selectedEffect.length; i++) {
    var effect = selectedEffect[i];
    for (var j = 1; j <= effect.numProperties; j++) {
      var property = effect.property(j);
      if (PropertyType.PROPERTY !== property.propertyType) {
        for (var k = 1; k <= property.numProperties; k++) {
          var subProperty = property.property(k);
          if (subProperty.propertyValueType === PropertyValueType.CUSTOM_VALUE) {
            return false;
          }
        }
      } else if (property.propertyValueType === PropertyValueType.CUSTOM_VALUE) {
        return false;
      }
    }
  }
  return true;
})()
`;

/**
 * 取得當前選中的效果，輸出陣列為 JSON 字符串
 * @returns {string} 效果數據陣列的JSON字符串
 * @example effectsData = [{
 *  name: "CC Radial Blur",
 *  matchName: "CC Radial Blur",
 *  children: [{
 *    name: "Amount",
 *    value: 0,
 *    matchName: "CC Radial Blur-0001"
 *  }]
 * }]
 */
export const getCurrentSelectedEffects = getEffectsJsonByLayersArray(
  "app.project.activeItem.selectedLayers"
);

/**
 * 將JSON字符串轉換為效果數據對象，並將效果數據對象應用到當前選中的圖層
 * @param string inputString JSON 字符串
 */
export const setCurrentSelectedEffectsByString = (inputString) => `
try {
  // 獲取當前選中的圖層
  var selectedLayers = app.project.activeItem.selectedLayers;
  var scriptInputString = '${inputString}';
  // 檢查是否有選中的圖層
  if (selectedLayers.length === 0) {
    alert("請先選擇一個或多個圖層");
  } else {

    if (!scriptInputString) {
      alert("輸入的效果數據為空");
    } else {

      // 將JSON字符串轉換為效果數據對象
      var effectsData = JSON.parse(scriptInputString); // Array

      // 遍歷選中的所有圖層
      for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        // 獲取圖層的效果
        var effects = layer.property("ADBE Effect Parade");

        // 遍歷effectsData
        for (var j = 0; j < effectsData.length; j++) {
          var effectData = effectsData[j];
          var newEffect = effects.addProperty(effectData.matchName);
          newEffect.name = effectData.name;
          // progress

          for (var k = 0; k < effectData.children.length; k++) {
            var propertyData = effectData.children[k];
            var property = newEffect.property(propertyData.name);
            
            if (property.name === "Compositing Options") {
              continue;
            }
            if (property.propertyValueType !== PropertyValueType.NO_VALUE) {
              property.setValue(propertyData.value);
            }
          }
        }
      }
      // alert("已將效果數據應用到選中的圖層");
    }
  }
} catch (e) {
  'Error:' + e;
};
`;

/**
 * 取得在 EffectsStorage 中 layer 名稱為 inputLayerName 的效果，輸出陣列為 JSON 字符串
 * 若 inputLayerName 的圖層不存在，則輸出空陣列
 */
export const getEffectsJsonByLayerName = (inputLayerName) =>
  getEffectsJsonByLayersArray(
    `(function() {
      ${initEffectStorageComp};
      var comp = ${scriptGetEffectStorageComp};
      var layer = comp.layer('${inputLayerName}');
      if (layer) {
        return [layer];
      } else {
        return [];
      }
    })()`, // 只有一個圖層的陣列
    `(function(layer) {
      // return all effect properties from this layer
      var effect = layer.property("ADBE Effect Parade");
      var properties = [];
      for (var i = 1; i <= effect.numProperties; i++) {
        // avoid "Compositing Options" && CUSTOM_VALUE
        if (effect.property(i).name === "Compositing Options" || effect.property(i).propertyValueType === PropertyValueType.CUSTOM_VALUE) {
          continue;
        }
        properties.push(effect.property(i));
      }
      return properties;
    })(layer)` // 指定 Properties 為這個圖層的[所有效果]
  );

/**
 * 取得在 EffectsStorage 所有有Effect的Layer的名稱
 */
export const scriptGetEffectStorageLayerNames = `
(function() {
  ${initEffectStorageComp};
  var comp = ${scriptGetEffectStorageComp};
  var layerNames = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if (layer.Effects.numProperties > 0) {
      layerNames.push(layer.name);
    }
  }
  return JSON.stringify(layerNames, null, 2);;
})()
`;

/**
 * 複製layer名稱為 inputLayerName 的圖層的效果到當前選中的圖層
 */
export const getScriptCopyEffectsByLayerName = (inputLayerName) => `
try {
  (function() {
    var effectSourceComp = ${scriptGetEffectStorageComp};
    var effectSourceLayer = ${getScriptGetEffectStorageLayerByName(
      inputLayerName
    )};
    var currentItem = app.project.activeItem;
    var saveCurrentLayer = currentItem.selectedLayers[0];

    if (!saveCurrentLayer || !effectSourceLayer) {
      alert("請先選擇一個圖層");
      return;
    }

    // 選取效果來源圖層
    currentItem.selected = false;
    effectSourceComp.selected = true;
    effectSourceComp.openInViewer();
    // Blur all selected layers 
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
    if (effectSourceComp) {
      // effectSourceComp.numLayers
      for (var i = 1; i <= effectSourceComp.numLayers; i++) {
        var layer = effectSourceComp.layer(i);
        layer.selected = false;
        var effect = layer.property("ADBE Effect Parade");
        deselectProperties(effect);
      }
    }
   
    // alert("取消選取效果");

    // 選取效果
    var sourceEffects = effectSourceLayer.property("ADBE Effect Parade");
    function traverseProperties(propertyGroup, callback) {
      for (var i = 1; i <= propertyGroup.numProperties; i++) {
        var property = propertyGroup.property(i);
        callback(property);
        if (property.propertyType === PropertyType.NAMED_GROUP) {
          traverseProperties(property, callback);
        }
      }
    }
    traverseProperties(sourceEffects, function(property) {
      property.selected = true;
    });

    // alert("複製前請先確認效果來源圖層是否正確");
    app.executeCommand(app.findMenuCommandId("Copy"));

    // 回到原來的圖層
    effectSourceComp.selected = false;
    currentItem.openInViewer();
    saveCurrentLayer.property("Effects").selected = true;
    // alert("請確認當前選中的圖層是否正確");
    app.executeCommand(app.findMenuCommandId("Paste"));

    // alert("已將效果複製到當前選中的圖層");
  })()
} catch (e) {
  'Error:' + e;
  alert(e);
};
`;

/**
 * 複製當前選中的圖層的效果到，並新增一個圖層，名稱為 inputLayerName 到 EffectsStorageComp 中，並將效果貼上
 * @param {string} inputLayerName 圖層名稱
 */
export const getScriptCopyCurrentLayerEffectsToNewLayer = (inputLayerName) => `
try {
  (function() {
    ${initEffectStorageComp};
    var comp = ${scriptGetEffectStorageComp};
    var saveCurrentLayer = app.project.activeItem.selectedLayers[0];
    var currentComp = app.project.activeItem;

    if (!saveCurrentLayer) {
      alert("請先選擇一個圖層");
      return;
    }
  
    // 複製當前圖層的效果
    var sourceEffects = saveCurrentLayer.property("ADBE Effect Parade"); // selected all
    var hasEffect = false;
    for (var i = 1; i <= sourceEffects.numProperties; i++) {
      var effProp = sourceEffects.property(i);
      if (effProp.name === "Compositing Options") {
        continue;
      }
      if (effProp.selected) {
        hasEffect = true;
      }
    }
    if (!hasEffect) {
      alert("請先選擇一個效果");
      return;
    }

    // Start Copy
    app.executeCommand(app.findMenuCommandId("Copy"));

    // 跳出選取效果 Blur all selected layers 
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
    
    // effectSourceComp.numLayers
    for (var i = 1; i <= sourceEffects.numProperties; i++) {
      var property = sourceEffects.property(i);
      if (property.propertyType === PropertyType.INDEXED_GROUP || property.propertyType === PropertyType.NAMED_GROUP) {
        deselectProperties(property);
      } else {
        property.selected = false;
      }
    }

    // 新增一個圖層
    var effectsStorageComp = ${scriptGetEffectStorageComp};
    effectsStorageComp.openInViewer();
    var newLayer = effectsStorageComp.layers.addNull();
    newLayer.name = "${inputLayerName}";
    // Blur all effectsStorageComp selected layers && property
    for (var i = 1; i <= effectsStorageComp.numLayers; i++) {
      var layer = effectsStorageComp.layer(i);
      layer.selected = false;
      var effect = layer.property("ADBE Effect Parade");
      deselectProperties(effect);
    }
    
    // 貼上效果
    newLayer.selected = true;
    newLayer.property("Effects").selected = true;
    app.executeCommand(app.findMenuCommandId("Paste"));  

    // 回到原來的圖層
    newLayer.selected = false;
    effectsStorageComp.selected = false;
    currentComp.selected = true;
    currentComp.openInViewer();

  })()
} catch (e) { 'Error:' + e; }
`;

/**
 * 刪除 EffectsStorageComp 中名為 inputLayerName 的圖層
 * @param {string} inputLayerName 圖層名稱
 */
export const getScriptDeleteLayerInEffectsStorageComp = (inputLayerName) => `
try {
  (function() {
    ${initEffectStorageComp};
    var comp = ${scriptGetEffectStorageComp};
    var layer = comp.layer("${inputLayerName}");
    if (layer) {
      layer.remove();
    }
  })()
} catch (e) { 'Error:' + e; }
`;
