import {createApp} from '../../../dist/whyis.js';

let app = null;
let initializing = false;

const getApp = () => {
    if (app) {
        return app;
    }
    if (initializing) {
        console.warn('whyis-fediverse: createApp initialization already in progress.');
        return null;
    }
    if (typeof createApp === 'function') {
        initializing = true;
        try {
            app = createApp();
        } catch (error) {
            console.error('whyis-fediverse: createApp failed to initialize.', error);
        } finally {
            initializing = false;
        }
        if (!app) {
            console.warn('whyis-fediverse: createApp did not return an app instance.');
        }
        return app;
    }
    console.warn('whyis-fediverse: createApp is not available for component registration.');
    return null;
};

const registerComponent = (name, definition) => {
    const appInstance = getApp();
    if (appInstance && typeof appInstance.component === 'function') {
        appInstance.component(name, definition);
        return definition;
    }
    console.warn(`whyis-fediverse: unable to register component "${name}".`);
    return definition;
};

export {registerComponent};
