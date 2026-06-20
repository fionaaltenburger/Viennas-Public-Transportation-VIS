import * as d3 from 'd3';

const metrics = [
    { key: "stops", label: "Number of Stops" },
    {key: "lines", label: "Number of Lines"},
    { key: "departures_per_hour", label: "Departures per Hour" },
    { key: "connectivity_score", label: "Connectivity-Score" }];

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
    const height = 380;
    const margin = { top: 30, right: 30, bottom: 80, left: 60 };

    const svg = d3.select("#comparison-chart")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const chartData = metrics.flatMap(metric =>
        data.map(district => 
            ({ district: district.district, 
                metric: metric.label, 
                value: district[metric.key] }))
    );

    const x0 = d3.scaleBand()
        .domain(metrics.map(d => d.label))
        .range([margin.left, width - margin.right])
        .paddingInner(0.25);

    const x1 = d3.scaleBand()
        .domain(data.map(d => d.district))
        .range([0, x0.bandwidth()])
        .padding(0.08);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.value) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.district))
        .range(["#b84545", "#562121"]);

    
    svg.append("g")
        .selectAll("g")
        .data(d3.group(chartData, d => d.metric))
        .join("g")
        .attr("transform", ([metric]) => `translate(${x0(metric)},0)`)
        .selectAll("rect")
        .data(([, values])  => values)
        .join("rect")
        .attr("x", d => x1(d.district))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => color(d.district));

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)); 
    
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left}, 15)`);

    data.forEach((d,i) => {
        const g = legend.append("g")
            .attr("transform", `translate(${i * 180},0)`)

        g.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(d.district))

        g.append("text")
            .attr("x",18)
            .attr("y",10)
            .text(d.district)
            .style("font-size", "12px")
    })
}
