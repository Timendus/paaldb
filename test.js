let thing = require('./importers/paalkampeerders');

thing.fetch(Date.now());
//
// let {Location, Source, Mention} = require('./models');
//
// Location.create({
//   name: 'De Natte Plassen'
// }).then((loc) => {
//   console.log(loc);
//   console.log('done');
// });
//
//
// Source.create({
//   name: 'Staatsbosbeheer'
// }).then((loc) => {
//   console.log(loc);
//   console.log('done');
//
//   Mention.create({
//     name: 'De Natte Plassen',
//     SourceId: loc.id
//   }).then((loc) => {
//     console.log(loc);
//     console.log('done');
//   });
//
// });
