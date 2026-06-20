import * as d3 from "d3";

export async function renderMap() {

    const geoDate = await d3.json("/data/districts.geojson");

    const width = 900;
    const height = 600;

    const svg = d3
        .select("#connectivity-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoIdentity()
        .reflectX(true)
        .fitSize([width, height], geoDate);

    const pathGenerator = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(geoDate.features)
        .join("path")
        .attr("d", pathGenerator)
        .attr("fill", "#b82e2e")
        .attr("stroke", "#ffffff")
}