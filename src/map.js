import * as d3 from "d3";

export async function renderMap(state) {

    //Data loading and preprocessing
    const geoData = await d3.json("/data/districts.geojson");

    const metrics = await d3.csv("/data/district_metrics.csv");
    const filteredMetrics = metrics.filter(d => d.dayTime == state.dayTime && d.daytype == state.dayType);
    const metricsByDistrict = new Map(filteredMetrics.map(d => [d.district, d]));

    //SVG setup
    const width = 900;
    const height = 600;

    const svg = d3
        .select("#connectivity-map")
        .html("") // Clear previous map
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const color = d3.scaleSequential()
        .domain([40,100])
        .interpolator(
            state.dayTime === "night" ? d3.interpolatePurples : d3.interpolateReds);

    const tooltip = d3
        .select("body")
        .append("div")  
        .attr("class", "tooltip");

    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width, height], geoData);

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw districts
    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
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

            tooltip
            .style("opacity", 1)
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY + 12) + "px")
            .html(
            `
                <strong>${district}</strong><br>
                Connectivity Score: ${row.connectivity_score}<br>
                Stops: ${row.stops}<br>
                Lines: ${row.lines}<br>
                Departures/hour: ${row.departures_per_hour}
            `);
        })

        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        }); 
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