import { AsyncLocalStorage } from "node:async_hooks";

const cloudflareContext = new AsyncLocalStorage();

export const runWithCloudflareContext = (env, callback) => {
    return cloudflareContext.run(env, callback);
};

export const getCloudflareEnv = () => {
    return cloudflareContext.getStore();
};