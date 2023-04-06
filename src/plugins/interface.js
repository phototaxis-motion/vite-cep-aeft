import CSInterface, { Version } from "@/assets/CSInterface";
import createObjectByString from "@/utils/createObjectByString";
import { ref } from "vue";

export default {
  install: (app, options) => {
    const csInterface = new CSInterface();

    // current selected items
    const currentSelectedItems = ref("Test");
    const updateCurrentSelectedItems = () => {
      try {
        csInterface.evalScript(
          `
        // ECMAScript 3
        (function() {
          var items = [];
          for(var i = 0; i < app.project.selection.length; i++) {
            items.push(
              "{" 
                +"name: '" + app.project.selection[i].name + "', "
                +"type: '" + app.project.selection[i].typeName + "', "
              +"}");
          }
          return items.join(", ");
        })();
        `,
          (res) => {
            currentSelectedItems.value = createObjectByString(res);
          }
        );
      } catch (e) {
        // alert(e);
      }
    };
    window.addEventListener("resize", () => {
      updateCurrentSelectedItems();
      // get window size
      csInterface.evalScript(
        `(function () {
        var panelWidth, panelHeight;
    
        if (this instanceof Panel) {
            panelWidth = this.size[0];
            panelHeight = this.size[1];
        } else {
            panelWidth = this.window.bounds.width;
            panelHeight = this.window.bounds.height;
        }
    
        return [panelWidth, panelHeight];
    })()`,
        (res) => {}
      );
    });

    // inject
    app.provide("evalScript", csInterface.evalScript);
    app.provide("currentSelectedItems", currentSelectedItems);
    app.provide("updateCurrentSelectedItems", updateCurrentSelectedItems);
  },
};

// hostEnvironment
// getHostEnvironment
// closeExtension
// getSystemPath
// evalScript
// getApplicationID
// getHostCapabilities
// dispatchEvent
// addEventListener
// removeEventListener
// requestOpenExtension
// getExtensions
// getNetworkPreferences
// initResourceBundle
// dumpInstallationInfo
// getOSInformation
// openURLInDefaultBrowser
// getExtensionID
// getScaleFactor
// setScaleFactorChangedHandler
// getCurrentApiVersion
// setPanelFlyoutMenu
// updatePanelMenuItem
// setContextMenu
// setContextMenuByJSON
// updateContextMenuItem
// isWindowVisible
// resizeContent
// registerInvalidCertificateCallback
// registerKeyEventsInterest
// setWindowTitle
// getWindowTitle
