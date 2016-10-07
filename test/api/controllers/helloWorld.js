'use strict';

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const httpMocks = require('node-mocks-http');
const events = require('events');
const helloWorld = require('../../../api/controllers/helloWorld');

chai.use(dirtyChai);
const expect = chai.expect;

describe('Hello World Controller', () => {
    it('should respond with "Hello World!" in json', (done) => {
        const expected = {
            message: 'Hello, Fred Bob!',
        };

        const req = httpMocks.createRequest({
            method: 'GET',
            url: '/hello',
            swagger: {
                params: {
                    name: {
                        value: 'Fred Bob',
                    },
                },
            },
        });
        const res = httpMocks.createResponse({
            eventEmitter: events.EventEmitter,
        });

        res.on('end', () => {
            /* eslint-disable no-underscore-dangle */
            const data = JSON.parse(res._getData());
            /* eslint-enable no-underscore-dangle */
            expect(data).to.be.equal(expected.message);
            expect(res.statusCode).to.be.equal(200);
            done();
        });

        helloWorld.hello(req, res);
    });
});
