import "./style.css";

import * as d3 from "d3";
import { renderMap } from "./map.js";
import { renderComparison } from "./comparison.js";

const app = document.querySelector("#app");

const state = {
    dayTime: "day",
    dayType: "weekday"
};

app.innerHTML = `
  <header>
    <h1>How Connected Are You?</h1>
    <h2>Explore the connectivity of Vienna's public transportation system</h2>

    <div class="controls">
      <div class="segmented-control" data-control="dayTime">
        <button class="active" data-value="day">Day</button>
        <button data-value="night">Night</button>
        <span class="slider"></span>
      </div>

      <div class="segmented-control" data-control="dayType">
        <button class="active" data-value="weekday">Weekday</button>
        <button data-value="weekend">Weekend</button>
        <span class="slider"></span>
      </div>
    </div>
  </header>

  <main>

    <section class="view">
      <h2>District Connectivity Overview</h2>
      <div id="connectivity-map"></div>
    </section>

    <section class="view">
      <h2>District Comparison</h2>

      <div id="comparison-controls">
        <select id="districtA">
        </select>
        <select id="districtB">
        </select>
      </div>

      <div id="comparison-chart"></div>

    </section>
  </main>
`;

renderMap(state);
renderComparison(state);

document.querySelectorAll(".segmented-control").forEach(control => {
    const controlName = control.dataset.control;

    control.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const value = button.dataset.value;
        state[controlName] = value;

        control.querySelectorAll("button").forEach(btn => btn.classList.toggle("active", btn === button));
        
        control.dataset.active = value;

        updatePageState();
    });
});

function updatePageState() {
    document.body.classList.toggle("night-mode", state.dayTime === "night");
    renderMap(state);
    renderComparison(state);
}