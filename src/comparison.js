import * as d3 from 'd3';

const metrics = [
    { key: "connectivity_score", label: "Connectivity-Score" },
    { key: "departures_per_hour", label: "Departures per Hour" },
    { key: "stops", label: "Number of Stops" },
    {key: "lines", label: "Number of Lines"}
    ];

export async function renderComparison(state){
    const data = await d3.csv("/data/district_metrics.csv", d3.autoType);

    const filteredData = data.filter(d => d.dayTime === state.dayTime && d.daytype === state.dayType);

    //TODO: Wenn keines selber ausgewählt, dann automatisch den schelchten und besten auswählen
    const selectA = document.querySelector("#districtA"); 
    const selectB = document.querySelector("#districtB");

    if (!selectA.options.length) {
        filteredData.forEach(d => {
            selectA.add(new Option(d.district, d.district));
            selectB.add(new Option(d.district, d.district));
        });

        selectA.value = filteredData[0].district;
        selectB.value = filteredData[filteredData.length - 1].district;

        selectA.addEventListener("change", () => renderComparison(state));
        selectB.addEventListener("change", () => renderComparison(state));
    }

    const selected = [
        filteredData.find(d => d.district === selectA.value),
        filteredData.find(d => d.district === selectB.value)
    ].filter(Boolean);

    drawChart(selected);
}

function drawChart(data) {
  const width = 850;
  const height = 360;
  const margin = { top: 30, right: 40, bottom: 30, left: 180 };

  const svg = d3.select("#comparison-chart")
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const rowHeight = 55;
  const barMaxWidth = 180;

  const y = d3.scaleBand()
    .domain(metrics.map(m => m.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.35);

  const leftX = margin.left + 40;
  const rightX = margin.left + 360;

  // metric labels
  svg.selectAll(".metric-label")
    .data(metrics)
    .join("text")
    .attr("x", margin.left - 20)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .text(d => d.label);

  data.forEach((district, i) => {
    const groupX = i === 0 ? leftX : rightX;

    svg.append("text")
      .attr("x", groupX)
      .attr("y", 18)
      .attr("font-weight", "bold")
      .text(district.district);

    metrics.forEach(metric => {
      const maxValue =
        metric.key === "connectivity_score"
          ? 100
          : d3.max(data, d => d[metric.key]) || 1;

      const x = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, barMaxWidth]);

      const value = district[metric.key];

      svg.append("rect")
        .attr("x", groupX)
        .attr("y", y(metric.label))
        .attr("width", x(value))
        .attr("height", y.bandwidth())
        .attr("fill", i === 0 ? "#b84545" : "#562121")
        .attr("opacity", 0.75);

      svg.append("text")
        .attr("x", groupX + x(value) + 8)
        .attr("y", y(metric.label) + y.bandwidth() / 2)
        .attr("dominant-baseline", "middle")
        .text(metric.key === "connectivity_score" ? `${value}%` : value);
    });
  });
}
