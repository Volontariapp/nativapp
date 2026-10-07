const HEX_RADIX = 16;
const UUID_V4_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

/**
 * Clé d'idempotence d'une création (évènement, post, badge).
 * UUID v4 : le microservice la combine avec l'identifiant de l'utilisateur, elle n'a donc
 * pas besoin d'être imprévisible, seulement distincte d'un formulaire à l'autre.
 */
export const generateIdempotencyKey = (): string =>
  UUID_V4_TEMPLATE.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * HEX_RADIX);
    const value = char === 'x' ? random : (random % 4) + 8;
    return value.toString(HEX_RADIX);
  });
