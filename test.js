const {stefanKruithof, staatsbosbeheer, natuurbrandrisico} = require('./importers');

stefanKruithof.fetch(Date.now());
staatsbosbeheer.fetch(Date.now());
natuurbrandrisico.fetch(Date.now());
