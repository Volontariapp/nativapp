# Monitoring de l'application (Datadog RUM)

L'application envoie à Datadog (site `us5`) les crashs natifs, les erreurs JavaScript et les erreurs réseau. Sans cet outil, le monitoring du backend ne voit pas ce que vivent les utilisateurs : une appli qui plante au lancement n'envoie aucune requête.

## Ce qui est collecté

- Crashs natifs, erreurs JavaScript non gérées, erreurs réseau (requêtes axios).
- L'utilisateur est identifié par son **identifiant seul**, jamais par son email ni son nom (`setMonitoringUser`, appelé par `AuthProvider`).
- Pas de suivi des interactions (taps) ni de propagation de traces vers l'API (`firstPartyHosts` vide) : aucun en-tête n'est ajouté aux requêtes.
- Le consentement de collecte est accordé par défaut (`TrackingConsent.GRANTED`).

## Où est le code

| Fichier | Rôle |
| :--- | :--- |
| `src/shared/lib/monitoring.ts` | Configuration du SDK, démarrage, utilisateur, erreur de test. Ne lance jamais d'exception. |
| `app/_layout.tsx` | Démarre le SDK au chargement du module, avant le premier rendu. |
| `src/context/auth/AuthProvider.tsx` | Rattache ou détache l'utilisateur à la connexion et à la déconnexion. |
| `src/screens/debug/components/monitoring-test-error-button.tsx` | Bouton « Test du monitoring » (Paramètres, mode debug). |

## Configuration d'un build

Le monitoring est **désactivé** tant que les deux identifiants manquent : l'appli tourne normalement.

| Variable | Rôle | Secret ? |
| :--- | :--- | :--- |
| `DD_RUM_APPLICATION_ID` | Identifiant de l'application RUM Datadog | Non, embarqué dans l'appli |
| `DD_RUM_CLIENT_TOKEN` | Client token RUM Datadog (différent de la clé d'API) | Non, embarqué dans l'appli |
| `DATADOG_API_KEY` | Clé d'API, pour envoyer symboles et source maps au build | **Oui**, secret EAS |
| `DATADOG_SITE` | Site Datadog, `us5.datadoghq.com` (posé dans `eas.json`) | Non |

`app.config.js` lit ces variables (et le fichier `.env` en production, comme les autres). Le plugin `expo-datadog` n'est ajouté qu'avec `DATADOG_API_KEY` : sans elle, le build reste identique à avant, mais les traces de pile des crashs ne sont pas lisibles dans Datadog (pas de symboles).

Le taux d'échantillonnage des sessions est `monitoring.sessionSampleRate` dans `config/default.config.json` (100 %). Le programme étudiant inclut 1 000 sessions mobiles par mois : à baisser si le volume approche.

## Tester

Le SDK a du code natif : il ne tourne **pas dans Expo Go**, il faut un build de développement (`eas build --profile development`). Puis : Paramètres, activer le mode debug, « Test du monitoring ». L'erreur apparaît dans Datadog (Error Tracking) sous quelques minutes. Si l'alerte « Monitoring inactif » s'affiche, les identifiants manquent dans ce build.
