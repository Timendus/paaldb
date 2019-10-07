const Request      = require('../../util/request');
const Logger       = require('../../util/logger');
const importHelper = require('../../util/import-helpers/save');
const root         = "https://admin.udinaturen.dk";

module.exports.run = async () => {
  // The Shelter app seems to query the 'ud i naturen' API for these categories:
  //   38: Lille lejrplads (small camping)
  //   39: Stor lejrplads (large camping)
  //   40: Frit teltningsområde (free tenting area)
  const locations = await fetchLocationsInCategories([38,39,40]);
  if (!locations) return;

  // Collect source information
  const source = {
    name:        "Ud i naturen",
    description: "'Ud i naturen' is een kaart en een database van het Deense Natuuragentschap Naturstyrelsen. Het Deense Natuuragentschap beheert ongeveer 200.000 hectare staatsbossen en natuurgebieden, om de grootst mogelijke waarde voor de samenleving te creëren in de vorm van een goed kader voor het buitenleven, bescherming van de natuur en efficiënt beheer van de bossen en andere natuurgebieden van het agentschap. Het bestuur beheert bijvoorbeeld Dyrehaven, het meest bezochte natuurgebied van Denemarken, grote gebieden in de Waddenzee, aangewezen als UNESCO Werelderfgoed, en Hanstholm Wildlife Reserve, het grootste duingebied van Denemarken.",
    contact:     "<a href='https://naturstyrelsen.dk/udinaturen/om-udinaturen/'>Over 'Ud i naturen' (Deens)</a>"
  };

  // Collect the locations we mention
  const mentions = locations.map(l => {
    const coordinates = getCoordinates(l);
    const attributes = (l.attributes.length > 0 ? l.attributes : l.subcategory.attributes).map(a => a.attribute);

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
  });

  // Save this data
  await importHelper.save({
    task:       __filename,
    projection: 'EPSG:25832',
    source,
    mentions
  });
}

async function fetchLocationsInCategories(categories) {
  let result;
  let locations = [];
  let next      = `/api/v1/facilityread/?format=json&subcategory__in=${categories.join(',')}&limit=500`;

  // 'Ud i naturen' paginates its results
  // Fetch all pages untill we have all locations
  do {
    try {
      result = await new Request(`${root}${next}`);
      result = JSON.parse(result);
      locations = locations.concat(result.objects);
      next = result.meta.next;
    } catch(error) {
      Logger.error(error);
      return false;
    }
  } while ( next );

  return locations;
}

function getCoordinates(location) {
  const point = [location.the_geom, location.the_geom2]
    .filter(g => g.type == 'Point')
    .shift();

  return point.coordinates || [null, null];
}
