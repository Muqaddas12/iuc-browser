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
}

const NativeUCWebEngineView = requireNativeComponent<NativeGeckoProps>('UCWebEngineView');

export interface GeckoBrowserRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  stopLoading: () => void;
}

export interface GeckoBrowserProps {
  url: string;
  desktopMode?: boolean;
  trackingProtection?: boolean;
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
}

export const GeckoBrowserView = forwardRef<GeckoBrowserRef, GeckoBrowserProps>(
  (
    {
      url,
      desktopMode = false,
      trackingProtection = true,
      style,
      onNavigationStateChange,
      onLoadStart,
      onLoadEnd,
      onProgress
    },
    ref
  ) => {
    const nativeRef = useRef<any>(null);

    const dispatchCommand = (commandName: string, commandId: number) => {
      const handle = findNodeHandle(nativeRef.current);
      if (handle) {
        if (UIManager.dispatchViewManagerCommand) {
          UIManager.dispatchViewManagerCommand(handle, commandName, []);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      goBack: () => dispatchCommand('goBack', 1),
      goForward: () => dispatchCommand('goForward', 2),
      reload: () => dispatchCommand('reload', 3),
      stopLoading: () => dispatchCommand('stopLoading', 4)
    }));

    return (
      <NativeUCWebEngineView
        ref={nativeRef}
        url={url}
        desktopMode={desktopMode}
        trackingProtection={trackingProtection}
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
          onNavigationStateChange?.({
            url: e.nativeEvent.url,
            title: e.nativeEvent.title,
            canGoBack: false,
            canGoForward: false,
            loading: false
          });
        }}
      />
    );
  }
);

