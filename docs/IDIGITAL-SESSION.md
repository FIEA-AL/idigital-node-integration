```typescript
import { Session } from '@fiea-al/idigital-node-integration';
import { EncryptStorage } from "encrypt-storage";

export class IDigitalBrowserSession implements Session {
private SESSION_NAME: string = 'authentication';
private storage!: EncryptStorage;

    public start(): void {
        if (!this.storage) {
            this.storage = new EncryptStorage('<secret-key>', {
                storageType: 'localStorage',
                prefix: '@idigital'
            });

            if (!this.storage?.getItem(this.SESSION_NAME)) {
                this.storage?.setItem(this.SESSION_NAME, {});
            }
        }
    }

    public destroy(): void {
        this.storage?.clear();
    }

    public get(key: string): any {
        let object = this.storage?.getItem(this.SESSION_NAME);
        return object[key] ?? null;
    }

    public getAllKeys(): Record<string, any>{
        return this.storage?.getItem(this.SESSION_NAME)!;
    }

    public set(key: string, value: any): void {
        const object = this.storage?.getItem(this.SESSION_NAME);
        this.storage?.setItem(this.SESSION_NAME, Object.assign(object, {
            [key]: value
        }));
    }
}
```
