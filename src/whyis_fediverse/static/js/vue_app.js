import {Vue, createApp} from '../../../dist/whyis.js';

let app = null;

const getApp = () => {
    if (app) {
        return app;
    }
    if (typeof createApp === 'function') {
        app = createApp();
    }
    return app;
};

const registerComponent = (name, definition) => {
    const appInstance = getApp();
    if (appInstance && typeof appInstance.component === 'function') {
        appInstance.component(name, definition);
        return definition;
    }
    if (Vue && typeof Vue.component === 'function') {
        return Vue.component(name, definition);
    }
    return definition;
};

export {registerComponent};
