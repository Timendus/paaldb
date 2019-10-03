const Logger       = require('../util/logger');
const { Property } = require('../models');
const fs           = require('fs');
const Svgo         = require('svgo');
const svgo         = new Svgo();

(async function() {

  Logger.log("Updating properties...");

  await updateProperties([
    {
      label: 'hasShelter',
      value: 'yes',
      image: './icons/properties/shelter.svg',
      description: 'Er is een schuilhut of andere overdekking aanwezig'
    },
    {
      label: 'dogsOnLeashAllowed',
      value: 'yes',
      image: './icons/properties/dogs.svg',
      description: 'Honden zijn toegestaan (mits aangelijnd)'
    },
    {
      label: 'hasToilet',
      value: 'yes',
      image: './icons/properties/toilet.svg',
      description: 'Er is een toilet aanwezig'
    },
    {
      label: 'hasPrimitiveToilet',
      value: 'yes',
      image: './icons/properties/toilet.svg',
      description: 'Er is een primitief toilet aanwezig'
    },
    {
      label: 'hasShower',
      value: 'yes',
      image: './icons/properties/shower.svg',
      description: 'Er is een douche aanwezig'
    },
    {
      label: 'hasDrinkingWater',
      value: 'yes',
      image: './icons/properties/water.svg',
      description: 'Er is drinkwater aanwezig'
    },
    {
      label: 'hasWaterPump',
      value: 'yes',
      image: './icons/properties/water.svg',
      description: 'Er is een waterpomp aanwezig'
    }
  ]);

  Logger.log("Done!");

})();

async function updateProperties(properties) {
  properties.forEach(async property => {
    const object = (await Property.findOrCreate({
      where: {
        label: property.label,
        value: property.value
      }
    })).shift();

    object.description = property.description;
    object.image = await getOptimizedSVGDataURI(property.image);
    await object.save();
  });
}

async function getOptimizedSVGDataURI(file) {
  file = fs.readFileSync(file, 'utf8');
  file = (await svgo.optimize(file)).data;
  file = encodeURIComponent(file);
  return `data:image/svg+xml,${file}`;
}
