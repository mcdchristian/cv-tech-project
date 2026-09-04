import type { AuthenticatedUser } from '../../decorators/user.decorator';

/**
 * Contenu du JWT. Volontairement identique à `AuthenticatedUser` : ce que la
 * stratégie dépose sur la requête vient de ce payload, et les laisser diverger
 * ferait mentir le type que voient les contrôleurs.
 *
 * Rappel : un JWT est signé, pas chiffré. Tout ce qui figure ici est lisible
 * par quiconque détient le token — ne rien y mettre de confidentiel.
 */
export type PayloadInterface = AuthenticatedUser;
