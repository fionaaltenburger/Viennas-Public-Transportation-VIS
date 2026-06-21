import * as d3 from "d3";

export async function renderMap(state) {

    //Data loading and preprocessing
    const geoData = await d3.json(`${import.meta.env.BASE_URL}data/districts.geojson`)

    const metrics = await d3.csv(`${import.meta.env.BASE_URL}data/district_metrics.csv`, d3.autoType)
    const filteredMetrics = metrics.filter(d => d.dayTime == state.dayTime && d.dayType == state.dayType);
    const metricsByDistrict = new Map(filteredMetrics.map(d => [d.district, d]));

    //SVG setup
    const width = 900;
    const height = 600;

    const svg = d3
        .select("#connectivity-map")
        .html("") // Clear previous map
        .append("svg")
        .attr("class", "map-svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img")
        .attr("aria-label", "Vienna district connectivity map");

    const color = d3.scaleSequentialSqrt()
        .domain([0,100])
        .interpolator(
            state.dayTime === "night" ? d3.interpolatePurples : d3.interpolateReds);

    const tooltip = d3
        .select("body")
        .selectAll(".tooltip")
        .data([null])
        .join("div")
        .attr("class", "tooltip");

    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width, height], geoData);

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw districts
    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("class", "district")
        .attr("d", pathGenerator)

        // Color districts
        .attr("fill", d => {
            const district = getDistrictName(d);
            const row = metricsByDistrict.get(district);
            return row ? color(row.connectivity_score) : "#ddd";
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)

        // Tooltip interactivity
        .on("mouseover", (event, d) => {
            const district = getDistrictName(d);
            const row = metricsByDistrict.get(district); 

            d3.select(event.currentTarget).classed("is-hovered", true).raise();

            tooltip
            .style("opacity", 1)
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY + 12) + "px")
            .html(
            `
                <strong>${district}</strong><br>
                Connectivity Score: ${row.connectivity_score}<br>
            `);
        })

        .on("mousemove", event => {
            tooltip
                .style("left", (event.pageX + 16) + "px")
                .style("top", (event.pageY + 16) + "px");
        })

        .on("mouseleave", event => {
            d3.select(event.currentTarget).classed("is-hovered", false);
            tooltip.style("opacity", 0);
        }); 


        // Legend
        const legendWidth = 200;
        const legendHeight = 20;

        const defs = svg.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "connectivity-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", color(40));

        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", color(100));
    

        const legend = svg.append("g")
            .attr("class", "map-legend")
            .attr("transform", `translate(${width - legendWidth - 20}, ${height - legendHeight - 20})`);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#connectivity-gradient)")
            .style("stroke", "#000")
            .style("stroke-width", 1);      

        legend.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .text("Connectivity Score")
            .style("font-size", "12px")
            .style("font-weight", "bold");

        legend.append("text")
            .attr("x", 0)
            .attr("y", legendHeight + 15)
            .text("Low")
            .style("font-size", "10px");

        legend.append("text")
            .attr("x", legendWidth)
            .attr("y", legendHeight + 15)
            .text("High")
            .style("font-size", "10px")
            .style("text-anchor", "end");
}

    function getDistrictName(feature) {
        return (
            feature.properties.name ||
            feature.properties.district ||
            feature.properties.NAMEK ||
            feature.properties.NAME ||
            feature.properties.BEZ_NAME
        )
    }
