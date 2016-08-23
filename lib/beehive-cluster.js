'use strict'
/* Constancts: */
// Earth radius in km:
const R = 6378.1

// Direction bearing in degrees:
const DEG_NORTH = 0
const DEG_EAST = 90
const DEG_SOUTH = 180
const DEG_WEST = 270

/**
 * Converts from degrees to radians.
 * Source: http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
 *
 * @param base
 * @returns {number}
 */
function radians(base) {
    return base * Math.PI / 180
}

/**
 *
 * @param base
 * @returns {{lat, lon}}
 */
function coordToRadians(base) {
    return {
        lat: radians(base.lat),
        lon: radians(base.lon)
    }
}

//
/**
 * Converts from radians to degrees.
 * Source (modified): http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
 * @param base
 * @returns {number}
 */
function degrees(base) {
    return base * 180 / Math.PI
}
/**
 *
 * @param base
 * @returns {{lat, lon}}
 */
function coordToDegrees(base) {
    return {
        lat: degrees(base.lat),
        lon: degrees(base.lon)
    }
}

/**
 *
 * @param float
 * @param places
 * @returns {*}
 */
function decimalPlaces(float, places = 6) {
    if (places === false) {
        return float
    }
    const multiplier = Math.pow(10, 6)
    return Math.round(float * multiplier) / multiplier
}
/**
 *
 * @param {{lat, lon}} coord
 * @param places
 * @returns {*}
 */
function coordDecimalPlaces(coord, places) {
    return {
        lat: decimalPlaces(coord.lat, places),
        lon: decimalPlaces(coord.lon, places)
    }
}

/**
 * Calculates a new coordinate by base coordinate + distance & bearing
 *
 * @param base - Base Coordinate in {lat: number, lon: number format}
 * @param distance - Distance from base in km.
 * @param bearing - Bearing relative to North, in degrees.
 * @returns {{lat: number, lon: number}}
 */
function polarProjection(base, distance, bearing) {
    // Convert to radians for conversion:
    const radBearing = radians(bearing % 360)
    const radBase = coordToRadians(base)

    const projected = {}

    projected.lat = Math.asin((Math.sin(radBase.lat) * Math.cos(distance / R)) + (Math.cos(radBase.lat) * Math.sin(distance / R) * Math.cos(radBearing)))
    projected.lon = radBase.lon + Math.atan2(Math.sin(radBearing) * Math.sin(distance / R) * Math.cos(radBase.lat), Math.cos(distance / R) - (Math.sin(radBase.lat) * Math.sin(projected.lat)))

    return coordToDegrees(projected)
}

const projections = {
    // East:
    0: (coord, xSpacing) => polarProjection(coord, xSpacing, DEG_EAST),
    // South-East
    1: (coord, xSpacing, ySpacing) => polarProjection(polarProjection(coord, ySpacing, DEG_SOUTH), xSpacing / 2, DEG_EAST),
    // South-West
    2: (coord, xSpacing, ySpacing) => polarProjection(polarProjection(coord, ySpacing, DEG_SOUTH), xSpacing / 2, DEG_WEST),
    // West
    3: (coord, xSpacing) => polarProjection(coord, xSpacing, DEG_WEST),
    // North-West:
    4: (coord, xSpacing, ySpacing) => polarProjection(polarProjection(coord, ySpacing, DEG_NORTH), xSpacing / 2, DEG_WEST),
    // North-East:
    5: (coord, xSpacing, ySpacing) => polarProjection(polarProjection(coord, ySpacing, DEG_NORTH), xSpacing / 2, DEG_EAST)
}

/**
 *
 * @param {{lat, lon}} baseCoordinate
 * @param {Number} ringCount
 * @param {Number} ringRadius
 * @param {Number} [decimalRounding]  must be an integer
 * @returns {Array}
 */
function mkHive(baseCoordinate, ringCount, ringRadius, decimalRounding = 6) {
    if (!baseCoordinate || !(typeof baseCoordinate.lat === 'number') || !(typeof baseCoordinate.lon === 'number')) {
        throw new Error('Base coordinate missing, or using incorrect format. should be: {lat: 0, lon: 0}')
    }

    // meters - radius of players heartbeat is 100m
    ringRadius /= 1000
    // dist between column centers
    let xSpacing = Math.sqrt(3) * ringRadius
    // dist between row centers
    let ySpacing = 3 * (ringRadius / 2)

    let result = []

    let currentRing = 1
    let coord = {
        lat: baseCoordinate.lat,
        lon: baseCoordinate.lon
    }

    // Begin with initial location:
    result.push({
        lat: baseCoordinate.lat,
        lon: baseCoordinate.lon
    })

    while (currentRing < ringCount) {
        // Set coord to start at top left
        coord = projections[4](coord, xSpacing, ySpacing)
        for (let direction = 0; direction < 6; direction++) {
            for (let i = 0; i < currentRing; i++) {
                let projection = projections[direction]
                coord = projection(coord, xSpacing, ySpacing)
                result.push(coordDecimalPlaces(coord, decimalRounding))
            }
        }
        currentRing++
    }

    result.toArray = function () {
        return this.map((coord) => {
            return [coord.lat, coord.lon]
        })
    }

    return result
}

mkHive({lat: 89.9999, lon: 0}, 8, 250).toArray().forEach(c => console.log(c.toString()))

module.exports = {
    polarProjection: polarProjection,
    mkHive: mkHive
}
