import { h, Component, createRef } from "preact";
import { saveAs } from "file-saver";
import { OUTPUT_FORMATS } from "../constants";
import { renderInline } from "../outputRender";
import type { FrameDataType, AppState } from "../ui";

interface SaveProps extends Pick<AppState, "source" | "headline" | "subhead"> {
  frames: FrameDataType[];
}

interface SaveState {
  advancedOpen: boolean;
  showToast: boolean;
  outputFormat: OUTPUT_FORMATS;
}

export class Save extends Component<SaveProps, SaveState> {
  state: SaveState = {
    advancedOpen: false,
    showToast: false,
    outputFormat: OUTPUT_FORMATS.INLINE,
  };

  private textAreaEl = createRef<HTMLTextAreaElement>();

  toggleAdvanced = () => {
    this.setState({
      advancedOpen: !this.state.advancedOpen,
    });
  };

  saveToClipboard = () => {
    const { current: el } = this.textAreaEl;

    if (!el) {
      console.error("Missing textarea element");
      return;
    }

    // Select text and copy to clipboard
    el.select();
    document.execCommand("copy");

    // Only show toast if it isn't already active
    const { showToast } = this.state;
    if (showToast) {
      return;
    }

    this.setState({ showToast: true });

    // Clear toast after a few seconds
    setTimeout(() => this.setState({ showToast: false }), 2000);
  };

  saveEmbedToClipboard = () => {
    this.setState(
      { outputFormat: OUTPUT_FORMATS.INLINE },
      this.saveToClipboard
    );
  };

  saveBinaryFile = () => {
    const { frames, headline, subhead, source } = this.props;
    const outputFrames = Object.values(frames).filter((f) => f.selected);

    const filename = "figma-to-html-test.html";
    const raw = renderInline({
      frames: outputFrames,
      iframe: OUTPUT_FORMATS.IFRAME,
      headline,
      subhead,
      source,
    });
    const blob = new Blob([raw], { type: "text/html" });

    saveAs(blob, filename);
  };

  handleFormatChange = (format: OUTPUT_FORMATS) => {
    this.setState({
      outputFormat: format,
    });
  };

  render() {
    const { frames, headline, subhead, source } = this.props;
    const { advancedOpen, showToast, outputFormat } = this.state;
    const rawHtml = renderInline({
      frames,
      iframe: outputFormat,
      headline,
      subhead,
      source,
    });

    const advancedBtnText = `${advancedOpen ? "hide" : "show"}`;
    let advancedClassName = "f2h__save_advanced";
    if (advancedOpen) {
      advancedClassName += "f2h__save_advanced--open";
    }

    let toastClassName = "f2h__toast";
    if (showToast) {
      toastClassName += "f2h__toast--open";
    }

    return (
      <div class="f2h__save">
        <div class="f2h__save_options">
          <button class="f2h__save_btn" onClick={this.saveEmbedToClipboard}>
            Copy embed to clipboard
          </button>
          <button class="f2h__save_btn" onClick={this.saveBinaryFile}>
            Download iframe HTML file
          </button>
        </div>

        <h2 class="f2h__save__subhead f2h__save_advanced-header">
          <span class="f2h__save_advanced_title">Advanced settings</span>
          <button class="f2h__save_advanced_show" onClick={this.toggleAdvanced}>
            {advancedBtnText}
          </button>
        </h2>

        <div class={advancedClassName}>
          <h2 class="f2h__save__subhead">Format</h2>

          <label for="f2h__input_inline" class="f2h__label">
            <input
              class="f2h__radio_btn"
              type="radio"
              name="inline"
              id="f2h__input_inline"
              value={OUTPUT_FORMATS.INLINE}
              checked={outputFormat === OUTPUT_FORMATS.INLINE}
              onClick={() => this.handleFormatChange(OUTPUT_FORMATS.INLINE)}
            />
            Inline (default)
          </label>

          <label for="f2h__input_iframe" class="f2h__label">
            <input
              class="f2h__radio_btn"
              type="radio"
              name="iframe"
              id="f2h__input_iframe"
              value={OUTPUT_FORMATS.IFRAME}
              checked={outputFormat === OUTPUT_FORMATS.IFRAME}
              onClick={() => this.handleFormatChange(OUTPUT_FORMATS.IFRAME)}
            />
            iFrame
          </label>

          <h2 class="f2h__save__subhead">Raw HTML</h2>
          <textarea
            ref={this.textAreaEl}
            class="f2h__save__raw"
            value={rawHtml}
          ></textarea>
        </div>

        <div class={toastClassName}>Copied to clipboard</div>
      </div>
    );
  }
}
