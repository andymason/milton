export const enum STAGES {
  CHOOSE_FRAMES,
  RESPONSIVE_PREVIEW,
  SAVE_OUTPUT,
}

export const enum MSG_EVENTS {
  FOUND_FRAMES,
  NO_FRAMES,
  RENDER,
  CLOSE,
  ERROR,
  UPDATE_HEADLINES,
  COMPRESS_IMAGE,
  GET_ROOT_FRAMES,
  RENDER_EMBED_HTML,
  RENDER_IFRAME_HTML,
}

export const enum OUTPUT_FORMATS {
  INLINE,
  IFRAME,
}

export const enum ERRORS {
  MISSING_FRAMES,
  MULTIPLE_SAME_WIDTH,
  UNKNOWN,
}

export const UI_TEXT = {
  ERROR_UNEXPECTED: "Unexpected error",
  ERROR_MISSING_FRAMES: "No frames found. Please add some frames to the page",
  WARN_NO_TARGETS: "Standard frames not found. Please select target frames",
  WARN_TOO_MANY_TARGETS: "Please select three target frames",
  INFO_PREVIEW: "Preview each frame output",
  TITLE_CHOOSE_FRAME: "Choose which frames to export",
  TITLE_PREVIEW: "Preview",
  TITLE_RESPONSIVE_PREVIEW: "Responsive preview",
  TILE_OUTPUT: "Export",
  BUTTON_NEXT: "Next",
  BUTTON_DOWNLOAD: "Download",
  BUTTON_PREVIOUS: "Back",
  ERRORS: {
    [ERRORS.MISSING_FRAMES]:
      "No frames found. Please add a frame and try again",
    [ERRORS.MULTIPLE_SAME_WIDTH]:
      "Some frames have the same width. All frame widths need to be different",
    [ERRORS.UNKNOWN]: "Unknown error",
  },
};

export const FRAME_WARNING_SIZE = 300;

export const enum HEADLINE_NODE_NAMES {
  HEADLINE = "headline",
  SUBHEAD = "subhead",
  SOURCE = "source",
}
