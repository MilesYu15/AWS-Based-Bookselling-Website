'use strict';

const logger = require('../winston.js');
const sdc = require('../statsd.js');

exports.log = function (body, result) {

    switch (body.level) {
        case 5:
            //Error logging
            logger.error(body.message, { service: 'Client' });
            break;
        case 4:
            //Warning logging
            logger.warn(body.message, { service: 'Client' });
            break;
        case 2:
            //Info logging
            logger.info(body.message, { service: 'Client' });
            break;
        case 3:
            sdc.timing(body.message, body.additional[0]);
            break;
    };

    result(null, { "message": "Logs received" });
}