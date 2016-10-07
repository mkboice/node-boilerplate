'use strict';

const BPromise = require('bluebird');
const SwaggerExpress = require('swagger-express-mw');
const swaggerUI = require('swagger-tools/middleware/swagger-ui');
const bodyParser = require('body-parser');

const config = {
    appRoot: __dirname, // required config
};

module.exports = {
    init,
};

function init(app, port) {
    return createSwaggerExpressRunner()
        .then((swaggerExpress) => {
            // Set up the swagger ui to serve at /docs
            app.use(swaggerUI(swaggerExpress.runner.swagger));

            // parse application/x-www-form-urlencoded
            app.use(bodyParser.urlencoded({ extended: false }));

            // install middleware
            swaggerExpress.register(app);

            if (swaggerExpress.runner.swagger.paths['/hello']) {
                console.log(`try this:\ncurl http://127.0.0.1:${port}/hello?name=Scott`);
            }
        });
}


function createSwaggerExpressRunner() {
    return new BPromise((resolve, reject) =>
        SwaggerExpress.create(config, (err, runner) => {
            if (err) {
                reject(err);
            }
            return resolve(runner);
        })
    );
}

