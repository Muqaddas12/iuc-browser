// Intelligent Night Mode Inversion script that inverts bright backgrounds while protecting media

export const NIGHT_MODE_CSS = `
  html {
    filter: invert(90%) hue-rotate(180deg) !important;
    background: #121212 !important;
  }
  img, picture, video, iframe, canvas, svg, [style*="background-image"] {
    filter: invert(100%) hue-rotate(180deg) !important;
  }
`;

export const getNightModeScript = (enabled: boolean) => `
(function() {
  var existingStyle = document.getElementById('uc-night-mode-style');
  if (${enabled}) {
    if (!existingStyle) {
      var style = document.createElement('style');
      style.id = 'uc-night-mode-style';
      style.textContent = \`${NIGHT_MODE_CSS}\`;
      document.head ? document.head.appendChild(style) : document.documentElement.appendChild(style);
    }
  } else {
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle);
    }
  }
})();
true;
`;

