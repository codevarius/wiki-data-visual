var chartData = [];
var xAxisData;
var pageUrl;
var pageId;
var thumbnails = [];
let overlap = 0.5;
const width = 1280;
const height = 660;
const margin = {top: 85, right: 50, bottom: 50, left: 50};

function refreshXaxis(xAxisData) {
    this.xAxisData = xAxisData;
}

function renderChart(title) {
    let dataMax = Math.max.apply(null, chartData[0]);
    let dataMin = Math.min.apply(null, chartData[0]);

    let x = d3
        .scaleLinear()
        .domain([0, chartData.length > 0 ? chartData[0].length - 1 : 0])
        .range([margin.left, width - margin.right]);

    let y = d3
        .scalePoint()
        .domain(chartData.map((d, i) => i))
        .range([margin.top, height - margin.bottom]);

    let z = d3
        .scaleLinear()
        .domain([d3.min(chartData, (d) => d3.min(d)), d3.max(chartData, (d) => d3.max(d))])
        .range([0, -overlap * y.step()]);

    let xAxis = (g) =>
        g
            .attr("transform", `translate(0,${height - margin.bottom - 260})`)
            .call(d3.axisBottom(x)
                .ticks(xAxisData.length)
                .tickValues(xAxisData.map((d, i) => i))
                .tickFormat(function (i) {
                    return xAxisData[i]
                }))
            .call((g) => g.select(".domain").remove())
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

    let area = d3
        .area()
        .defined((d) => !isNaN(d))
        .x((d, i) => x(i))
        .y0(0)
        .y1(z);

    let line = area.lineY1();

    let svg = d3
        .select("#chart_area")
        .append("svg")
        .attr("class", "chart_block")
        .attr("id", pageId)
        .attr('width', 300)
        .attr('height', 200)
        .attr("opacity", 0)
        .attr("viewBox", [0, 0, width, height])

    svg.append("defs").selectAll("pattern").data(thumbnails).enter()
        .append("pattern")
        .attr("id", "wiki_img_" + pageId)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 80)
        .attr("height", 80)
        .attr("xlink:href", (d, i) => {
            return d.source;
        })

    let serie = svg
        .append("g")
        .selectAll("g")
        .data(chartData)
        .join("g")
        .attr("transform", (d, i) => `translate(0,${y(i) + 1})`);

    serie
        .append("path")
        .attr("stroke", "black")
        .attr("fill", "transparent")
        .attr("stroke-width", "2px")
        .attr("d", line);

    serie.selectAll("dot")
        .data(chartData[0])
        .enter().append("circle")
        .attr("id", "path_dot")
        .attr("opacity", 0)
        .attr("r", 12.5)
        .attr("fill", d => {
            return d === dataMax ? "green" : d === dataMin ? "red" : "transparent";
        })
        .attr("cx", (d, i) => {
            return x(i);
        })
        .attr("cy", (d, i) => {
            return z(d);
        })
        .transition()
        .delay(2000)
        .duration(1000)
        .attr("opacity", 0.9)

    let totalLength = d3.selectAll("path").node().getTotalLength() * 2;

    var img_url = function () {
        return "url(#wiki_img_" + pageId + ")";
    }

    d3.select('[id="' + pageId + '"]')
        .append("a")
        .attr("xlink:href", pageUrl)
        .attr('target', '_blank')
        .append("circle")
        .attr('id', 'circle_img_' + pageId)
        .attr("r", 40)
        .attr("cx", 50)
        .attr("cy", 10)
        .attr('stroke', '#7000ff')
        .attr('stroke-width', 4)
        .style("fill", img_url)
        .classed('wiki_image_link', true);

    d3.select('[id="' + pageId + '"]')
        .append("text")
        .attr('x', 125)
        .attr('y', 25)
        .attr('font-size', 36)
        .text(title)
        .style('font-family', '"Open Sans", sans-serif');

    d3.select('[id="' + pageId + '"]')
        .append("text")
        .attr("id", "close_cross_" + pageId)
        .attr('x', width - 100)
        .attr('y', 25)
        .attr('font-size', 36)
        .text("❌")
        .style('font-family', '"Open Sans", sans-serif')
        .on("click", function () {
            d3.select(this.parentNode)
                .transition()
                .duration(1500)
                .attr("transform", "translate(-" + width + ",25)scale(1)")
                .on('end', () => {
                    d3.select(this.parentNode).remove();
                    chartTitlesAlreadyLoaded.splice(chartTitlesAlreadyLoaded.indexOf(title), 1);
                });
        });

    d3.select('[id="' + pageId + '"]')
        .append("text")
        .attr('x', 25)
        .attr('y', 525)
        .attr('font-size', 36)
        .style('font-family', '"Open Sans", sans-serif')
        .append("tspan")
        .attr("x", 25).attr("dy", "1.5em")
        .text("💪 Кол-во просмотров max: " + dataMax + " от " + xAxisData[chartData[0].indexOf(dataMax)])
        .append("tspan")
        .attr("x", 25).attr("dy", "1.5em")
        .text("😑 Кол-во просмотров min: " + dataMin + " от " + xAxisData[chartData[0].indexOf(dataMin)]);

    svg.append("g").call(xAxis);
    svg.transition()
        .duration(1500)
        .attr("opacity", 1);

    d3.selectAll("path")
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .delay(1500)
        .duration(3000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
}