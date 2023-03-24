```typescript
import { IDigital, EnvironmentType, TokenSet, Session } from '@fiea-al/idigital-node-integration';
import { IDigitalBrowserSession } from './idigital.browser.session';
import { Component } from '@angular/core';

@Component({
    selector: 'idigital-authentication',
    templateUrl: './idigital-auth.component.html',
    styleUrls: ['./idigital-auth.component.less'],
})
export class IDigitalAuthComponent {
    private session: Session = new IDigitalBrowserSession();
    private idigital?: IDigital = undefined;

    async ngOnInit() {
        await this.init();
        this.afterCallback();
    }

    private async init(): Promise<void> {
        if (!this.idigital) {
            this.idigital = await IDigital.create({
                cache: this.session,
                scopes: ['openid', 'email'],
                clientId: 'request-your-client-id',
                issuer: EnvironmentType.HOMOLOGATION,
                applicationHost: 'http://localhost:4200',
                redirectUri: 'http://localhost:4200/auth/callback',
                postLogoutRedirectUri: 'http://localhost:4200/auth/logout/callback',
            });
        }
    }

    public authorize(): Promise<string | void> {
        return this.idigital?.authorize(this.session, {
            redirect: (url: string) => {
                window.location.href = url;
            }
        });
    }

    public logout(): Promise<string | void> {
        return this.idigital?.logout(this.session, {
            redirect: (url: string) => {
                window.location.href = url;
            }
        })!;
    }

    public callback(params: any): Promise<TokenSet> {
        return this.idigital?.callback(this.session, params)!;
    }

    private afterCallback() {
        this.activatedRoute.queryParams.subscribe(async data => {
            if (data['code'] && data['iss'] && data['state']) {
                const tokenSet =  await this.callback(data);
                console.log("Your application's authentication logic");
            }
        });
    }

    public afterLogout(): void {
        console.log('After logout is finished.');
        console.log("Go to home page.");
        window.location.href = '/';
    }
}
```
