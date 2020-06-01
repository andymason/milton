(() => {
  let __propertyIsEnumerable = Object.propertyIsEnumerable;
  let __assign = Object.assign;
  let __commonJS = (callback) => {
    let module;
    return () => {
      if (!module) {
        module = {
          exports: {}
        };
        callback(module.exports, module);
      }
      return module.exports;
    };
  };

  // src/index.tsx
  var require_index = __commonJS(() => {
    function genRandomUid() {
      const rnd = Math.random();
      const uid = rnd.toString().substr(2);
      return `f2h-${uid}`;
    }
    async function getFrameSvgAsString(frame) {
      const svgBuff = await frame.exportAsync({
        format: "SVG",
        svgOutlineText: false,
        svgSimplifyStroke: true
      });
      return String.fromCharCode.apply(null, Array.from(svgBuff));
    }
    const handleReceivedMsg = (msg) => {
      const {type, width, height, frameId} = msg;
      switch (type) {
        case MSG_EVENTS.ERROR:
          console.log("plugin msg: error");
          break;
        case MSG_EVENTS.CLOSE:
          console.log("plugin msg: close");
          figma.closePlugin();
          break;
        case MSG_EVENTS.DOM_READY:
          console.log("plugin msg: DOM READY");
          main();
          break;
        case MSG_EVENTS.RENDER:
          console.log("plugin msg: render", frameId);
          renderFrame(frameId).then((svgStr) => {
            figma.ui.postMessage({
              type: MSG_EVENTS.RENDER,
              frameId,
              svgStr
            });
          }).catch((err) => {
            figma.ui.postMessage({
              type: MSG_EVENTS.ERROR,
              errorText: `Render failed: ${err != null ? err : err.message}`
            });
          });
          break;
        case MSG_EVENTS.RESIZE:
          console.log("plugin msg: resize");
          figma.ui.resize(width, height);
          break;
        default:
          console.error("Unknown post message", msg);
      }
    };
    figma.ui.on("message", (e) => handleReceivedMsg(e));
    const main = () => {
      const {currentPage} = figma;
      const allFrames = currentPage.children.filter((node) => node.type === "FRAME");
      if (allFrames.length > 0) {
        const framesData = {};
        allFrames.forEach((frame) => {
          const {name, width, height, id} = frame;
          const textNodes = getTextNodes(frame);
          const uid = genRandomUid();
          framesData[id] = {
            name,
            width,
            height,
            id,
            textNodes,
            uid,
            responsive: false,
            selected: true
          };
        });
        figma.ui.postMessage({
          type: MSG_EVENTS.FOUND_FRAMES,
          frames: framesData
        });
        return;
      }
      if (allFrames.length < 1) {
        console.warn("No frames");
        figma.ui.postMessage({
          type: MSG_EVENTS.NO_FRAMES
        });
        return;
      }
    };
    figma.showUI(__html__);
    figma.ui.resize(figma.viewport.bounds.width, figma.viewport.bounds.height);
    async function renderFrame(frameId) {
      const frame = figma.getNodeById(frameId);
      if (!frame || frame.type !== "FRAME") {
        throw new Error("Missing frame");
      }
      let svgStr = await getFrameSvgAsString(frame);
      const regex = /id="(.+?)"/g;
      const ids = [];
      let matches;
      while (matches = regex.exec(svgStr)) {
        const [, id] = matches;
        ids.push(id);
      }
      ids.forEach((id) => {
        const randomId = `${id}-${genRandomUid()}`;
        svgStr = svgStr.replace(`id="${id}"`, `id="${randomId}"`);
        svgStr = svgStr.replace(`#${id}`, `#${randomId}`);
      });
      return svgStr;
    }
    function getTextNodes(frame) {
      const textNodes = frame.findAll(({type}) => type === "TEXT");
      const {absoluteTransform} = frame;
      const rootX = absoluteTransform[0][2];
      const rootY = absoluteTransform[1][2];
      return textNodes.map((node) => {
        const {absoluteTransform: absoluteTransform2, width, height, fontSize: fontSizeData, fontName, fills, characters} = node;
        const textX = absoluteTransform2[0][2];
        const textY = absoluteTransform2[1][2];
        const x = textX - rootX;
        const y = textY - rootY;
        const [fill] = fills;
        let colour = {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        };
        if (fill.type === "SOLID") {
          colour = __assign(__assign({}, colour), {
            a: fill.opacity || 1
          });
        }
        let fontSize = 16;
        if (fontSizeData !== figma.mixed) {
          fontSize = fontSizeData;
        }
        let fontFamily = "Arial";
        if (fontName !== figma.mixed) {
          fontFamily = fontName.family;
        }
        return {
          x,
          y,
          width,
          height,
          fontSize,
          fontFamily,
          colour,
          characters
        };
      });
    }
  });

  // src/constants.ts
  var STAGES;
  (function(STAGES2) {
    STAGES2[STAGES2["CHOOSE_FRAMES"] = 0] = "CHOOSE_FRAMES";
    STAGES2[STAGES2["PREVIEW_OUTPUT"] = 1] = "PREVIEW_OUTPUT";
    STAGES2[STAGES2["RESPONSIVE_PREVIEW"] = 2] = "RESPONSIVE_PREVIEW";
    STAGES2[STAGES2["SAVE_OUTPUT"] = 3] = "SAVE_OUTPUT";
  })(STAGES || (STAGES = {}));
  var MSG_EVENTS;
  (function(MSG_EVENTS2) {
    MSG_EVENTS2[MSG_EVENTS2["DOM_READY"] = 0] = "DOM_READY";
    MSG_EVENTS2[MSG_EVENTS2["NO_FRAMES"] = 1] = "NO_FRAMES";
    MSG_EVENTS2[MSG_EVENTS2["FOUND_FRAMES"] = 2] = "FOUND_FRAMES";
    MSG_EVENTS2[MSG_EVENTS2["RESIZE"] = 3] = "RESIZE";
    MSG_EVENTS2[MSG_EVENTS2["RENDER"] = 4] = "RENDER";
    MSG_EVENTS2[MSG_EVENTS2["CLOSE"] = 5] = "CLOSE";
    MSG_EVENTS2[MSG_EVENTS2["ERROR"] = 6] = "ERROR";
  })(MSG_EVENTS || (MSG_EVENTS = {}));
  var OUTPUT_FORMATS;
  (function(OUTPUT_FORMATS2) {
    OUTPUT_FORMATS2[OUTPUT_FORMATS2["INLINE"] = 0] = "INLINE";
    OUTPUT_FORMATS2[OUTPUT_FORMATS2["IFRAME"] = 1] = "IFRAME";
  })(OUTPUT_FORMATS || (OUTPUT_FORMATS = {}));
  require_index();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzeCIsICJzcmMvY29uc3RhbnRzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBNU0dfRVZFTlRTIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBNc2dGcmFtZXNUeXBlLCBNc2dOb0ZyYW1lc1R5cGUsIE1zZ1JlbmRlclR5cGUsIE1zZ0Vycm9yVHlwZSwgRnJhbWVEYXRhVHlwZSB9IGZyb20gXCIuL3VpXCI7XG5cbi8vIEdlbmVyYXRlIGEgdW5pcXVlIGlkIHByZWZpeGVkIHdpdGggaWRlbnRpZmVyIHN0cmluZyBmb3Igc2FmZSB1c2UgYXMgSFRNTCBJRFxuLy8gTm90ZTogRmlnbWEgc2VlbXMgdG8gc3R1YiAudG9TdHJpbmcgZm9yIHNlY3VyaXR5P1xuZnVuY3Rpb24gZ2VuUmFuZG9tVWlkKCkge1xuICBjb25zdCBybmQgPSBNYXRoLnJhbmRvbSgpO1xuICBjb25zdCB1aWQgPSBybmQudG9TdHJpbmcoKS5zdWJzdHIoMik7XG4gIHJldHVybiBgZjJoLSR7dWlkfWA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEZyYW1lU3ZnQXNTdHJpbmcoZnJhbWU6IFNjZW5lTm9kZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHN2Z0J1ZmYgPSBhd2FpdCBmcmFtZS5leHBvcnRBc3luYyh7XG4gICAgZm9ybWF0OiBcIlNWR1wiLFxuICAgIHN2Z091dGxpbmVUZXh0OiBmYWxzZSxcbiAgICBzdmdTaW1wbGlmeVN0cm9rZTogdHJ1ZSxcbiAgfSk7XG5cbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgQXJyYXkuZnJvbShzdmdCdWZmKSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zdE1zZyB7XG4gIHR5cGU6IE1TR19FVkVOVFM7XG4gIGZyYW1lSWQ6IHN0cmluZztcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59XG4vLyBIYW5kbGUgbWVzc2FnZXMgZnJvbSB0aGUgVUlcbmNvbnN0IGhhbmRsZVJlY2VpdmVkTXNnID0gKG1zZzogUG9zdE1zZykgPT4ge1xuICBjb25zdCB7IHR5cGUsIHdpZHRoLCBoZWlnaHQsIGZyYW1lSWQgfSA9IG1zZztcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIE1TR19FVkVOVFMuRVJST1I6XG4gICAgICBjb25zb2xlLmxvZyhcInBsdWdpbiBtc2c6IGVycm9yXCIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIE1TR19FVkVOVFMuQ0xPU0U6XG4gICAgICBjb25zb2xlLmxvZyhcInBsdWdpbiBtc2c6IGNsb3NlXCIpO1xuICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBNU0dfRVZFTlRTLkRPTV9SRUFEWTpcbiAgICAgIGNvbnNvbGUubG9nKFwicGx1Z2luIG1zZzogRE9NIFJFQURZXCIpO1xuICAgICAgbWFpbigpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIE1TR19FVkVOVFMuUkVOREVSOlxuICAgICAgY29uc29sZS5sb2coXCJwbHVnaW4gbXNnOiByZW5kZXJcIiwgZnJhbWVJZCk7XG4gICAgICByZW5kZXJGcmFtZShmcmFtZUlkKVxuICAgICAgICAudGhlbigoc3ZnU3RyKSA9PiB7XG4gICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogTVNHX0VWRU5UUy5SRU5ERVIsXG4gICAgICAgICAgICBmcmFtZUlkLFxuICAgICAgICAgICAgc3ZnU3RyLFxuICAgICAgICAgIH0gYXMgTXNnUmVuZGVyVHlwZSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogTVNHX0VWRU5UUy5FUlJPUixcbiAgICAgICAgICAgIGVycm9yVGV4dDogYFJlbmRlciBmYWlsZWQ6ICR7ZXJyID8/IGVyci5tZXNzYWdlfWAsXG4gICAgICAgICAgfSBhcyBNc2dFcnJvclR5cGUpO1xuICAgICAgICB9KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBNU0dfRVZFTlRTLlJFU0laRTpcbiAgICAgIGNvbnNvbGUubG9nKFwicGx1Z2luIG1zZzogcmVzaXplXCIpO1xuICAgICAgZmlnbWEudWkucmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5lcnJvcihcIlVua25vd24gcG9zdCBtZXNzYWdlXCIsIG1zZyk7XG4gIH1cbn07XG5cbi8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgVUlcbmZpZ21hLnVpLm9uKFwibWVzc2FnZVwiLCAoZSkgPT4gaGFuZGxlUmVjZWl2ZWRNc2coZSkpO1xuXG5jb25zdCBtYWluID0gKCkgPT4ge1xuICBjb25zdCB7IGN1cnJlbnRQYWdlIH0gPSBmaWdtYTtcblxuICAvLyBHZXQgZGVmYXVsdCBmcmFtZXMgbmFtZXNcbiAgY29uc3QgYWxsRnJhbWVzID0gY3VycmVudFBhZ2UuY2hpbGRyZW4uZmlsdGVyKChub2RlKSA9PiBub2RlLnR5cGUgPT09IFwiRlJBTUVcIikgYXMgRnJhbWVOb2RlW107XG5cbiAgaWYgKGFsbEZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZnJhbWVzRGF0YTogeyBbaWQ6IHN0cmluZ106IEZyYW1lRGF0YVR5cGUgfSA9IHt9O1xuXG4gICAgYWxsRnJhbWVzLmZvckVhY2goKGZyYW1lKSA9PiB7XG4gICAgICBjb25zdCB7IG5hbWUsIHdpZHRoLCBoZWlnaHQsIGlkIH0gPSBmcmFtZTtcbiAgICAgIGNvbnN0IHRleHROb2RlcyA9IGdldFRleHROb2RlcyhmcmFtZSk7XG4gICAgICBjb25zdCB1aWQgPSBnZW5SYW5kb21VaWQoKTtcblxuICAgICAgZnJhbWVzRGF0YVtpZF0gPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIGlkLFxuICAgICAgICB0ZXh0Tm9kZXMsXG4gICAgICAgIHVpZCxcbiAgICAgICAgcmVzcG9uc2l2ZTogZmFsc2UsXG4gICAgICAgIHNlbGVjdGVkOiB0cnVlLFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6IE1TR19FVkVOVFMuRk9VTkRfRlJBTUVTLFxuICAgICAgZnJhbWVzOiBmcmFtZXNEYXRhLFxuICAgIH0gYXMgTXNnRnJhbWVzVHlwZSk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYWxsRnJhbWVzLmxlbmd0aCA8IDEpIHtcbiAgICBjb25zb2xlLndhcm4oXCJObyBmcmFtZXNcIik7XG4gICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBNU0dfRVZFTlRTLk5PX0ZSQU1FUyB9IGFzIE1zZ05vRnJhbWVzVHlwZSk7XG4gICAgcmV0dXJuO1xuICB9XG59O1xuXG4vLyBSZW5kZXIgdGhlIERPTVxuZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmZpZ21hLnVpLnJlc2l6ZShmaWdtYS52aWV3cG9ydC5ib3VuZHMud2lkdGgsIGZpZ21hLnZpZXdwb3J0LmJvdW5kcy5oZWlnaHQpO1xuXG5hc3luYyBmdW5jdGlvbiByZW5kZXJGcmFtZShmcmFtZUlkOiBzdHJpbmcpIHtcbiAgY29uc3QgZnJhbWUgPSBmaWdtYS5nZXROb2RlQnlJZChmcmFtZUlkKTtcbiAgaWYgKCFmcmFtZSB8fCBmcmFtZS50eXBlICE9PSBcIkZSQU1FXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGZyYW1lXCIpO1xuICB9XG5cbiAgbGV0IHN2Z1N0ciA9IGF3YWl0IGdldEZyYW1lU3ZnQXNTdHJpbmcoZnJhbWUpO1xuXG4gIC8vIE5PVEU6IEZpZ21hIGdlbmVyYXRlcyBub24tdW5pcXVlIElEcyBmb3IgbWFza3Mgd2hpY2ggY2FuIGNsYXNoIHdoZW5cbiAgLy8gZW1iZWRkaW5nIG11bHRpcGxlIFNWR1NzLiBXZSBkbyBhIHN0cmluZyByZXBsYWNlIGZvciB1bmlxdWUgSURzXG4gIGNvbnN0IHJlZ2V4ID0gL2lkPVwiKC4rPylcIi9nO1xuICBjb25zdCBpZHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBtYXRjaGVzO1xuXG4gIHdoaWxlICgobWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoc3ZnU3RyKSkpIHtcbiAgICBjb25zdCBbLCBpZF0gPSBtYXRjaGVzO1xuICAgIGlkcy5wdXNoKGlkKTtcbiAgfVxuXG4gIGlkcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgIGNvbnN0IHJhbmRvbUlkID0gYCR7aWR9LSR7Z2VuUmFuZG9tVWlkKCl9YDtcbiAgICAvLyBSZXBsYWNlIElEXG4gICAgc3ZnU3RyID0gc3ZnU3RyLnJlcGxhY2UoYGlkPVwiJHtpZH1cImAsIGBpZD1cIiR7cmFuZG9tSWR9XCJgKTtcbiAgICAvLyBSZXBsYWNlIGFuY2hvciByZWZzXG4gICAgc3ZnU3RyID0gc3ZnU3RyLnJlcGxhY2UoYCMke2lkfWAsIGAjJHtyYW5kb21JZH1gKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHN2Z1N0cjtcbn1cblxuZXhwb3J0IHR5cGUgdGV4dE5vZGVTZWxlY3RlZFByb3BzID0gUGljazxUZXh0Tm9kZSwgXCJ4XCIgfCBcInlcIiB8IFwid2lkdGhcIiB8IFwiaGVpZ2h0XCIgfCBcImNoYXJhY3RlcnNcIj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgdGV4dERhdGEgZXh0ZW5kcyB0ZXh0Tm9kZVNlbGVjdGVkUHJvcHMge1xuICBjb2xvdXI6IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlcjsgYTogbnVtYmVyIH07XG4gIGZvbnRTaXplOiBudW1iZXI7XG4gIGZvbnRGYW1pbHk6IHN0cmluZztcbn1cblxuLy8gRXh0cmFjdCBvYmplY3QgcHJvcGVydGllcyBmcm9tIHRleHROb2RlIGZvciBwYXNzaW5nIHZpYSBwb3N0TWVzc2FnZVxuZnVuY3Rpb24gZ2V0VGV4dE5vZGVzKGZyYW1lOiBGcmFtZU5vZGUpOiB0ZXh0RGF0YVtdIHtcbiAgY29uc3QgdGV4dE5vZGVzID0gZnJhbWUuZmluZEFsbCgoeyB0eXBlIH0pID0+IHR5cGUgPT09IFwiVEVYVFwiKSBhcyBUZXh0Tm9kZVtdO1xuICBjb25zdCB7IGFic29sdXRlVHJhbnNmb3JtIH0gPSBmcmFtZTtcbiAgY29uc3Qgcm9vdFggPSBhYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgY29uc3Qgcm9vdFkgPSBhYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcblxuICByZXR1cm4gdGV4dE5vZGVzLm1hcChcbiAgICAobm9kZSk6IHRleHREYXRhID0+IHtcbiAgICAgIGNvbnN0IHsgYWJzb2x1dGVUcmFuc2Zvcm0sIHdpZHRoLCBoZWlnaHQsIGZvbnRTaXplOiBmb250U2l6ZURhdGEsIGZvbnROYW1lLCBmaWxscywgY2hhcmFjdGVycyB9ID0gbm9kZTtcblxuICAgICAgLy8gTk9URTogRmlnbWEgbm9kZSB4LCB5IGFyZSByZWxhdGl2ZSB0byBmaXJzdCBwYXJlbnQsIHdlIHdhbnQgdGhlbVxuICAgICAgLy8gcmVsYXRpdmUgdG8gdGhlIHJvb3QgZnJhbWVcbiAgICAgIGNvbnN0IHRleHRYID0gYWJzb2x1dGVUcmFuc2Zvcm1bMF1bMl07XG4gICAgICBjb25zdCB0ZXh0WSA9IGFic29sdXRlVHJhbnNmb3JtWzFdWzJdO1xuICAgICAgY29uc3QgeCA9IHRleHRYIC0gcm9vdFg7XG4gICAgICBjb25zdCB5ID0gdGV4dFkgLSByb290WTtcblxuICAgICAgLy8gRXh0cmFjdCBiYXNpYyBmaWxsIGNvbG91clxuICAgICAgY29uc3QgW2ZpbGxdID0gZmlsbHM7XG4gICAgICBsZXQgY29sb3VyID0geyByOiAwLCBnOiAwLCBiOiAwLCBhOiAxIH07XG4gICAgICBpZiAoZmlsbC50eXBlID09PSBcIlNPTElEXCIpIHtcbiAgICAgICAgY29sb3VyID0geyAuLi5jb2xvdXIsIGE6IGZpbGwub3BhY2l0eSB8fCAxIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEV4dHJhY3QgZm9udCBmYW1pbHlcbiAgICAgIGxldCBmb250U2l6ZSA9IDE2O1xuICAgICAgaWYgKGZvbnRTaXplRGF0YSAhPT0gZmlnbWEubWl4ZWQpIHtcbiAgICAgICAgZm9udFNpemUgPSBmb250U2l6ZURhdGE7XG4gICAgICB9XG5cbiAgICAgIC8vIEV4dHJhY3QgZm9udCBmYW1pbHlcbiAgICAgIGxldCBmb250RmFtaWx5ID0gXCJBcmlhbFwiO1xuICAgICAgaWYgKGZvbnROYW1lICE9PSBmaWdtYS5taXhlZCkge1xuICAgICAgICBmb250RmFtaWx5ID0gZm9udE5hbWUuZmFtaWx5O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBmb250U2l6ZSwgZm9udEZhbWlseSwgY29sb3VyLCBjaGFyYWN0ZXJzIH07XG4gICAgfVxuICApO1xufVxuIiwgImV4cG9ydCBlbnVtIFNUQUdFUyB7XG4gIENIT09TRV9GUkFNRVMsXG4gIFBSRVZJRVdfT1VUUFVULFxuICBSRVNQT05TSVZFX1BSRVZJRVcsXG4gIFNBVkVfT1VUUFVULFxufVxuXG5leHBvcnQgZW51bSBNU0dfRVZFTlRTIHtcbiAgRE9NX1JFQURZLFxuICBOT19GUkFNRVMsXG4gIEZPVU5EX0ZSQU1FUyxcbiAgUkVTSVpFLFxuICBSRU5ERVIsXG4gIENMT1NFLFxuICBFUlJPUixcbn1cblxuZXhwb3J0IGVudW0gT1VUUFVUX0ZPUk1BVFMge1xuICBJTkxJTkUsXG4gIElGUkFNRSxcbn1cblxuZXhwb3J0IGNvbnN0IFVJX1RFWFQgPSB7XG4gIEVSUk9SX1VORVhQRUNURUQ6IFwiVW5leHBlY3RlZCBlcnJvclwiLFxuICBFUlJPUl9NSVNTSU5HX0ZSQU1FUzogXCJObyBmcmFtZXMgZm91bmQuIFBsZWFzZSBhZGQgc29tZSBmcmFtZXMgdG8gdGhlIHBhZ2UuXCIsXG4gIFdBUk5fTk9fVEFSR0VUUzogXCJTdGFuZGFyZCBmcmFtZXMgbm90IGZvdW5kLiBQbGVhc2Ugc2VsZWN0IHRhcmdldCBmcmFtZXMuXCIsXG4gIFdBUk5fVE9PX01BTllfVEFSR0VUUzogXCJQbGVhc2Ugc2VsZWN0IHRocmVlIHRhcmdldCBmcmFtZXNcIixcbiAgSU5GT19QUkVWSUVXOiBcIlByZXZpZXcgZWFjaCBmcmFtZSBvdXRwdXRcIixcbiAgVElUTEVfQ0hPT1NFX0ZSQU1FOiBcIkNob29zZSB3aGljaCBmcmFtZXMgdG8gZXhwb3J0XCIsXG4gIFRJVExFX1BSRVZJRVc6IFwiUHJldmlld1wiLFxuICBUSVRMRV9SRVNQT05TSVZFX1BSRVZJRVc6IFwiUmVzcG9uc2l2ZSBwcmV2aWV3XCIsXG4gIFRJTEVfT1VUUFVUOiBcIkV4cG9ydFwiLFxuICBCVVRUT05fTkVYVDogXCJOZXh0XCIsXG4gIEJVVFRPTl9ET1dOTE9BRDogXCJEb3dubG9hZFwiLFxuICBCVVRUT05fUFJFVklPVVM6IFwiQmFja1wiLFxufTtcblxuZXhwb3J0IGNvbnN0IElOSVRJQUxfVUlfU0laRSA9IHtcbiAgd2lkdGg6IDQ4MCxcbiAgaGVpZ2h0OiA1MDAsXG4gIG1heFdpZHRoOiAxMjAwLFxuICBtYXhIZWlnaHQ6IDkwMCxcbiAgbWluV2lkdGg6IDQyMCxcbiAgbWluSGVpZ2h0OiA0ODAsXG59O1xuXG5leHBvcnQgY29uc3QgRlJBTUVfV0FSTklOR19TSVpFID0gMzAwO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUtBO0FBQ0UsWUFBTSxNQUFNLEtBQUs7QUFDakIsWUFBTSxNQUFNLElBQUksV0FBVyxPQUFPO0FBQ2xDLGFBQU8sT0FBTzs7QUFHaEIsdUNBQW1DO0FBQ2pDLFlBQU0sVUFBVSxNQUFNLE1BQU0sWUFBWTtRQUN0QyxRQUFRO1FBQ1IsZ0JBQWdCO1FBQ2hCLG1CQUFtQjs7QUFHckIsYUFBTyxPQUFPLGFBQWEsTUFBTSxNQUFNLE1BQU0sS0FBSzs7QUFVcEQsVUFBTSxvQkFBb0IsQ0FBQztBQUN6QixZQUFNLENBQUUsTUFBTSxPQUFPLFFBQVEsV0FBWTtBQUV6QyxjQUFRO2FBQ0QsV0FBVztBQUNkLGtCQUFRLElBQUk7QUFDWjthQUVHLFdBQVc7QUFDZCxrQkFBUSxJQUFJO0FBQ1osZ0JBQU07QUFDTjthQUVHLFdBQVc7QUFDZCxrQkFBUSxJQUFJO0FBQ1o7QUFDQTthQUVHLFdBQVc7QUFDZCxrQkFBUSxJQUFJLHNCQUFzQjtBQUNsQyxzQkFBWSxTQUNULEtBQUssQ0FBQztBQUNMLGtCQUFNLEdBQUcsWUFBWTtjQUNuQixNQUFNLFdBQVc7Y0FDakI7Y0FDQTs7YUFHSCxNQUFNLENBQUM7QUFDTixrQkFBTSxHQUFHLFlBQVk7Y0FDbkIsTUFBTSxXQUFXO2NBQ2pCLFdBQVcsa0JBQXlCLEFBQVAsb0JBQU8sSUFBSTs7O0FBRzlDO2FBRUcsV0FBVztBQUNkLGtCQUFRLElBQUk7QUFDWixnQkFBTSxHQUFHLE9BQU8sT0FBTztBQUN2Qjs7QUFHQSxrQkFBUSxNQUFNLHdCQUF3Qjs7O0FBSzVDLFVBQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLGtCQUFrQjtBQUVoRCxVQUFNLE9BQU87QUFDWCxZQUFNLENBQUUsZUFBZ0I7QUFHeEIsWUFBTSxZQUFZLFlBQVksU0FBUyxPQUFPLENBQUMsU0FBUyxLQUFLLFNBQVM7QUFFdEUsVUFBSSxVQUFVLFNBQVM7QUFDckIsY0FBTSxhQUE4QztBQUVwRCxrQkFBVSxRQUFRLENBQUM7QUFDakIsZ0JBQU0sQ0FBRSxNQUFNLE9BQU8sUUFBUSxNQUFPO0FBQ3BDLGdCQUFNLFlBQVksYUFBYTtBQUMvQixnQkFBTSxNQUFNO0FBRVoscUJBQVcsTUFBTTtZQUNmO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBLFlBQVk7WUFDWixVQUFVOzs7QUFJZCxjQUFNLEdBQUcsWUFBWTtVQUNuQixNQUFNLFdBQVc7VUFDakIsUUFBUTs7QUFHVjs7QUFHRixVQUFJLFVBQVUsU0FBUztBQUNyQixnQkFBUSxLQUFLO0FBQ2IsY0FBTSxHQUFHLFlBQVk7VUFBRSxNQUFNLFdBQVc7O0FBQ3hDOzs7QUFLSixVQUFNLE9BQU87QUFDYixVQUFNLEdBQUcsT0FBTyxNQUFNLFNBQVMsT0FBTyxPQUFPLE1BQU0sU0FBUyxPQUFPO0FBRW5FLCtCQUEyQjtBQUN6QixZQUFNLFFBQVEsTUFBTSxZQUFZO0FBQ2hDLFVBQUksQ0FBQyxTQUFTLE1BQU0sU0FBUztBQUMzQixjQUFNLElBQUksTUFBTTs7QUFHbEIsVUFBSSxTQUFTLE1BQU0sb0JBQW9CO0FBSXZDLFlBQU0sUUFBUTtBQUNkLFlBQU0sTUFBZ0I7QUFDdEIsVUFBSTtBQUVKLGFBQVEsVUFBVSxNQUFNLEtBQUs7QUFDM0IsY0FBTSxDQUFDLEVBQUUsTUFBTTtBQUNmLFlBQUksS0FBSzs7QUFHWCxVQUFJLFFBQVEsQ0FBQztBQUNYLGNBQU0sV0FBVyxHQUFHLE1BQU07QUFFMUIsaUJBQVMsT0FBTyxRQUFRLE9BQU8sT0FBTyxPQUFPO0FBRTdDLGlCQUFTLE9BQU8sUUFBUSxJQUFJLE1BQU0sSUFBSTs7QUFHeEMsYUFBTzs7QUFZVCwwQkFBc0I7QUFDcEIsWUFBTSxZQUFZLE1BQU0sUUFBUSxDQUFDLENBQUUsVUFBVyxTQUFTO0FBQ3ZELFlBQU0sQ0FBRSxxQkFBc0I7QUFDOUIsWUFBTSxRQUFRLGtCQUFrQixHQUFHO0FBQ25DLFlBQU0sUUFBUSxrQkFBa0IsR0FBRztBQUVuQyxhQUFPLFVBQVUsSUFDZixDQUFDO0FBQ0MsY0FBTSxDQUFFLHVDQUFtQixPQUFPLFFBQVEsVUFBVSxjQUFjLFVBQVUsT0FBTyxjQUFlO0FBSWxHLGNBQU0sUUFBUSxtQkFBa0IsR0FBRztBQUNuQyxjQUFNLFFBQVEsbUJBQWtCLEdBQUc7QUFDbkMsY0FBTSxJQUFJLFFBQVE7QUFDbEIsY0FBTSxJQUFJLFFBQVE7QUFHbEIsY0FBTSxDQUFDLFFBQVE7QUFDZixZQUFJLFNBQVM7VUFBRSxHQUFHO1VBQUcsR0FBRztVQUFHLEdBQUc7VUFBRyxHQUFHOztBQUNwQyxZQUFJLEtBQUssU0FBUztBQUNoQixtQkFBUyxzQkFBSyxTQUFMO1lBQWEsR0FBRyxLQUFLLFdBQVc7OztBQUkzQyxZQUFJLFdBQVc7QUFDZixZQUFJLGlCQUFpQixNQUFNO0FBQ3pCLHFCQUFXOztBQUliLFlBQUksYUFBYTtBQUNqQixZQUFJLGFBQWEsTUFBTTtBQUNyQix1QkFBYSxTQUFTOztBQUd4QixlQUFPO1VBQUU7VUFBRztVQUFHO1VBQU87VUFBUTtVQUFVO1VBQVk7VUFBUTs7Ozs7OztBQ3JNbEUsQUFBTyxNQUFLO0FBQUwsWUFBSztBQUNWO0FBQ0E7QUFDQTtBQUNBO0tBSlU7QUFPTCxNQUFLO0FBQUwsWUFBSztBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0tBUFU7QUFVTCxNQUFLO0FBQUwsWUFBSztBQUNWO0FBQ0E7S0FGVTsiLAogICJuYW1lcyI6IFtdCn0K
