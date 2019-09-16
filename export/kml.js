const router          = require('express').Router();
const Logger          = require('../util/logger');
const locationService = require('../services/location');
const convert         = require('xml-js');

// GET /export/kml => Get KML file of all locations

router.get('/', async (req, res) => {
  try {
    const locations = await locationService.findAll();

    const xml = {
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "utf-8"
        }
      },
      kml: {
        _attributes: { xmlns: "http://www.opengis.net/kml/2.2" },
        Document: {
          name: { _text: 'PaalDB export' },
          description: { _text: 'Dingen' },
          Folder: {
            name: { _text: 'Layer name here' },
            Placemark: locations.map(l => {
              return {
                name: { _text: l.name },
                description: { _cdata: l.description || '' },
                Point: {
                  coordinates: { _text: `${l.longitude},${l.latitude},${l.height || 0}` }
                }
              };
            })
          }
        }
      }
    }

    res.set("Content-Disposition", "attachment;filename=paaldb.kml");
    res.set("Content-Type", "application/vnd.google-earth.kml+xml");

    res.send(
      convert.js2xml(xml, {
        spaces: 2,
        compact: true
      })
    );
  } catch(err) {
    Logger.error(err);
    res.status(500).end();
  }
});

module.exports = router;
