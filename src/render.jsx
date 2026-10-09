import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
function render() {
  return renderToString(<App />);
}
import { makeBrief, monthlyTotal, plans } from "./App.jsx";
export { makeBrief, monthlyTotal, plans, render };
