import { inject } from "vue";
/**
 * 取得所有圖層名稱
 * @returns {string[]} 圖層名稱陣列
 */
export const useGetAllLayersNames = () => {
  const evalScript = inject("evalScript");
  const getAllLayersNames = async () => {
    return await new Promise((resolve) => {
      evalScript(
        `(function() {
        var layers = app.project.activeItem.layers;
        var names = [];
        for (var i = 1; i <= layers.length; i++) {
          names.push(layers[i].name);
        }
        return names;
      })()`,
        (result) => {
          resolve(result.split(","));
        }
      );
    });
  };
  return { get: getAllLayersNames };
};
