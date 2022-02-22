
const MARGIN = { top:10, bottom:10, left:10, right:10 }
var svg = d3.select("svg#viz")

const width = svg.attr('width')
const height = svg.attr('height')

const chart_width = width - (MARGIN.left + MARGIN.right)
const chart_height = height - (MARGIN.top + MARGIN.bottom)

const chart = svg.append('g').attr("transform", `translate(${MARGIN.left}, ${MARGIN.right})`)
const interaction = chart.append("rect").attr("x",0).attr("y",0)
    .attr("width",chart_width).attr("height",chart_height)
    .attr("fill","none")
    .style("pointer-events","all");

let latlong_parse = function(d) {
    var lat = d.Latitude.split('°')
    var long = d.Longitude.split('°')

    lat[0] = +(lat[0])
    long[0] = +(long[0])

    if (lat[1] == "S") lat[0] *= -1
    if (long[1] == "W") long[0] *= -1

    return [lat[0],long[0]]
}

/*
function geoPipeline(...transforms) {
    return sink => {
      for (let i = transforms.length - 1; i >= 0; --i) {
        sink = transforms[i](sink);
      }
      return sink;
    };
}

function geoRotatePhi(deltaPhi) {
    const cosDeltaPhi = Math.cos(deltaPhi);
    const sinDeltaPhi = Math.sin(deltaPhi);
    return sink => ({
      point(lambda, phi) {
        const cosPhi = Math.cos(phi);
        const x = Math.cos(lambda) * cosPhi;
        const y = Math.sin(lambda) * cosPhi;
        const z = Math.sin(phi);
        const k = z * cosDeltaPhi + x * sinDeltaPhi;
        sink.point(Math.atan2(y, x * cosDeltaPhi - z * sinDeltaPhi), Math.asin(k));
      },
      lineStart() { sink.lineStart(); },
      lineEnd() { sink.lineEnd(); },
      polygonStart() { sink.polygonStart(); },
      polygonEnd() { sink.polygonEnd(); },
      sphere() { sink.sphere(); }
    });
}

var preclip = function () {
    const distance = 16;
    const tilt = 0 * Math.PI / 180;
    const alpha = Math.acos(distance * Math.cos(tilt) * 0.999);
    const clipDistance = d3.geoClipCircle(Math.acos(1 / distance) - 1e-6);
    return alpha ? geoPipeline(
      clipDistance,
      geoRotatePhi(Math.PI + tilt),
      d3.geoClipCircle(Math.PI - alpha),
      geoRotatePhi(-Math.PI - tilt)
    ) : clipDistance;
}
projection = d3.geoSatellite()
    .scale(400)
    //.translate([width / 2, height / 2])
    .rotate(50)
    .tilt(0)
    .distance(16)
    .preclip(preclip)
    .precision(0.1)
*/


var projection = d3.geoOrthographic()
projection = d3.geoMercator()
//projection = d3.geoHill()

let yaw = 150;

const requestData = async function() {
    let volcano = await d3.csv('fixed_latlong.csv')
    console.log(volcano)

    // Get this map?
    var context = await d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')

    //projection.fitSize([800,800], context)
    //projection.rotate([yaw, -20])
    var path = d3.geoPath().projection(projection)

    let map = chart.append('g')

    projection.rotate([yaw, -20])
    volcano.forEach( d => d.position = projection([d.long,d.lat]))

    // Build some interaction functions
    
    let detail = d3.select('div.detail')

    let focus = function(e, d) {
        detail.style('display', 'inline-block')
        detail.select('span#title').text(d.Volcano_Name)
        detail.select('span#nation').text(d.Country)
        detail.select('img').attr('src', d.Volcano_Image)
        d3.select(this).attr('stroke', 'black')
    }

    let hide = function(e, d) {
        detail.style('display','none')
        d3.select(this).attr('stroke', 'none')
    }

    let move = function(e, d) {
        detail.style('left', e.pageX+10+'px').style('top', e.pageY+10+'px')
    }

    // Insert the points, apply the interactions

    let points = map.selectAll('circle')
        .data(volcano)
        .join('circle')
        .attr('cx', d => d.position[0])
        .attr('cy', d => d.position[1])
        .attr('r', 2)
        .attr('fill', 'coral')
        .attr('alpha', 0.2)
        .attr('index', 0) 
        .on('mouseover', focus)
        .on('mouseout', hide)
        .on('mousemove', move)
    
    // Rotate the projection a little and update the points and so forth
    function update() {
        yaw += 0.5

        projection.rotate([yaw, -20])
        volcano.forEach( d => d.position = projection([d.long,d.lat]))

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

    }

    
    update()

    //window.setInterval(update, 50)
}

requestData()

