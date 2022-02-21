
const MARGIN = { top:10, bottom:10, left:10, right:10 }
var svg = d3.select("svg#viz")

const width = svg.attr('width')
const height = svg.attr('height')

const chart = svg.append('g').attr("transform", `translate(${MARGIN.left}, ${MARGIN.right})`)

let latlong_parse = function(d) {
    var lat = d.Latitude.split('°')
    var long = d.Longitude.split('°')

    lat[0] = +(lat[0])
    long[0] = +(long[0])

    if (lat[1] == "S") lat[0] *= -1
    if (long[1] == "E") long[0] *= -1

    return [lat[0],long[0]]
}


var projection = d3.geoOrthographic()

let yaw = 300;

function update() {
    projection.rotate([yaw, -45])

    chart.append('g').selectAll('path')
        .data(context.features)
        .join("path")
        .attr('d', path)
        .attr('stroke', '#000')
        .attr('fill','none')

}


const requestData = async function() {
    let volcano = await d3.csv('volcanoes.csv')

    volcano.forEach(d => {
        d.latlong = latlong_parse(d)
    })

    // Get this map?
    var context = await d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

    projection.fitSize([400,400], context)
    var path = d3.geoPath().projection(projection)

    let map = chart.append('g')

    volcano.forEach( d => d.position = projection(d.latlong))
    
    map.selectAll('path')
        .data(context.features)
        .join("path")
        .attr('d', path)
        .attr('stroke', '#000')
        .attr('fill','none')

    map.selectAll('circle')
        .data(volcano)
        .join('circle')
        .attr('cx', d => d.position[0])
        .attr('cy', d => d.position[1])
        .attr('r', 2)
        .attr('fill', 'coral')

    function update() {
        yaw += 0.5
        projection.rotate([yaw, -45])

        volcano.forEach( d => d.position = projection(d.latlong))

        map.selectAll('path')
            .data(context.features)
            .join("path")
            .attr('d', path)
            .attr('stroke', '#000')
            .attr('fill','none')
        
        map.selectAll('circle')
            .data(volcano)
            .join('circle')
            .attr('fill','coral')
            .attr('cx', d => d.position[0])
            .attr('cy', d => d.position[1])

    }

    window.setInterval(update, 50)
}

requestData()

