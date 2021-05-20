var chartTitlesAlreadyLoaded = [];
var interval;
var categorySearchPathCounter = 0;

$('#alertBox').dialog({show: 'drop', hide: 'puff', modal: true, title: 'Oops...', autoOpen: false});

function stopCloud() {
    simulation.stop();
}

function restartCloud() {
    simulation.restart();
}

$("#search_button").click(function () {
    requestPage($.find("#search_input")[0].value);
})

$("#search_category_button").click(function () {
    $("#path_area").html('');
    categorySearchPathCounter = 0;
    let categoryTitle = $.find("#search_input")[0].value;
    if (categoryTitle !== '') {
        initCloud("/app/categories-cloud/data", categoryTitle, "POST");
    }
})

function requestPage(pageTitle) {
    if (pageTitle && !chartTitlesAlreadyLoaded.includes(pageTitle)) {
        chartTitlesAlreadyLoaded.push(pageTitle);
        $.ajax({
            type: "POST",
            url: "/app/pageviews/add-page",
            data: pageTitle,
            contentType: "text/plain",
            success: function (response) {
                let validatedViewCountDataArray;
                if (response.viewCounts.length > 0) {
                    validatedViewCountDataArray = response.viewCounts.map(element => {
                        if (element == null) {
                            return 0;
                        } else {
                            return element;
                        }
                    })

                    chartData.length = 0;
                    chartData.push(validatedViewCountDataArray);
                    pageUrl = response.fullurl;
                    pageId = response.pageId;
                    thumbnails = [response.thumbnail == null ? {
                        source: "https://picsum.photos/200",
                        width: 256,
                        height: 256
                    } : response.thumbnail];
                    refreshXaxis(response.dates);
                    renderChart(pageTitle);
                }
            }
        });
    }
}

function initCloud(requestUrl, categoryTitle, method) {
    $("#cloud_view").html('');
    $("#chart_area").html('');
    cloudData = [];
    wikinodes = [];
    cloudLogicNodeCounter = 0;
    $.ajax({
        type: method,
        url: requestUrl,
        data: categoryTitle,
        contentType: "text/plain",
        success: function (response) {
            let counter = 0;
            if (response.query != null) {
                cloudData = Object.values(response.query.pages)
                    .filter(value => value.ns !== -1)
                    .filter(value => value.title !== 'Заглавная страница');
                localStorage.setItem("cloudData", JSON.stringify(cloudData))

                svg.append("defs").selectAll("pattern")
                    .data(JSON.parse(localStorage.getItem("cloudData"))).enter()
                    .append("pattern")
                    .attr("id", function () {
                        return "wiki_img_" + counter++;
                    })
                    .attr("width", 1)
                    .attr("height", 1)
                    .attr("patternUnits", "objectBoundingBox")
                    .append("image")
                    .attr('id', d => {
                        return d.title.includes('Категория:') ? d.title
                            .substr(10, d.title.length).replace(/\s+/g, '')
                            .replace(/[:,.)('\s\/\\]+/g, '') + '_img_def'
                            : d.title
                            .replace(/[:,.)('\s\/\\]+/g, '') + '_img_def';
                    })
                    .attr("x", d => {
                        return -d.circle_size / 1.2;
                    })
                    .attr("y", d => {
                        return -d.circle_size / 1.15;
                    })
                    .attr("width", d => {
                        return d.circle_size * 3.7;
                    })
                    .attr("height", d => {
                        return d.circle_size * 3.7;
                    })
                    .attr("xlink:href", (d, i) => {
                        return d.thumbnail !== null
                            ? d.thumbnail.source
                            : d.title.includes("Категория:")
                                ? 'https://pbs.twimg.com/media/DYaOu10WAAAwD90.png'
                                : 'https://jamierollo.com/images/pixel%20art/Magic%20Book.gif';
                    });

                console.log("data successfully fetched");
                simulation.stop();
                clearInterval(interval);
                interval = setInterval(addNodeToSimulation, cloudData.length > 5 ? 1200 : 1200 + cloudData.length * 500);
                renderVisual();

                d3.selectAll('#path_area_loc_text').attr('style', 'color:#000000')
                let pathTextElement = d3.select("#path_area")
                    .style('font-size', '15px')
                    .append('span')
                    .append('text');
                pathTextElement.attr('id', 'path_area_loc_text')
                    .attr('index', categorySearchPathCounter)
                    .attr('style', 'color:#7000ff')
                    .text(categoryTitle + ' (' + cloudData.length + ') ➡️ ')
                    .on('click', function (d) {
                        if (d.currentTarget.attributes[2].value === 'color:#000000') {
                            let paths = d3.selectAll('#path_area_loc_text')
                            paths._groups[0].forEach((d) => {
                                if (d.attributes[1].nodeValue > pathTextElement._groups[0][0].attributes[1].value) {
                                    d.remove();
                                    pathTextElement.remove();
                                }
                            })
                            initCloud("/app/categories-cloud/data", categoryTitle, "POST");
                        }
                    });
                simulation.restart();
            } else {
                $('#alertBox').dialog('open');
                console.error("problems with data request from wiki!")
            }
        }
    });
    return cloudData;
}

function handleNodeClick(node) {
    let nodeTitle = node.path[0].attributes.title.value
    if (nodeTitle.includes('Категория:')) {
        let newCat = nodeTitle.substr(10, nodeTitle.length);
        initCloud("/app/categories-cloud/data", newCat, "POST");
        categorySearchPathCounter++;
    } else {
        requestPage(nodeTitle);
        wikinodes = wikinodes.filter(value => value.id !== node.currentTarget.id);
    }
}