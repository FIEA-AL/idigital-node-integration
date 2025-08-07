🚀 SSO IDigital - Guia de Implementação NestJS
Guia completo para implementação de SSO IDigital em aplicações NestJS usando a biblioteca oficial @fiea-al/idigital-node-integration.

� Pré-requisitos
NestJS 8+ 

Node.js 16+

Express Session configurado

Credenciais IDigital (CLIENT_ID) 

Deve ser solicitado a criação em ambiente de desenvolvimento:

* Client ID (Required)
* Rota de calback (Op)
* Rota de pós logout (Op)
* Rota do recurso do Front (Required)
* Client ID (Required)
* Rota de calback (Op)
* Rota de pós logout (Op)
* Rota do recurso do Front (Required)
### 

�️ Instalação
1. Instalar Dependências
```bash
npm install https://github.com/FIEA-AL/idigital-node-integration.git#v1.0.0
npm install express-session @types/express-session
npm install cookie-parser && npm install --save-dev @types/cookie-parser
```
2. Configurar Variáveis de Ambiente
```env
FRONTEND_ERROR_URL=http://localhost:3001/login
# IDigital SSO Configuration
SSO_CLIENT_ID=your-idigital-client-id
APP_BASE_URL=http://localhost:3000
FRONTEND_SUCCESS_URL=http://localhost:3001/dashboard
FRONTEND_ERROR_URL=http://localhost:3001/login
​
# Session Configuration  
SESSION_SECRET=your-super-secret-session-key-here
​
# Outras configurações do seu projeto
DATABASE_URL="file:./dev.db"
JWT_SECRET=seu_jwt_secret_aqui
PORT=3000
```
3. Configurar Express Session
⚠️ CRÍTICO: A configuração da sessão Express é fundamental para o funcionamento do SSO.

```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-session-secret',
    resave: false,
    saveUninitialized: true, // IMPORTANTE: permite criar sessão
    name: 'idigital.session',
    cookie: {
      secure: process.env.NODE_ENV === 'production', // false em dev/localhost
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax', // IMPORTANTE: para callbacks OAuth
    },
  }),
);
```
// main.ts
import session from 'express-session';
​
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração OBRIGATÓRIA da sessão
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default-session-secret',
      resave: false,
      saveUninitialized: true, // IMPORTANTE: permite criar sessão
      name: 'idigital.session',
      cookie: {
        secure: process.env.NODE_ENV === 'production', // false em dev/localhost
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'lax', // IMPORTANTE: para callbacks OAuth
      },
    }),
  );
