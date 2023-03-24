```typescript
import { EnvironmentType, IDigital, IDigitalSession, TokenSet } from '@fiea-al/idigital-node-integration';
import { Controller, Get, Req, Res } from '@nestjs/common';

let idigital: IDigital = null;
(async function createIDigital() {
    idigital = await IDigital.create({
        scopes: ['openid', 'email'],
        clientId: 'request-your-client-id',
        issuer: EnvironmentType.HOMOLOGATION,
        applicationHost: 'http://localhost:3000',
        redirectUri: 'http://localhost:3000/auth/callback',
        postLogoutRedirectUri: 'http://localhost:3000/auth/logout/callback',
    });
})();

@Controller('authentication')
export class AuthController {
    @Get()
    public async authorize(@Req() request, @Res() response): Promise<string | void> {
        const session = new IDigitalSession(request.session);
        return idigital.authorize(session, response);
    }

    @Get('logout')
    public logout(@Req() request, @Res() response): Promise<string | void> {
        const session = new IDigitalSession(request.session);
        return idigital.logout(session, response, () => {
            console.log('After the session is destroyed.');
            console.log('You can destroy your session.');
        });
    }

    @Get('callback')
    public async callback(@Req() request): Promise<TokenSet> {
        const session = new IDigitalSession(request.session);
        const tokenSet = await idigital.callback(session, request.query);
        console.log("Your application's authentication logic");
        return tokenSet;
    }

    @Get('logout/callback')
    public async afterLogout(@Res() response): Promise<void> {
        console.log('After logout is finished.');
        console.log("Go to home page.");
        return response.redirect('/');
    }
}

```
