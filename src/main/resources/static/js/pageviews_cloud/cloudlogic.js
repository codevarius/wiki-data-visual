const cloudWidth = 1280;
const cloudHeight = 1000;
let cloudData = [];
let wikinodes = [];
let cloudLogicNodeCounter = 0;
let tapCount = 0;

let resetNodeX, resetNodeY, resetNodeWidth, resetNodeHeight;

let smooth = true;
let simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide().radius(d => d.node.circleSize + 1))
    .force("manyBody", d3.forceManyBody().strength(150))
    .force("center", d3.forceCenter().strength(smooth ? 0.05 : 1))
    .alpha(0.23)
    .alphaDecay(0);

const svg = d3.select("#graph_area").append("svg")
    .attr("id", "cloud_view")
    .attr("viewBox", [-cloudWidth / 2, -cloudHeight / 2, cloudWidth, cloudHeight]);

if (document.location.pathname === "/most-viewed-cloud") {
    initCloud("/most-viewed-cloud/data", null, "GET");
}

let img_url = function (id) {
    return "url(#wiki_img_" + id + ")";
}

function renderVisual() {
    simulation.on("tick", () => {
        svg.selectAll("g:not(.exit)")
            .data(simulation.nodes(), d => d.id)
            .join(
                enter => enter
                    .append('g')
                    .attr('id', d => d.id + '_g')
                    .append("circle")
                    .attr("fill", d => img_url(d.node.img))
                    .attr("color", '#7000ff')
                    .attr('wikiurl', d => d.node.url)
                    .attr('title', d => d.node.title)
                    .attr('stroke', 'grey')
                    .attr('stroke-width', 2)
                    .attr("id", d => d.id)
                    .attr("r", 0)
                    .attr("opacity", 0)
                    .on("mouseover", function () {
                        d3.select(this)
                            .transition()
                            .duration(500)
                            .attr('stroke', '#7000ff')
                            .attr('stroke-width', 4);
                    })
                    .on("mouseleave", function (d) {
                            let title = d.currentTarget.attributes[6].value;
                            let targetCircle = d3.select('#' + title.replace(':', ''));
                            if (targetCircle.size() > 0) {
                                targetCircle
                                    .transition()
                                    .duration(500)
                                    .attr('r', 80)
                                    .attr('opacity', 1)
                                    .attr('stroke-width', 2)
                                    .attr('stroke', 'grey');
                                let wikinodeToResize = wikinodes.filter(value => value.node && (value.node.title === d.currentTarget.attributes[3].value));
                                if (wikinodeToResize.length > 0) {
                                    if (wikinodeToResize[0].node) {
                                        wikinodeToResize[0].node.circleSize = 80;
                                    }
                                    let nodeImg = d3.select('.scaled_img_def');
                                    if (nodeImg.size() > 0) {
                                        nodeImg.transition().duration(500)
                                            .attr('width', resetNodeWidth) //nodeImg.attr('width') / 2
                                            .attr('height', resetNodeHeight) //nodeImg.attr('height') / 2
                                            .attr('x', resetNodeX) //-(nodeImg.data()[0].circle_size) / 1.2
                                            .attr('y', resetNodeY); //-(nodeImg.data()[0].circle_size) / 1.15
                                        nodeImg.classed("scaled_img_def", false);
                                    }
                                    d3.select('#' + wikinodeToResize[0].id + "_circle_text").remove();
                                    simulation.nodes(wikinodes);
                                }
                            }
                            tapCount = 0;
                        }
                    )
                    .on('click', (d) => {
                        d.stopPropagation();
                        if (tapCount === 1) {
                            handleNodeClick(d);
                            tapCount = 0;
                        } else {
                            tapCount++;
                        }

                        if (d && tapCount === 1) {
                            let title = d.currentTarget.attributes[6].value;
                            let targetCircle = d3.select('#' + title);
                            let wikinodeToResize = wikinodes.filter(value => value.node && (value.node.title === d.currentTarget.attributes[3].value));
                            if (wikinodeToResize[0] != null) {
                                if (wikinodeToResize.length > 0 && wikinodeToResize[0].node) {
                                    wikinodeToResize[0].node.circleSize = 160;
                                }
                                let nodeImg = d3.select('#' + wikinodeToResize[0].id + '_img_def')
                                    .attr("pointer-events", "none");
                                nodeImg.classed("scaled_img_def", true)
                                resetNodeX = nodeImg.attr('x');
                                resetNodeY = nodeImg.attr('y');
                                resetNodeWidth = nodeImg.attr('width');
                                resetNodeHeight = nodeImg.attr('height');
                                nodeImg.transition().duration(500)
                                    .attr('width', nodeImg.attr('width') * 2)
                                    .attr('height', nodeImg.attr('height') * 2)
                                    .attr('x', -(nodeImg.data()[0].circle_size * 2) / 1.2)
                                    .attr('y', -(nodeImg.data()[0].circle_size * 2) / 1.15)
                                simulation.nodes(wikinodes);
                                targetCircle
                                    .transition()
                                    .duration(500)
                                    .attr('r', 160);
                                let textLabel = d3.select('#' + wikinodeToResize[0].id + "_g")
                                    .append("text")
                                    .attr('y', -120)
                                    .attr("pointer-events", "none")
                                    .attr('id', wikinodeToResize[0].id + "_circle_text")
                                    .style('fill', 'white')
                                    .style('font-weight', 'bold')
                                    .style('font-size', 36)
                                    .style('font-family', '"Open Sans", sans-serif')
                                wikinodeToResize[0].node.title.split(' ').forEach(value => {
                                    textLabel.append("tspan")
                                        .attr("x", -100)
                                        .attr("dy", "1.5em")
                                        .text(value.includes('Категория:') ? value.substr(10, value.length) : value);
                                })
                            }
                        }
                    })
                    .transition()
                    .duration(700)
                    .attr("r", d => d.node.circleSize)
                    .attr('opacity', 1),
                function (update) {
                    update.attr("transform", (d) => 'translate(' + d.x + ',' + d.y + ')');
                },
                function (exit) {
                    exit
                        .classed("exit", true)
                        .transition()
                        .duration(700)
                        .attr("transform", 'scale(0,0)');
                }
            );
    });
}

function addNodeToSimulation(targetNodeId) {
    const cloudSize = cloudData.length >= 20 ? 20 : cloudData.length - 1;
    if (cloudData.length > 0) {
        const [x, y] = d3.pointRadial(2 * Math.PI * Math.random(), cloudWidth / 3);
        if (wikinodes.length >= cloudSize) {
            wikinodes.splice(0, 1);
        }
        wikinodes.push({
            id: cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].title.includes('Категория:') ? cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].title
                    .substr(10, cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].title.length)
                    .replace(/[:,.!?№%^&*)('\s\/\\0-9]+/g, '')
                : cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].title
                    .replace(/[:,.!?№%^&*)('\s\/\\0-9]+/g, ''),
            x,
            y,
            node: {
                title: cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].title,
                img: cloudLogicNodeCounter,
                url: cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].fullurl,
                circleSize: cloudData[cloudLogicNodeCounter < 0 ? 0 : cloudLogicNodeCounter].circle_size
            }
        });
        simulation.nodes(wikinodes);
        if (cloudLogicNodeCounter < (cloudData.length - 1)) {
            cloudLogicNodeCounter++;
        } else {
            cloudLogicNodeCounter = 0;
        }
    }
    clearExitedNodes();
}

function clearExitedNodes() {
    let svgToRemove = d3.selectAll(".exit");
    svgToRemove.remove();
}