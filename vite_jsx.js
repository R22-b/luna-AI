import __vite__cjsImport0_react_jsxDevRuntime from "/@fs/C:/Users/Ravikiran/OneDrive/Desktop/luna_AI (3)/luna/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=77df31e0"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/@fs/C:/Users/Ravikiran/OneDrive/Desktop/luna_AI (3)/luna/node_modules/.vite/deps/react.js?v=77df31e0"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from "/@fs/C:/Users/Ravikiran/OneDrive/Desktop/luna_AI (3)/luna/node_modules/.vite/deps/react-dom_client.js?v=f3021712"; const createRoot = __vite__cjsImport2_reactDom_client["createRoot"];
import App from "/App.jsx";
import "/styles/global.css";
if (!window.luna || !window.luna.chat) {
  const createProxy = (namespace) => new Proxy({}, {
    get: (_, method) => async (data) => {
      try {
        const res = await fetch(`http://localhost:3000/api/${namespace}/${method}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data || {})
        });
        return await res.json();
      } catch (err) {
        console.error(`[Web Bridge] Failed to call ${namespace}.${method}`, err);
        return { success: false, error: "Web Bridge connection failed" };
      }
    }
  });
  window.luna = createProxy("luna");
  window.guardian = createProxy("guardian");
  window.sandbox = createProxy("sandbox");
  window.student = createProxy("student");
  window.plugins = createProxy("plugins");
  window.evolution = createProxy("evolution");
  window.voice = window.voice || { speak: () => {
  }, stop: () => {
  }, onStatusChange: () => {
  } };
  console.log("🌐 Web Bridge Active: Fallback for Standalone Browser");
}
const root = createRoot(document.getElementById("root"));
root.render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "C:/Users/Ravikiran/OneDrive/Desktop/luna_AI (3)/luna/src/index.jsx",
    lineNumber: 39,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "C:/Users/Ravikiran/OneDrive/Desktop/luna_AI (3)/luna/src/index.jsx",
    lineNumber: 38,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBc0NJO0FBdENKLE9BQU9BLFdBQVc7QUFDbEIsU0FBU0Msa0JBQWtCO0FBQzNCLE9BQU9DLFNBQVM7QUFDaEIsT0FBTztBQUlQLElBQUksQ0FBQ0MsT0FBT0MsUUFBUSxDQUFDRCxPQUFPQyxLQUFLQyxNQUFNO0FBQ3JDLFFBQU1DLGNBQWNBLENBQUNDLGNBQWMsSUFBSUMsTUFBTSxDQUFDLEdBQUc7QUFBQSxJQUMvQ0MsS0FBS0EsQ0FBQ0MsR0FBR0MsV0FBVyxPQUFPQyxTQUFTO0FBQ2xDLFVBQUk7QUFDRixjQUFNQyxNQUFNLE1BQU1DLE1BQU0sNkJBQTZCUCxTQUFTLElBQUlJLE1BQU0sSUFBSTtBQUFBLFVBQzFFQSxRQUFRO0FBQUEsVUFDUkksU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxVQUM5Q0MsTUFBTUMsS0FBS0MsVUFBVU4sUUFBUSxDQUFDLENBQUM7QUFBQSxRQUNqQyxDQUFDO0FBQ0QsZUFBTyxNQUFNQyxJQUFJTSxLQUFLO0FBQUEsTUFDeEIsU0FBU0MsS0FBSztBQUNaQyxnQkFBUUMsTUFBTSwrQkFBK0JmLFNBQVMsSUFBSUksTUFBTSxJQUFJUyxHQUFHO0FBQ3ZFLGVBQU8sRUFBRUcsU0FBUyxPQUFPRCxPQUFPLCtCQUErQjtBQUFBLE1BQ2pFO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUVEbkIsU0FBT0MsT0FBT0UsWUFBWSxNQUFNO0FBQ2hDSCxTQUFPcUIsV0FBV2xCLFlBQVksVUFBVTtBQUN4Q0gsU0FBT3NCLFVBQVVuQixZQUFZLFNBQVM7QUFDdENILFNBQU91QixVQUFVcEIsWUFBWSxTQUFTO0FBQ3RDSCxTQUFPd0IsVUFBVXJCLFlBQVksU0FBUztBQUN0Q0gsU0FBT3lCLFlBQVl0QixZQUFZLFdBQVc7QUFDMUNILFNBQU8wQixRQUFRMUIsT0FBTzBCLFNBQVMsRUFBRUMsT0FBT0EsTUFBTTtBQUFBLEVBQUMsR0FBR0MsTUFBTUEsTUFBTTtBQUFBLEVBQUMsR0FBR0MsZ0JBQWdCQSxNQUFNO0FBQUEsRUFBQyxFQUFFO0FBRTNGWCxVQUFRWSxJQUFJLHVEQUF1RDtBQUNyRTtBQUVBLE1BQU1DLE9BQU9qQyxXQUFXa0MsU0FBU0MsZUFBZSxNQUFNLENBQUM7QUFDdkRGLEtBQUtHO0FBQUFBLEVBQ0gsdUJBQUMsTUFBTSxZQUFOLEVBQ0MsaUNBQUMsU0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQUksS0FETjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBRUE7QUFDRiIsIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlUm9vdCIsIkFwcCIsIndpbmRvdyIsImx1bmEiLCJjaGF0IiwiY3JlYXRlUHJveHkiLCJuYW1lc3BhY2UiLCJQcm94eSIsImdldCIsIl8iLCJtZXRob2QiLCJkYXRhIiwicmVzIiwiZmV0Y2giLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJqc29uIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwic3VjY2VzcyIsImd1YXJkaWFuIiwic2FuZGJveCIsInN0dWRlbnQiLCJwbHVnaW5zIiwiZXZvbHV0aW9uIiwidm9pY2UiLCJzcGVhayIsInN0b3AiLCJvblN0YXR1c0NoYW5nZSIsImxvZyIsInJvb3QiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbImluZGV4LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnO1xuaW1wb3J0IEFwcCBmcm9tICcuL0FwcCc7XG5pbXBvcnQgJy4vc3R5bGVzL2dsb2JhbC5jc3MnO1xuXG4vLyDilIDilIAgV2ViIEJyaWRnZSBGYWxsYmFjayAoRm9yIFBob25lL0Nocm9tZSBBY2Nlc3MpIOKUgOKUgFxuLy8g4pSA4pSAIFdlYiBCcmlkZ2UgRmFsbGJhY2sgKEhhcmRlbiAyLjA6IFJlc3RvcmVkIGJ1dCBpc29sYXRlZCkg4pSA4pSAXG5pZiAoIXdpbmRvdy5sdW5hIHx8ICF3aW5kb3cubHVuYS5jaGF0KSB7XG4gIGNvbnN0IGNyZWF0ZVByb3h5ID0gKG5hbWVzcGFjZSkgPT4gbmV3IFByb3h5KHt9LCB7XG4gICAgZ2V0OiAoXywgbWV0aG9kKSA9PiBhc3luYyAoZGF0YSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvJHtuYW1lc3BhY2V9LyR7bWV0aG9kfWAsIHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhIHx8IHt9KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlcy5qc29uKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgW1dlYiBCcmlkZ2VdIEZhaWxlZCB0byBjYWxsICR7bmFtZXNwYWNlfS4ke21ldGhvZH1gLCBlcnIpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdXZWIgQnJpZGdlIGNvbm5lY3Rpb24gZmFpbGVkJyB9O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93Lmx1bmEgPSBjcmVhdGVQcm94eSgnbHVuYScpO1xuICB3aW5kb3cuZ3VhcmRpYW4gPSBjcmVhdGVQcm94eSgnZ3VhcmRpYW4nKTtcbiAgd2luZG93LnNhbmRib3ggPSBjcmVhdGVQcm94eSgnc2FuZGJveCcpO1xuICB3aW5kb3cuc3R1ZGVudCA9IGNyZWF0ZVByb3h5KCdzdHVkZW50Jyk7XG4gIHdpbmRvdy5wbHVnaW5zID0gY3JlYXRlUHJveHkoJ3BsdWdpbnMnKTtcbiAgd2luZG93LmV2b2x1dGlvbiA9IGNyZWF0ZVByb3h5KCdldm9sdXRpb24nKTtcbiAgd2luZG93LnZvaWNlID0gd2luZG93LnZvaWNlIHx8IHsgc3BlYWs6ICgpID0+IHt9LCBzdG9wOiAoKSA9PiB7fSwgb25TdGF0dXNDaGFuZ2U6ICgpID0+IHt9IH07XG4gIFxuICBjb25zb2xlLmxvZygn8J+MkCBXZWIgQnJpZGdlIEFjdGl2ZTogRmFsbGJhY2sgZm9yIFN0YW5kYWxvbmUgQnJvd3NlcicpO1xufVxuXG5jb25zdCByb290ID0gY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKTtcbnJvb3QucmVuZGVyKFxuICA8UmVhY3QuU3RyaWN0TW9kZT5cbiAgICA8QXBwIC8+XG4gIDwvUmVhY3QuU3RyaWN0TW9kZT5cbik7XG4iXSwiZmlsZSI6IkM6L1VzZXJzL1JhdmlraXJhbi9PbmVEcml2ZS9EZXNrdG9wL2x1bmFfQUkgKDMpL2x1bmEvc3JjL2luZGV4LmpzeCJ9