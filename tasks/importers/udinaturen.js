const jsonImporter = require('../../util/import-helpers/json');
const array        = require('../../util/array');

// The Shelter app seems to query the 'ud i naturen' API for these categories:
//   38: Lille lejrplads (small camping)
//   39: Stor lejrplads (large camping)
//   40: Frit teltningsområde (free tenting area)
const categories = [38,39,40];
const root       = "https://admin.udinaturen.dk";

module.exports = jsonImporter({
  task: __filename,
  url:  `${root}/api/v1/facilityread/?format=json&subcategory__in=${categories.join(',')}&limit=500`,

  // This source provides coordinates in this projection
  projection: 'EPSG:25832',

  // This source uses pagination. Fetch all pages untill we have all locations
  nextUrl: json => json.meta.next ? `${root}${json.meta.next}` : false,

  // Reduce the responses to one array with locations
  combineResponses: responses => array.flatten(responses.map(r => r.objects)),

  // Collect source information
  source: () => ({
    name:        "Ud i naturen",
    description: "'Ud i naturen' is een kaart en een database van het Deense Natuuragentschap Naturstyrelsen. Het Deense Natuuragentschap beheert ongeveer 200.000 hectare staatsbossen en natuurgebieden, om de grootst mogelijke waarde voor de samenleving te creëren in de vorm van een goed kader voor het buitenleven, bescherming van de natuur en efficiënt beheer van de bossen en andere natuurgebieden van het agentschap. Het bestuur beheert bijvoorbeeld Dyrehaven, het meest bezochte natuurgebied van Denemarken, grote gebieden in de Waddenzee, aangewezen als UNESCO Werelderfgoed, en Hanstholm Wildlife Reserve, het grootste duingebied van Denemarken.",
    contact:     "<a href='https://naturstyrelsen.dk/udinaturen/om-udinaturen/'>Over 'Ud i naturen' (Deens)</a>"
  }),

  // Collect the locations we mention
  mentions: json => json.map(l => {
    const point = [l.the_geom, l.the_geom2]
      .filter(g => g.type == 'Point')
      .shift();

    const coordinates = point.coordinates || [null, null];

    const attributes = (l.attributes.length > 0 ? l.attributes : l.subcategory.attributes)
                       .map(a => a.attribute);

    return {
      externalId:  l.facilityid,
      date:        l.lastedited,
      link:        l.facilitylink,
      name:        l.name,
      latitude:    coordinates[1],
      longitude:   coordinates[0],
      description: l.longdescription || l.shortdescription,

      properties:  {
        accessibleWithWheelchair: attributes.includes(1),
        hasDrinkingWater:         attributes.includes(6),
        hasShelter:               attributes.includes(9),
        hasFireplace:             attributes.includes(10),
        accessibleWithBoat:       attributes.includes(11),
        hasShower:                attributes.includes(12),
        dogsOnLeashAllowed:       attributes.includes(13),
        horsesAllowed:            attributes.includes(14),
        accessibleWithStroller:   attributes.includes(15),
        hasPrimitiveToilet:       attributes.includes(9001),
        hasToilet:                attributes.includes(9002)
      }
    };
  })
});
