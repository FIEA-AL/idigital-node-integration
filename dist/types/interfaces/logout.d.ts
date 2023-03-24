import { RedirectLocation } from "./idigital";
export type LogoutOptions = RedirectLocation & {
    afterSessionDestroy?: Function;
};
