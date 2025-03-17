'use strict';

/**
 * Verifica se um CNPJ está ou não com máscara.
 *
 * @param {String} cnpj
 *
 * @return {Bool}
 */
exports.isMasked = function(cnpj)
{
    const regexp = new RegExp(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2}$/);

    return regexp.test(cnpj);
};

/**
 * Aplica a máscara num CNPJ.
 *
 * @param {String} cnpj
 *
 * @return {String}
 */
exports.mask = function(cnpj)
{
    cnpj = String(cnpj);

    if (cnpj.length !== 14) {
        return cnpj;
    }

    return cnpj.substring(0, 2)  + '.' +
           cnpj.substring(2, 5)  + '.' +
           cnpj.substring(5, 8)  + '/' +
           cnpj.substring(8, 12) + '-' +
           cnpj.substring(12, 14);
};

/**
 * Remove as máscara de um CNPJ.
 *
 * @param {String} cnpj
 *
 * @return {String}
 */
exports.unMask = function(cnpj)
{
    return String(cnpj).replace(/(\.|\-|\/)/g, '');
};
