'use strict';

const cnpj   = require('../index'),
      assert = require('unit.js');

describe('Entry Point', function()
{
    it('Validate Masked Valid', function(done)
    {
        let valid = cnpj.validate('44.177.713/0001-09');
        assert.bool(valid).isTrue();
        done();
    });

    it('Validate Masked Invalid', function(done)
    {
        let valid = cnpj.validate('44.177.713/0001-08');
        assert.bool(valid).isFalse();
        done();
    });

    it('Validate UnMasked Valid', function(done)
    {
        let valid = cnpj.validate('44177713000109');
        assert.bool(valid).isTrue();
        done();
    });

    it('Validate UnMasked Invalid', function(done)
    {
        let valid = cnpj.validate('44177713000108');
        assert.bool(valid).isFalse();
        done();
    });

    it('Is Masked', function(done)
    {
        let valid = cnpj.isMasked('44.177.713/0001-09');
        assert.bool(valid).isTrue();
        done();
    });

    it('Is UnMasked', function(done)
    {
        let valid = cnpj.isMasked('44177713000109');
        assert.bool(valid).isFalse();
        done();
    });

    it('Mask', function(done)
    {
        let masked = cnpj.mask('44177713000109');
        assert.string(masked).isEqualTo('44.177.713/0001-09');
        done();
    });

    it('UnMask', function(done)
    {
        let unMasked = cnpj.unMask('44.177.713/0001-09');
        assert.string(unMasked).isEqualTo('44177713000109');
        done();
    });

    it('Generate UnMasked', function(done)
    {
        let generated = cnpj.generate();
        assert.bool(cnpj.validate(generated)).isTrue();
        done();
    });

    it('Generate Masked', function(done)
    {
        let generated = cnpj.generate(true);
        let isMasked  = new RegExp(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2}$/);

        assert.bool(cnpj.validate(generated)).isTrue();
        assert.bool(isMasked.test(generated)).isTrue();

        done();
    });
});
