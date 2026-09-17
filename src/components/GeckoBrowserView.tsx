import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  ViewStyle,
  NativeSyntheticEvent
} from 'react-native';

interface NativeGeckoProps {
  url?: string;
  desktopMode?: boolean;
  trackingProtection?: boolean;
  injectedJavaScript?: string;
  style?: ViewStyle;
  onEnginePageStarted?: (event: NativeSyntheticEvent<{ url: string }>) => void;
  onEnginePageFinished?: (
    event: NativeSyntheticEvent<{
      url: string;
      title: string;
      canGoBack: boolean;
      canGoForward: boolean;
    }>
  ) => void;
  onEngineProgress?: (event: NativeSyntheticEvent<{ progress: number }>) => void;
  onEngineTitle?: (event: NativeSyntheticEvent<{ title: string; url: string }>) => void;
  onAdBlocked?: (event: NativeSyntheticEvent<{ url: string; reason: string; source?: string }>) => void;
  onNewWindow?: (event: NativeSyntheticEvent<{ url: string }>) => void;
  onDownloadRequested?: (event: NativeSyntheticEvent<{ url: string; contentLength?: number; contentType?: string }>) => void;
}

const NativeUCWebEngineView = requireNativeComponent<NativeGeckoProps>('UCWebEngineView');

export interface GeckoBrowserRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  stopLoading: () => void;
  evaluateJavascript: (script: string) => void;
}

export interface GeckoBrowserProps {
  url: string;
  desktopMode?: boolean;
  trackingProtection?: boolean;
  injectedJavaScript?: string;
  style?: ViewStyle;
  onNavigationStateChange?: (navState: {
    url: string;
    title: string;
    canGoBack: boolean;
    canGoForward: boolean;
    loading: boolean;
  }) => void;
  onLoadStart?: (url: string) => void;
  onLoadEnd?: (url: string) => void;
  onProgress?: (progress: number) => void;
  onTitleChange?: (title: string, url: string) => void;
  onAdBlocked?: (event: { url: string; reason: string; source?: string }) => void;
  onNewWindow?: (url: string) => void;
  onDownloadRequested?: (event: { url: string; contentLength?: number; contentType?: string }) => void;
}

export const GeckoBrowserView = forwardRef<GeckoBrowserRef, GeckoBrowserProps>(
  (
    {
      url,
      desktopMode = false,
      trackingProtection = true,
      injectedJavaScript,
      style,
      onNavigationStateChange,
      onLoadStart,
      onLoadEnd,
      onProgress,
      onTitleChange,
      onAdBlocked,
      onNewWindow,
      onDownloadRequested
    },
    ref
  ) => {
    const nativeRef = useRef<any>(null);

    const dispatchCommand = (commandName: string, commandId: number, args: any[] = []) => {
      const handle = findNodeHandle(nativeRef.current);
      if (handle) {
        if (UIManager.dispatchViewManagerCommand) {
          UIManager.dispatchViewManagerCommand(handle, commandName, args);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      goBack: () => dispatchCommand('goBack', 1),
      goForward: () => dispatchCommand('goForward', 2),
      reload: () => dispatchCommand('reload', 3),
      stopLoading: () => dispatchCommand('stopLoading', 4),
      evaluateJavascript: (script: string) => dispatchCommand('evaluateJavascript', 5, [script])
    }));

    return (
      <NativeUCWebEngineView
        ref={nativeRef}
        url={url}
        desktopMode={desktopMode}
        trackingProtection={trackingProtection}
        injectedJavaScript={injectedJavaScript}
        style={style}
        onEnginePageStarted={(e) => {
          onLoadStart?.(e.nativeEvent.url);
          onNavigationStateChange?.({
            url: e.nativeEvent.url,
            title: '',
            canGoBack: false,
            canGoForward: false,
            loading: true
          });
        }}
        onEnginePageFinished={(e) => {
          const { url: finalUrl, title, canGoBack, canGoForward } = e.nativeEvent;
          onLoadEnd?.(finalUrl);
          onNavigationStateChange?.({
            url: finalUrl,
            title,
            canGoBack,
            canGoForward,
            loading: false
          });
        }}
        onEngineProgress={(e) => {
          onProgress?.(e.nativeEvent.progress);
        }}
        onEngineTitle={(e) => {
          onTitleChange?.(e.nativeEvent.title, e.nativeEvent.url);
        }}
        onAdBlocked={(e) => {
          onAdBlocked?.(e.nativeEvent);
        }}
        onNewWindow={(e) => {
          onNewWindow?.(e.nativeEvent.url);
        }}
        onDownloadRequested={(e) => {
          onDownloadRequested?.(e.nativeEvent);
        }}
      />
    );
  }
);
