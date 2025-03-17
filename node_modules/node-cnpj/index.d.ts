/**
 * Validação de CNPJ.
 *
 * Baseado no algoritmo de validação de CNPJ encontrado em:
 * @link http://www.geradorcnpj.com/javascript-validar-cnpj.htm
 *
 * @param {String} cnpj
 *
 * @return {Bool}
 */
export const validate: (cnpj: string) => boolean;

/**
 * Verifica se um CNPJ está ou não com máscara.
 *
 * @param {String} cnpj
 *
 * @return {Bool}
 */
export const isMasked: (cnpj: string) => boolean;

/**
 * Aplica a máscara num CNPJ.
 *
 * @param {String} cnpj
 *
 * @return {String}
 */
export const mask: (cnpj: string) => string;

/**
 * Remove as máscara de um CNPJ.
 *
 * @param {String} cnpj
 *
 * @return {String}
 */
export const unMask: (cnpj: string) => string;

/**
 * Gera um CNPJ aleatório.
 *
 * @param {Bool} masked Flag que indica se o CNPJ será gerado com ou sem máscara.
 *
 * @return {String}
 */
export const generate: (masked?: boolean) => string;
