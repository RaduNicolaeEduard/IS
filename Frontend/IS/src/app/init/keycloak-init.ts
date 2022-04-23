import { KeycloakService } from "keycloak-angular";

export function initializeKeycloak(
  keycloak: KeycloakService
  ) {
    return () =>
      keycloak.init({
        config: {
          url: 'http://localhost' + '/auth',
          realm: 'test',
          clientId: 'fronted',
        },
        initOptions: {
            //   onLoad: 'login-required',
            //   checkLoginIframe: true
            }     
      });
}