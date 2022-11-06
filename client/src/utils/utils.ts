
export const catchErrors = (fn: any) => {
    return function (...args: any) {
        return fn(...args).catch((err: any) => {
        console.error(err);
        });
    };
}