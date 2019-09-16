const router          = require('express').Router();
const Logger          = require('../util/logger');
const locationService = require('../services/location');
const convert         = require('xml-js');

// GET /export/gpx => Get GPX file of all locations

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
      gpx: {
        _attributes: {
          version: "1.1",
          creator: "PaalDB",
          xmlns: "http://www.topografix.com/GPX/1/1",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:schemaLocation": "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
        },
        wpt: locations.map(l => {
          return {
            _attributes: {
              lat: l.latitude,
              lon: l.longitude
            },
            name: { _text:  l.name },
            desc: { _cdata: l.description || '' },
            ele:  { _text:  l.height || 0 }
          };
        })
      }
    }

    res.set("Content-Disposition", "attachment;filename=paaldb.gpx");
    res.set("Content-Type", "application/gpx+xml");

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
