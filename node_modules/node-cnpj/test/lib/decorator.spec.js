'use strict';

const decorator = require('../../lib/decorator'),
      assert    = require('unit.js');

describe('Decorator', function()
{
    it('Is Masked', function(done)
    {
        assert.bool(decorator.isMasked('12.345.678/1234-56')).isTrue();
        done();
    });

    it('Is UnMasked', function(done)
    {
        assert.bool(decorator.isMasked('12345678123456')).isFalse();
        done();
    });

    it('Mask String', function(done)
    {
        assert.string(decorator.mask('12345678123456')).isEqualTo('12.345.678/1234-56');
        done();
    });

    it('Mask Number', function(done)
    {
        assert.string(decorator.mask(12345678123456)).isEqualTo('12.345.678/1234-56');
        done();
    });

    it('Mask Fail', function(done)
    {
        assert.string(decorator.mask('123')).isEqualTo('123');
        done();
    });

    it('Unmask Masked', function(done)
    {
        assert.string(decorator.unMask('12.345.678/1234-56')).isEqualTo('12345678123456');
        done();
    });

    it('Unmask UnMasked', function(done)
    {
        assert.string(decorator.unMask('12345678123456')).isEqualTo('12345678123456');
        done();
    });
});