​
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
📁 Estrutura da Implementação de Exemplo
```
session.d.ts
src/idigital/
├── idigital.service.ts    # Serviço principal do SSO
├── idigital.controller.ts # Controller com rotas
├── idigital.module.ts     # Módulo NestJS
└── dto/
    └── idigital.dto.ts    # DTOs para validação
​
src/types/
└── session.d.ts           # Tipos TypeScript para sessão
```
🏗️ Implementação
1. Tipos de Sessão (session.d.ts)
```typescript
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    idigital?: {
      state?: string;
      nonce?: string;
      codeVerifier?: string;
      idToken?: string;
      accessToken?: string;
      user?: {
        id: string;
        email: string;
        name: string;
      };
    };
  }
}
```
// src/types/session.d.ts
import 'express-session';
​
declare module 'express-session' {
  interface SessionData {
    idigital?: {
      state?: string;
      nonce?: string;
      codeVerifier?: string;
      idToken?: string;
      accessToken?: string;
      user?: {
        id: string;
        email: string;
        name: string;
      };
    };
  }
}
2. Service (idigital.service.ts)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IDigital,
  IDigitalSession,
  EnvironmentType,
  TokenSet,
} from '@fiea-al/idigital-node-integration';
​
// Importa o serviço de usuário e o serviço JWT (Logica interna)
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
​
@Injectable()
export class IDigitalService {
  private idigital: IDigital;
​
  constructor(
    // Logica interna (Sujeto a mudanças conforme sua implementação)
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    this.initializeIDigital();
  }
​
  private async initializeIDigital() {
    try {
      this.idigital = await IDigital.create({
        clientId: process.env.SSO_CLIENT_ID,
        issuer: EnvironmentType.HOMOLOGATION, // ou PRODUCTION
        applicationHost: process.env.APP_BASE_URL,
        redirectUri: `${process.env.APP_BASE_URL}/idigital/callback`,
        postLogoutRedirectUri: `${process.env.FRONTEND_SUCCESS_URL}`,
        scopes: ['openid', 'profile', 'email'],
      });
    } catch (error) {
      throw new Error('Erro ao inicializar IDigital: ' + error.message);
    }
  }
​
  async initiateLogin(sessionData: any) {
    try {
      const session = IDigitalSession.create(sessionData);
​
      const authUrl = (await this.idigital.authorize(session, {
        redirect: (url: string) => url, // Retorna URL em vez de redirecionar
      })) as string;
​
      return authUrl;
    } catch (error) {
      throw new Error('Erro ao iniciar login SSO: ' + error.message);
    }
  }
​
  async handleCallback(sessionData: any, queryParams: any): Promise<any> {
    try {
      // Verificar se os dados PKCE estão na sessão
      if (!sessionData.idigital) {
        throw new Error('Sessão perdida - dados PKCE não encontrados');
      }
​
      // A biblioteca já fez o trabalho e armazenou accessToken e idToken na sessão
      if (sessionData.idigital.idToken && sessionData.idigital.accessToken) {
        // Decodificar o ID Token JWT para extrair informações do usuário
        const idTokenPayload = this.decodeJWT(sessionData.idigital.idToken);
​
        return this.processUserLogin({
          id: idTokenPayload.sub,
          email: idTokenPayload.email,
          name: idTokenPayload.name || idTokenPayload.displayName,
        });
      }
​
      // Se não tiver tokens na sessão, tentar o método original
      const session = IDigitalSession.create(sessionData);
​
      // A biblioteca cuida de toda validação PKCE e JWT automaticamente
      const tokenSet: TokenSet = await this.idigital.callback(session, {
        params: queryParams,
      });
​
      // Extrai informações do usuário do ID Token
      const userInfo = (tokenSet.idToken as any).payload;
​
      return this.processUserLogin({
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
      });
    } catch (error) {
      throw new UnauthorizedException('Falha na autenticação SSO');
    }
  }
​
  async logout(sessionData: any): Promise<string> {
    const session = IDigitalSession.create(sessionData);
​
    return this.idigital.logout(session, {
      redirect: (url: string) => url, // Retorna URL em vez de redirecionar
      afterSessionDestroy: () => {
        console.log('🔄 Sessão SSO destruída');
      },
    }) as Promise<string>;
  }
​
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token JWT inválido');
    }
  }
​
  // Verifica se o usuário está autenticado
  // Usado na rota /status
  async isAuthenticated(sessionData: any): Promise<boolean> {
    const session = IDigitalSession.create(sessionData);
​
    try {
      const authStatus = await this.idigital.isAuthenticated(session);
      return authStatus.status;
    } catch (error) {
      return false;
    }
  }
