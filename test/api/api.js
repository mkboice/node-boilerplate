'use strict';

const expect = require('chai').expect;
const reqPromise = require('request-promise');
const app = require('express')();
const middleware = require('../../middleware');

const port = 10010;
let server;
describe('node-boilerplate api', () => {
    before(() => {
        middleware.init(app, port);
        server = app.listen(port);
    });

    after(() => {
        server.close();
    });

    it('should return hello string on a GET /hello with parms', () => {
        const options = {
            uri: 'http://localhost:10010/hello',
            qs: {
                name: 'Fed Bob',
            },
        };
        return reqPromise(options)
            .then((response) => {
                expect(response).to.be.equal(`"Hello, ${options.qs.name}!"`);
            });
    });

    it('should return hello string on a GET /hello without parms', () => {
        const options = {
            uri: 'http://localhost:10010/hello',
        };
        return reqPromise(options)
            .then((response) => {
                expect(response).to.be.equal('"Hello, stranger!"');
            });
    });

    it('should return status code 405 on a POST /hello', () => {
        const options = {
            method: 'POST',
            uri: 'http://localhost:10010/hello',
            qs: {
                name: 'Fed Bob',
            },
        };
        return reqPromise(options)
            .catch((err) => {
                const error = JSON.parse(err.error);
                expect(err.statusCode).to.be.equal(405);
                expect(error.message).to.be.equal('Route defined in Swagger specification (/hello) but there ' +
                    'is no defined post operation.');
                expect(error.allowedMethods[0]).to.be.equal('GET');
            });
    });
});
