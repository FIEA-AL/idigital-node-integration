import { RedirectLocation } from "@interfaces/idigital";

export type LogoutOptions = RedirectLocation & {
    afterSessionDestroy?: Function;
}