// eslint-disable-next-line import/prefer-default-export
export const readySelector = ({ auth, app }) => (
    auth.authenticated ? (
        !app.waitingForProject &&
        !app.waitingForPreferences &&
        !app.waitingForLanguage &&
        !app.waitingForAvailableLanguages
    ) : (
        true
    )
);
