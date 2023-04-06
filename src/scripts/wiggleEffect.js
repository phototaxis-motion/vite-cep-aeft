export default `
try {
  (function() {
    // 獲取當前選擇的圖層
    var selectedLayers = app.project.activeItem.selectedLayers;

    // 檢查是否有選擇圖層
    if (selectedLayers.length === 0) {
      return "請選擇一個圖層";
    } else {
      // 遍歷選擇的圖層
      for (var i = 0; i < selectedLayers.length; i++) {
        // 獲取當前圖層
        var layer = selectedLayers[i];

        // 檢查是否有選擇的屬性
        if (layer.selectedProperties.length === 0) {
          return "請選擇一個屬性";
        } else {
          // 為選擇的屬性添加wiggle表達式
          var selectedProperty = layer.selectedProperties[0];
          var selectedPropertyName = selectedProperty.name;

          // 為圖層添加振幅滑塊效果
          var amplitudeEffect = layer.Effects.addProperty("ADBE Slider Control");
          amplitudeEffect.name = "Wiggle " + selectedPropertyName + " Amplitude";
          amplitudeEffect.property("Slider").setValue(10);

          // 為圖層添加頻率滑塊效果
          var frequencyEffect = layer.Effects.addProperty("ADBE Slider Control");
          frequencyEffect.name = "Wiggle " + selectedPropertyName + " Frequency";
          frequencyEffect.property("Slider").setValue(1);


          // var wiggleExpression = "wiggle(effect('Frequency')('Slider'), effect('Amplitude')('Slider'));";
          var wiggleExpression = "wiggle(effect('Wiggle " + selectedPropertyName + " Frequency')('Slider'), effect('Wiggle " + selectedPropertyName + " Amplitude')('Slider'));";
          selectedProperty.expression = wiggleExpression;
        }
      }
    }
  })()
} catch (e) {
  e;
}
`;
