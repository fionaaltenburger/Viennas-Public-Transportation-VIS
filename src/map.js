import * as d3 from "d3";

export async function renderMap() {

    const geoData = await d3.json("/data/districts.geojson");
    const metrics = await d3.csv("/data/district_metrics.csv");

    const metricsByDistrict = new Map(metrics.map(d => [d.district, d]));

    const width = 900;
    const height = 600;

    const svg = d3
        .select("#connectivity-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width, height], geoData);

    const pathGenerator = d3.geoPath().projection(projection);

    const color = d3.scaleSequential()
        .domain([40,100])
        .interpolator(d3.interpolateReds);

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip");

    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", pathGenerator)
        .attr("fill", d => {
            const district = getDistrictName(d);
            const row = metricsByDistrict.get(district);
            return row ? color(row.connectivity_score) : "#ddd";
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
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