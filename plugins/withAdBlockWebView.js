const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function patchRNCWebViewClient(projectRoot) {
  const webviewDir = path.join(
    projectRoot,
    'node_modules',
    'react-native-webview',
    'android',
    'src',
    'main',
    'java',
    'com',
    'reactnativecommunity',
    'webview'
  );

  const clientFile = path.join(webviewDir, 'RNCWebViewClient.java');
  const blockerFile = path.join(webviewDir, 'AdBlocker.java');

  if (!fs.existsSync(clientFile)) {
    console.warn(`[withAdBlockWebView] Could not find ${clientFile}`);
    return;
  }

  // 1. Copy AdBlocker.java into react-native-webview package if not present
  const sourceBlocker = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'java',
    'com',
    'iuc',
    'browser',
    'adblock',
    'AdBlocker.java'
  );

  if (fs.existsSync(sourceBlocker)) {
    let blockerCode = fs.readFileSync(sourceBlocker, 'utf-8');
    blockerCode = blockerCode.replace(
      /package com\.iuc\.browser\.adblock;/,
      'package com.reactnativecommunity.webview;'
    );
    fs.writeFileSync(blockerFile, blockerCode, 'utf-8');
  }

  // 2. Inject shouldInterceptRequest in RNCWebViewClient.java
  let contents = fs.readFileSync(clientFile, 'utf-8');

  const methodToInject = `
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request == null || request.getUrl() == null || request.isForMainFrame()) {
            return super.shouldInterceptRequest(view, request);
        }
        if (AdBlocker.isEnabled && AdBlocker.isAdUrl(request.getUrl().toString())) {
            return AdBlocker.createEmptyResponse();
        }
        return super.shouldInterceptRequest(view, request);
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        if (AdBlocker.isEnabled && url != null && AdBlocker.isAdUrl(url)) {
            return AdBlocker.createEmptyResponse();
        }
        return super.shouldInterceptRequest(view, url);
    }
`;

  if (!contents.includes('AdBlocker.isEnabled')) {
    const classDefRegex = /public class RNCWebViewClient extends WebViewClient \{(\r?\n)/;
    if (classDefRegex.test(contents)) {
      contents = contents.replace(
        classDefRegex,
        `public class RNCWebViewClient extends WebViewClient {$1${methodToInject}`
      );
      fs.writeFileSync(clientFile, contents, 'utf-8');
      console.log('[withAdBlockWebView] Injected shouldInterceptRequest into RNCWebViewClient.java');
    }
  }
}

if (require.main === module) {
  patchRNCWebViewClient(process.cwd());
}

module.exports = function withAdBlockWebView(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      patchRNCWebViewClient(config.modRequest.projectRoot);
      return config;
    },
  ]);
};
