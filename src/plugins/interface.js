import CSInterface, { Version } from "@/assets/CSInterface";

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
export default {
  install: (app, options) => {
    app.config.globalProperties.$interface = new CSInterface();
  },
};
