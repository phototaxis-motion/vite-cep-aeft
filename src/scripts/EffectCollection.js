export const getCurrentSelectedEffects = `
try {
  (function() {
    // 獲取當前選中的圖層
    var selectedLayers = app.project.activeItem.selectedLayers;

    // 檢查是否有選中的圖層
    if (selectedLayers.length === 0) {
      alert("請先選擇圖層中的效果");
    } else {
      // 獲取第一個選中的圖層
      var layer = selectedLayers[0];

      // 獲取圖層的效果
      var selectedProperties = layer.selectedProperties;
      var effects = layer.property("ADBE Effect Parade");

      // 檢查圖層是否有效果
      if (effects.numProperties === 0) {
        alert("當前圖層沒有效果");
      } else {
        // 檢查是否有選中的效果
        if (selectedProperties.length === 0) {
          alert("請先選擇一個效果");
        } else {
          // 初始化一個對象來存儲效果數據
          var effectsData = [];
          var isNoEffect = true;
          // 遍歷選中的所有效果
          for (var i = 0; i < selectedProperties.length; i++) {
            var currentProperty = selectedProperties[i];
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

              // 存儲屬性值
              if (property.propertyValueType !== PropertyValueType.NO_VALUE) {
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
  '' + e;
}
`;

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
      alert("已將效果數據應用到選中的圖層");
    }
  }
} catch (e) {
  'Error:' + e;
};
`;
