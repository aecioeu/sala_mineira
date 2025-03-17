'use strict';

const validator = require('../../lib/validator'),
      assert    = require('unit.js');

const invalid = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999',
    '74.757.601/0001-81',
    '74757601000181',
    '58.274.162/0001-16',
    '58274162000116',
    '',
];

const valid = [
    '74.757.601/0001-80',
    '74757601000180',
    '58.274.162/0001-06',
    '58274162000106',
    '22.889.688/0001-45',
    '22889688000145',
];

describe('Validator', function()
{
    invalid.forEach(function(cnpj)
    {
        it('Invalid: ' + cnpj, function(done)
        {
            assert.bool(validator.validate(cnpj)).isFalse();
            done();
        });
    });

    valid.forEach(function(cnpj)
    {
        it('Valid: ' + cnpj, function(done)
        {
            assert.bool(validator.validate(cnpj)).isTrue();
            done();
        });
    });
});
