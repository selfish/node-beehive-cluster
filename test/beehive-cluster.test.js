'use strict'

const chai = require('chai')
const expect = chai.expect
const beehive = require('../lib/beehive-cluster.js')

chai.config.includeStack = true

describe('mkHive(baseCoordinate, ringCount, ringRadius, decimalRounding)', () => {
    describe('generated results', () => {
        it('should return source coord only for ring size 1', () => {
            var coords = beehive.mkHive({lat: 1.11, lon: -0.13}, 1, 1)
            expect(coords.length).to.eql(1)
            expect(coords[0].lat).to.eql(1.11)
            expect(coords[0].lon).to.eql(-0.13)
        })
    })
    describe('coord count per n rings', () => {
        it('should return (3*n*(n-1))+1 coords per n rings', () => {
            for (var rings = 1; rings <= 50; rings++) {
                expect(beehive.mkHive({lat: 0, lon: 0}, rings, 1).length).to.eql((3 * rings * (rings - 1)) + 1)
            }
        })
    })
})

describe('polarProjection(base, distance, bearing)', () => {

    it('should handle bearing 360', () => {
        expect(beehive.polarProjection({lat: 0, lon:0}, 100, 360)).to.eql(beehive.polarProjection({lat: 0, lon:0}, 100, 0))

    })
    it('should handle bearing over 360', () => {
        expect(beehive.polarProjection({lat: 0, lon:0}, 100, 360*2)).to.eql(beehive.polarProjection({lat: 0, lon:0}, 100, 0))

    })
    it('should handle full bearing rotations', () => {
        expect(beehive.polarProjection({lat: 0, lon:0}, 100, 5550)).to.eql(beehive.polarProjection({lat: 0, lon:0}, 100, 150))

    })
    it('should handle bearing huge random bearing', () => {
        expect(beehive.polarProjection({lat: 0, lon:0}, 100, 360*Math.floor(Math.random()*1e6))).to.eql(beehive.polarProjection({lat: 0, lon:0}, 100, 360))

    })

    it('should handle 0 distance', () => {
        expect(beehive.polarProjection({lat: 0, lon:0}, 0, 0)).to.eql({lat: 0, lon:0})
        expect(beehive.polarProjection({lat: -1.334345, lon:45.32423}, 0, 0)).to.eql({lat: -1.334345, lon:45.32423})
        expect(beehive.polarProjection({lat: 0, lon:0}, 0, 0)).to.eql({lat: 0, lon:0})
        expect(beehive.polarProjection({lat: 0, lon:0}, 0, 12)).to.eql({lat: 0, lon:0})
        expect(beehive.polarProjection({lat: 0, lon:0}, 0, 456)).to.eql({lat: 0, lon:0})
        expect(beehive.polarProjection({lat: -1.334345, lon:45.32423}, 0, 233)).to.eql({lat: -1.334345, lon:45.32423})
        expect(beehive.polarProjection({lat: -1.334345, lon:45.32423}, 0, -500)).to.eql({lat: -1.334345, lon:45.32423})
        expect(beehive.polarProjection({lat: -1.334345, lon:45.32423}, 0, 567657)).to.eql({lat: -1.334345, lon:45.32423})
    })
})

// mkHive({
//     lat: 40.804162,
//     lon: -73.951721
// }, 100, 1000).forEach(c => {
//     console.log(`${c.lat}, ${c.lon}`)
// })

// ring sizes: Points = (3*n*(n-1))+1
