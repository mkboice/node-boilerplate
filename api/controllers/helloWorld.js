'use strict';

const util = require('util');

module.exports = {
    hello,
};

function hello(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    const name = req.swagger.params.name.value || 'stranger';
    const helloString = util.format('Hello, %s!', name);

    // this sends back a JSON response which is a single string
    res.status(200).json(helloString);
}