​
  // Processa o login do usuário, verificando se existe no sistema interno
  // Dependendo da sua lógica, pode criar o usuário ou apenas retornar um sinal para registro
  private async processUserLogin(user: any): Promise<any> {
    const existingUser = await this.userService.findByEmail(user.email);
​
    if (existingUser) {
      // Usuário existe, gera JWT interno
      const payload = { email: existingUser.email, sub: existingUser.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      };
    } else {
      // Usuário não existe
      return {
        needsRegistration: true,
        user: {
          email: user.email,
          name: user.name,
        },
      };
    }
  }
}
```
​
3. Controller (idigital.controller.ts)
```typescript
import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { IDigitalService } from './idigital.service';
​
// Extender Request para incluir session
interface RequestWithSession extends Request {
  session: any;
}
​
@Controller('idigital')
export class IDigitalController {
  constructor(private idigitalService: IDigitalService) {}
​
  // Inicia processo de login SSO
  @Get('login')
  async login(@Req() req: RequestWithSession, @Res() res: Response) {
    try {
      const loginUrl = await this.idigitalService.initiateLogin(req.session);
​
      res.redirect(loginUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_ERROR_URL}?error=sso_init_failed`);
    }
  }
​
  // Callback do SSO IDigital
  @Get('callback')
  async callback(
    @Req() req: RequestWithSession,
    @Res() res: Response,
    @Query() query: any,
  ) {
    try {
      const loginResult = await this.idigitalService.handleCallback(
        req.session,
        query,
      );
​
      if (!loginResult.access_token) {
        // Usuário autenticado mas não cadastrado
        return res.status(200).json({
          message: 'Usuário autenticado com sucesso, porém não cadastrado.',
          needsRegistration: true,
          user: loginResult.user,
        });
      }
​
      // Usuário autenticado e cadastrado
      res.cookie('access_token', loginResult.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 dias
      });
​
      const successUrl = process.env.FRONTEND_SUCCESS_URL;
      res.redirect(successUrl);
    } catch (error) {
      const errorUrl = process.env.FRONTEND_ERROR_URL;
      res.redirect(errorUrl);
    }
  }
​
  // Logout do SSO
  @Get('logout')
  async logout(@Req() req: RequestWithSession, @Res() res: Response) {
    try {
      const logoutUrl = await this.idigitalService.logout(req.session);
​
      // Limpa cookie local
      res.clearCookie('access_token');
​
      // Redireciona para logout do IDigital
      res.redirect(logoutUrl);
    } catch (error) {
      console.error('❌ Erro no logout SSO:', error);
      res.clearCookie('access_token');
      res.redirect(process.env.FRONTEND_SUCCESS_URL || 'http://localhost:3001');
    }
  }
​
  // Verifica status de autenticação
  @Get('status')
  async status(@Req() req: RequestWithSession) {
    const isAuthenticated = await this.idigitalService.isAuthenticated(
      req.session,
    );
​
    return {
      authenticated: isAuthenticated,
      sessionId: req.sessionID,
      sessionData: req.session,
      timestamp: new Date().toISOString(),
    };
  }
}
```
​
4. Module (idigital.module.ts)
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/prisma.service';
​
import { IDigitalController } from './idigital.controller';
import { IDigitalService } from './idigital.service';
​
@Module({
  imports: [
    // Logica interna
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '2d' },
    }),
  ],
  controllers: [IDigitalController],
  providers: [
    IDigitalService,
    PrismaService, // Logica interna (Sujeto a mudanças conforme sua implementação) - PrismaService
  ],
  exports: [IDigitalService],
})
export class IDigitalModule {}
```
​
5. Integração no App Module
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { IDigitalModule } from './idigital/idigital.module';

@Module({
  imports: [
    // ... outros módulos
    IDigitalModule,
  ],
})
export class AppModule {}
```
🛣️ Rotas Disponíveis
Rota	Método	Descrição
/idigital/login	GET	Inicia processo de login SSO
/idigital/callback	GET	Callback do SSO (configurar no IDigital)
/idigital/logout	GET	Logout do SSO
/idigital/status	GET	Verifica status de autenticação
💻 Exemplo de Como Usar no Frontend 
Iniciar Login
```html
<a href="/idigital/login" class="btn-login">Entrar com IDigital</a>
```
Logout
```html
<a href="/idigital/logout" class="btn-logout">Sair</a>
```
Verificar Status
```javascript
async function checkAuthStatus() {
  const response = await fetch('/idigital/status');
  const data = await response.json();
  
  if (data.authenticated) {
    console.log('✅ Usuário autenticado:', data.user);
  } else {
    console.log('❌ Usuário não autenticado');
  }
}
```
� Problemas Conhecidos e Soluções
⚠️ Erro: "A propriedade state enviada difere da armazenada"
Causa: Configuração incorreta da sessão Express.

Solução: 

```javascript
// main.ts - Configuração CORRETA
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // OBRIGATÓRIO
    cookie: {
      secure: process.env.NODE_ENV === 'production', // false em localhost
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax', // OBRIGATÓRIO para OAuth
    },
  }),
);
```
Variáveis de Ambiente Produção
```env
NODE_ENV=production
​
SESSION_SECRET=super-secret-production-key
​
SSO_CLIENT_ID=production-client-id
APP_BASE_URL=https://yourdomain.com
​
// Exemplo
FRONTEND_SUCCESS_URL=https://yourdomain.com/dashboard
FRONTEND_ERROR_URL=https://yourdomain.com/login
```
🧪 Testando a Implementação
1. Teste Local
```bash
# Iniciar aplicação
npm run start:dev
​
# Acessar no navegador
http://localhost:3000/idigital/login
```

Usuário clica "Entrar" → GET /idigital/login

Sistema gera PKCE → Redireciona para IDigital

Usuário autentica → IDigital redireciona para /idigital/callback

Sistema processa callback → Extrai dados do usuário

Redireciona com sucesso → Frontend recebe dados do usuário

🔒 Segurança
A biblioteca oficial @fiea-al/idigital-node-integration garante:

✅ PKCE (Proof Key for Code Exchange) configurado automaticamente

✅ Validação JWT dos tokens recebidos

✅ Proteção CSRF através de state/nonce

✅ Gestão segura de códigos temporários

✅ Timeouts apropriados para requisições

📚 Recursos Adicionais
- [Biblioteca Node.js](https://github.com/FIEA-AL/idigital-node-integration)
- [NestJS Sessions](https://docs.nestjs.com/techniques/session)
- [Express Session](https://github.com/expressjs/session)

✅ Esta implementação fornece uma base sólida e reutilizável para integração SSO IDigital em qualquer projeto NestJS.

*Última atualização: Agosto 2025*
