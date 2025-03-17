'use strict';

const decorator = require('./decorator');

/**
 * Gera um CNPJ aleatório.
 *
 * @param {Bool} masked Flag que indica se o CNPJ será gerado com ou sem máscara.
 *
 * @return {String}
 */
exports.generate = function(masked)
{
    // Calculando os 12 primeiros aleatoriamente.
    var n1  = random();
    var n2  = random();
    var n3  = random();
    var n4  = random();
    var n5  = random();
    var n6  = random();
    var n7  = random();
    var n8  = random();
    var n9  = 0;
    var n10 = 0;
    var n11 = 0;
    var n12 = 1;
    // Calculando os 12 primeiros aleatoriamente.

    // Calculando o primeiro dígito de controle.
    var aux = n1 * 5 + n2 * 4 + n3 * 3 + n4 * 2 + n5 * 9 + n6 * 8 + n7 * 7 + n8 * 6 + n9 * 5 + n10 * 4 + n11 * 3 + n12 * 2;
    aux = mod(aux, 11);
    var nv1 = aux < 2 ? 0 : 11 - aux;
    // Calculando o primeiro dígito de controle.

    // Calculando o segundo dígito de controle.
    aux = n1 * 6 + n2 * 5 + n3 * 4 + n4 * 3 + n5 * 2 + n6 * 9 + n7 * 8 + n8 * 7 + n9 * 6 + n10 * 5 + n11 * 4 + n12 * 3 + nv1 * 2;
    aux = mod(aux, 11);
    var nv2 = aux < 2 ? 0 : 11 - aux;
    // Calculando o segundo dígito de controle.

    var generated = [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, nv1, nv2].join('');

    return masked ? decorator.mask(generated) : generated;
};

/**
 * Obtém um número inteiro randômico.
 *
 * @return {Int}
 */
function random()
{
    return Math.round(Math.random() * 9);
}

/**
 * Calcula o módulo entre dois números.
 *
 * @param {Int} a
 * @param {Int} b
 */
function mod(a ,b)
{
    return Math.round(a - (Math.floor(a / b) * b));
}
