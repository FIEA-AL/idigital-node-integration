# IDigital Node Integration

[![License][license-badge]][license-url]

> IDigital OpenID Connect integration for Node.js

**Table of Contents**

- [Installation](#installation)
- [Documentation](#documentation)
- [Recipes & Examples](#recipes--examples)
- [Develoment & contribution](#development--contribution)

## Installation
The library is not hosted in the NPM registry. However, fortunately, it is possible to add the library to your project via Yarn or NPM.

```bash
# Yarn
$ yarn add https://github.com/FIEA-AL/idigital-node-integration.git#v1.0.0

# NPM
$ npm install https://github.com/FIEA-AL/idigital-node-integration.git#v1.0.0
```

## Documentation
  This library has several classes that allow integration with IDigital. Are they:
- IDigitalStrategy: Allows integration with [Passport.js](https://www.npmjs.com/package/passport).
- IDigitalSession: allows you to persist session data.
- IDigitalIDToken: Validates identification tokens.
- IDigitalHelp: It has helper functions like isJWT.
- IDigitalAccessToken: Validates access tokens.
- IDigitalHttp: Makes requests to IDigital.
- IDigital: main class.

&nbsp;
```typescript
class IDigital {
    // Responsible for creating an instance of IDigital.
    static create(options: IDigitalOptions): Promise<IDigital>;
    
    // Responsible for fetching IDigital tokens.
    callback(session: Session, params?: AuthorizeResponse): Promise<TokenSet>;

    //Responsible for redirecting the user to IDigital.
    authorize(session: Session, location?: AuthorizeLocation): Promise<string | void>;

    // Responsible for verifying that the user is authenticated.
    // The type determines which tokens will be evaluated in the function.
    isAuthenticated(session: Session, type?: IsAuthenticatedType): Promise<IsAuthenticated>;
    
    // Responsible for deauthorizing the user in Digital.
    logout(session: Session, location?: AuthorizeLocation, afterSessionDestroy?: Function): Promise<string | void>;
}
```

## Recipes & Examples
Some usage examples are available over at [Recipes](/docs).

## Development & Contribution

- Clone the repo

```bash
$ git clone https://github.com/FIEA-AL/idigital-node-integration.git
```

- Install dependencies

```bash
$ yarn install
```

## Author

[Vitor Barcelos](https://www.linkedin.com/in/vitorbarcelos)

## Contributors
- [Bruno Pereira](https://www.linkedin.com/in/batlopes)
- [Isaque Lemos](https://www.linkedin.com/in/isaquelemos)
- [Matheus Melo](https://www.linkedin.com/in/matheus-melo-7198901a4)

## License

[MIT](https://github.com/FIEA-AL/idigital-node-integration/blob/main/LICENSE)

[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-url]: https://opensource.org/licenses/MIT
