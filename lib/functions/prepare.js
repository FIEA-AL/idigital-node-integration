import { IDigitalSession } from "../classes/idigital.session.js";
export function Prepare(target, name, descriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
        descriptor.value = function (...args) {
            try {
                IDigitalSession.start(args.slice(0, 1).pop());
                return original.apply(this, args);
            }
            catch (e) {
                console.log(`Error: ${e}`);
                throw e;
            }
        };
    }
    return descriptor;
}
//# sourceMappingURL=prepare.js.map