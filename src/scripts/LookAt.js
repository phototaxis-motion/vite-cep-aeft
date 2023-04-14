const LAYER_CONTROL_NAME = "Look At Layer";

/**
 * (exp) layer 新增 Layer Control
 */
const addLayerEffect = (layerExp) => `
(function(layer) {
  if (!layer.Effects.property("${LAYER_CONTROL_NAME}")) {
    layer.Effects.addProperty("ADBE Layer Control").name = "${LAYER_CONTROL_NAME}";
  }
  return layer.Effects.property("${LAYER_CONTROL_NAME}");
})(${layerExp})
`;

/**
 * (exp) 取得名稱為 layerName 的圖層的 index
 */
const getLayerIndex = (layerName) => `
(function(layerName) {
  var layerIndex = -1;
  for (var i = 1; i <= app.project.activeItem.numLayers; i++) {
    var layer = app.project.activeItem.layer(i);
    if (layer.name === layerName) {
      layerIndex = i;
      break;
    }
  }
  return layerIndex;
})("${layerName}")
`;

/**
 * 設定選擇的圖層的 Look At Layer 效果
 * @param {*} layerName Look At Layer 效果的目標圖層名稱
 * @returns {string} exp
 */
export const setSelectedLayersLookAtByName = (layerName) => `
try {
  (function() {
    var selectedLayers = app.project.activeItem.selectedLayers;
    var layerNameIndex = ${getLayerIndex(layerName)};
    
    if (layerNameIndex === -1) {
      return "Error: 找不到名稱為 ${layerName} 的圖層";
    } else if (selectedLayers.length === 0) {
      return "Error: 請選擇一個圖層";
    } else {
      for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        var effect = ${addLayerEffect("layer")};
        effect.property("ADBE Layer Control-0001").setValue(layerNameIndex);
        // set layer rotate expression
        layer.property("Rotation").expression = 'lookAt(position, effect("${LAYER_CONTROL_NAME}")("Layer").position)[1] + (Math.sign(lookAt(position, effect("${LAYER_CONTROL_NAME}")("Layer").position)[0]) < 0 ? (90 - lookAt(position, effect("${LAYER_CONTROL_NAME}")("Layer").position)[1])*2 : 0)';
      }
    }
    return "true";
  })()
} catch (e) {
  "Error: " + e;
}
`;
