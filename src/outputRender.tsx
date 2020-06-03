import { h } from "preact";
import render from "preact-render-to-string";
import type { textData } from ".";
import type { FrameDataType } from "./ui";
import { OUTPUT_FORMATS } from "./constants";

// Import CSS file as plain text via esbuild loader option
// @ts-expect-error
import embedCss from "./embed.css";

function generateIframeHtml(body: string) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style> html, body { margin: 0; } </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
}

function generateStyleText(node: textData, frameWidth: number, frameHeight: number) {
  const {
    x,
    y,
    width,
    height,
    fontSize,
    fontFamily,
    colour,
    letterSpacing,
    lineHeight,
    textAlignHorizontal,
    textAlignVertical,
  } = node;

  // Position center aligned
  const left = `${((x + width / 2) / frameWidth) * 100}%`;
  const top = `${((y + height / 2) / frameHeight) * 100}%`;

  // Colour
  const { r, g, b, a } = colour;
  const colourVals = [r, g, b].map((val = 0) => Math.round(val * 255));
  const textColour = `rgba(${colourVals.join(",")}, ${a})`;

  const { unit: letterUnit, value: letterVal } = letterSpacing as { value: number; unit: "PIXELS" | "PERCENT" };
  let letterSpaceValue = "0";
  switch (letterUnit) {
    case "PIXELS":
      letterSpaceValue = `${letterVal}px`;
      break;
    case "PERCENT":
      letterSpaceValue = `${letterVal / 100}em`;
      break;
    default:
      letterSpaceValue = "0";
      break;
  }

  const { unit: lineUnit, value: lineVal } = lineHeight as { value: number; unit: "AUTO" | "PIXELS" | "PERCENT" };
  let lineHeightValue = "auto";
  switch (lineUnit) {
    case "PIXELS":
      lineHeightValue = `${lineVal}px`;
      break;
    case "PERCENT":
      lineHeightValue = `${lineVal * 1.15}%`;
      break;
    case "AUTO":
      lineHeightValue = "1.2";
      break;
  }

  let alignItemsValue = "auto";
  switch (textAlignVertical) {
    case "TOP":
      alignItemsValue = "flex-start";
      break;
    case "CENTER":
      alignItemsValue = "center";
      break;
    case "BOTTOM":
      alignItemsValue = "flex-end";
      break;
  }

  let justifyItemsValue = "auto";
  switch (textAlignHorizontal) {
    case "LEFT":
      justifyItemsValue = "flex-start";
      break;
    case "CENTER":
      justifyItemsValue = "center";
      break;
    case "RIGHT":
      justifyItemsValue = "flex-end";
      break;
  }

  const WIDTH_BUFFER = 3;

  return `
        font-size: ${String(fontSize)}px;
        font-family: "${fontFamily}", Georgia, 'Times New Roman', Times, serif;
        position: absolute;
        color: ${textColour};
        width: ${width + WIDTH_BUFFER}px;
        height: ${height}px;
        left: ${left};
        top: ${top};
        line-height: ${lineHeightValue};
        letter-spacing: ${letterSpaceValue};
        justify-content: ${justifyItemsValue};
        align-items: ${alignItemsValue};
        display: flex;
      `;
}

type TextProps = {
  node: textData;
  width: number;
  height: number;
};
function Text(props: TextProps) {
  const { node, width, height } = props;

  const { characters } = node;
  const styleText = generateStyleText(node, width, height);

  return (
    <p class="f2h__text" style={styleText}>
      {characters}
    </p>
  );
}

interface FrameContainerProps extends FrameDataType {
  scale?: number | false;
}
export function FrameContainer(props: FrameContainerProps) {
  const { uid, width, height, textNodes, svg = "", responsive, scale } = props;
  const textEls = textNodes.map((node) => <Text node={node} width={width} height={height} />);
  const classNames = `f2h__render ${responsive ? "f2h__render--responsive" : ""}`;

  //
  let style = responsive ? "" : `width: ${width}px;`;
  style = scale ? `${style} transform: scale(${scale});` : style;

  return (
    <div class={classNames} style={style} id={uid}>
      <div class="f2h__svg_container" dangerouslySetInnerHTML={{ __html: svg }} />

      <div class="f2h__text_container">{textEls}</div>
    </div>
  );
}

export function renderInline(frames: FrameDataType[], iframe: OUTPUT_FORMATS) {
  const mediaQuery = genreateMediaQueries(frames);

  const renderedFrames = frames.map((frame) => <FrameContainer {...frame} />);

  let html = render(
    <div class="f2h__embed">
      <style>
        {embedCss}
        {mediaQuery}
      </style>
      {renderedFrames}
    </div>
  );

  if (iframe === OUTPUT_FORMATS.IFRAME) {
    html = generateIframeHtml(html);
  }

  return html.replace(/\n|\r|\s{2,}/g, "");
}

function genreateMediaQueries(frames: FrameDataType[]) {
  const idWidths = frames.map(({ width, uid }) => [width, uid]).sort(([a], [b]) => (a < b ? -1 : 1));

  const mediaQueries = idWidths.map(([width, uid], i) => {
    if (i === 0) {
      return "";
    }

    const [, prevId] = idWidths[i - 1];

    // Note: Cascade order is important.
    return `
      @media (max-width: ${width}px) {
        #${uid} { display: none; }
      }
      @media (min-width: ${width}px) {
        #${prevId} { display: none; }
        #${uid} { display: block; }
      }
    `;
  });

  return mediaQueries.join("");
}
