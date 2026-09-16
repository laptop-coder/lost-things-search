/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import "solid-devtools";

import App from "./App";

const html = document.documentElement;

const setTheme = (theme: string) => {
  html.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
};

setTheme(localStorage.getItem("theme") || "dark");

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
