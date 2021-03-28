'use strict';

const logService = require('../services/logServices');

exports.clientLog = function (req, res) {
  logService.log(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    }
    else res.status(200).send(data);
  });
}