import { h, Component, render } from 'preact';
import { saveAs } from 'file-saver';
import { MSG_EVENTS, STAGES, UI_TEXT } from './constants';
import { Header } from './components/Header';
import { FrameSelection } from './components/FrameSelection';
import { Preview } from './components/Preview';
import type { board } from './constants';

function saveBinaryFile(data: any, filename: string = 'download') {
  const blob = new Blob([data], { type: 'text/html' });
  saveAs(blob, filename);
}

function main(boards: board[], textNodes: []) {
  // Sort boards by width ascending
  boards.sort((a, b) => {
    return a.width < b.width ? -1 : 1;
  });

  const svgsHtml = boards.map((board) => {
    const { id, buffer } = board;
    const svgStr = String.fromCharCode.apply(null, Array.from(buffer));

    return `
      <div class="container" id="${id}">
        ${svgStr}
      </div>
    `;
  });

  const mediaQueries = boards.map((board, i) => {
    const { id, width } = board;
    const { width: nextWidth } = boards[i + 1] || {};

    return `
      #${id} {
        display: none;
      }
      @media screen and (min-width: ${width}px) ${
      nextWidth ? `and (max-width: ${nextWidth}px)` : ''
    } {
        #${id} {
          display: block;
        }
      }
    `;
  });

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html, body {
            margin: 0;
            font-size: 16px;
          }
          p {
            margin: 0;
            padding: 0;
          }
        </style>
        <style>
          ${mediaQueries.join('\n')}
        </style>
      </head>
      <body>
        ${svgsHtml.join('\n')}
      </body>
    </html>
  `;

  // saveBinaryFile(html, 'figma2html-export.html');

  console.log(textNodes);

  const textEls = textNodes.map((node) => {
    const {
      text,
      constraints,
      position,
      fontSize,
      fontName,
      colour,
      width,
    } = node;

    const fontFamily = fontName?.family || 'sans-serif';

    const css = Object.entries(position)
      .map(([prop, val]) => {
        return `${prop}: ${val}`;
      })
      .join('; ');

    const p = document.createElement('p');
    p.setAttribute(
      'style',
      `
        font-size: ${fontSize};
        font-family: ${fontFamily};
        position: absolute;
        color: ${colour};
        width: ${width};
        ${css}
      `
    );
    p.classList.add('f_svg_text');
    p.innerText = text;
    return p;
  });

  const div = document.createElement('div');
  div.innerHTML = `

      ${svgsHtml.join('\n')}

    <style>
    @import url('https://cf.eip.telegraph.co.uk/assets/_css/fontsv02.css');
      .f_svg_text {
        margin: 0;
        font-family: sans-serif;
        transform: translate(-50%, -50%);

      }

      .f_svg_wrapper {
        width: 100%;

      }

      svg {
        width: 100%;
        height: auto;
      }

      svg text {
        display: none;
      }
    </style>
  `;
  div.setAttribute('style', 'position: relative;');
  div.classList.add('f_svg_wrapper');

  textEls.forEach((el) => div.appendChild(el));

  document.body.appendChild(div);
}

export type FrameDataType = {
  name: string;
  width: number;
  id: string;
};

export type AppState = {
  error: undefined | string;
  ready: boolean;
  frames: FrameDataType[];
  selectedFrames: string[];
  stage: STAGES;
  previewIndex: number;
};

export class App extends Component {
  state: AppState = {
    error: undefined,
    ready: false,
    frames: [],
    selectedFrames: [],
    stage: STAGES.CHOOSE_FRAMES,
    previewIndex: 0,
  };

  componentDidMount() {
    // Register DOM and POST messags
    window.addEventListener('message', this.handleEvents);

    // Send backend message that UI is ready
    parent.postMessage({ pluginMessage: MSG_EVENTS.DOM_READY }, '*');
  }

  handleEvents = (event: any) => {
    const type: MSG_EVENTS = event?.data?.pluginMessage.type;
    const data: { text?: string } = event?.data?.pluginMessage.data;

    console.log('ui msg', type, data);
    switch (type) {
      case MSG_EVENTS.RENDER:
        // main(data, textNodes);
        console.log(data);
        break;

      case MSG_EVENTS.NO_FRAMES:
        this.setState({ error: UI_TEXT.ERROR_MISSING_FRAMES });

      case MSG_EVENTS.NO_TARGET_FRAMES:
        this.setState({ frames: data, ready: true });
        break;

      case MSG_EVENTS.ERROR:
        this.setState({ error: `${UI_TEXT.ERROR_UNEXPECTED}: ${data?.text}` });
        break;

      default:
        this.setState({ error: 'Unknown error o_O?' });
        console.error('Unknown UI event type', type, data);
    }
  };

  handleFrameSelectionChange = (id: string) => {
    const { selectedFrames } = this.state;

    let newSelections = [];

    if (selectedFrames.includes(id)) {
      newSelections = selectedFrames.filter((i) => i !== id);
    } else {
      newSelections = [...selectedFrames, id];
    }

    this.setState({ selectedFrames: newSelections });
  };

  goNext = () => {
    const { stage, selectedFrames, previewIndex } = this.state;

    if (selectedFrames.length < 1) {
      return;
    }

    if (stage === STAGES.CHOOSE_FRAMES) {
      this.setState({ stage: STAGES.PREVIEW_OUTPUT });
      return;
    }

    if (
      stage === STAGES.PREVIEW_OUTPUT &&
      previewIndex < selectedFrames.length - 1
    ) {
      this.setState({ previewIndex: previewIndex + 1 });
      return;
    }

    if (
      stage === STAGES.PREVIEW_OUTPUT &&
      previewIndex === selectedFrames.length - 1
    ) {
      this.setState({ stage: STAGES.SAVE_OUTPUT });
      return;
    }
  };

  goBack = () => {
    console.log('go back', this.state);
    const { stage, selectedFrames, previewIndex } = this.state;

    if (stage === STAGES.CHOOSE_FRAMES) {
      return;
    }

    if (stage === STAGES.PREVIEW_OUTPUT && previewIndex > 0 && previewIndex) {
      this.setState({ previewIndex: previewIndex - 1 });
      return;
    }

    if (stage === STAGES.PREVIEW_OUTPUT && previewIndex === 0) {
      this.setState({ stage: STAGES.CHOOSE_FRAMES });
      return;
    }

    if (stage === STAGES.SAVE_OUTPUT) {
      this.setState({ stage: STAGES.PREVIEW_OUTPUT });
      return;
    }
  };

  render() {
    const {
      error,
      ready,
      frames,
      selectedFrames,
      stage,
      previewIndex,
    } = this.state;

    const previewFrame = frames.find(
      (frame) => frame.id === selectedFrames[previewIndex]
    );

    console.log(this.state);

    return (
      <div class="f2h">
        <Header
          stage={stage}
          paginationLength={selectedFrames.length}
          paginationIndex={previewIndex}
          handleBackClick={this.goBack}
          handleNextClick={this.goNext}
          disableNext={selectedFrames.length < 1}
        />

        {error ?? <p class="error">{error}</p>}

        {ready && stage === STAGES.CHOOSE_FRAMES && (
          <FrameSelection
            frames={frames}
            selections={selectedFrames}
            handleClick={this.handleFrameSelectionChange}
          />
        )}

        {ready && previewFrame && stage === STAGES.PREVIEW_OUTPUT && (
          <Preview frame={previewFrame} />
        )}

        {ready && stage === STAGES.SAVE_OUTPUT && <p>Save OUTPUT</p>}
      </div>
    );
  }
}

render(<App />, document.body);

console.log('rendering');
