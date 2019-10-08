const {MentionProperty} = require('../models');

module.exports = {

  findAll: () => {
    return MentionProperty.findAll();
  }

};
