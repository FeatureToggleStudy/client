import { RestBuilder } from '../../public/utils/rest';
import {
    setAccessTokenAction,
} from '../action-creators/auth';
import schema from '../schema';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from '../rest';

export const START_TOKEN_REFRESH = 'refresh-access-token/START';
export const STOP_TOKEN_REFRESH = 'refresh-access-token/STOP';

export const startTokenRefreshAction = () => ({
    type: START_TOKEN_REFRESH,
});

export const stopTokenRefreshAction = () => ({
    type: STOP_TOKEN_REFRESH,
});

class Refresher {
    constructor(store, refreshTime) {
        this.refreshTime = refreshTime;
        this.refreshId = undefined;
        this.refreshRequest = new RestBuilder()
            .url(urlForTokenRefresh)
            .params(() => {
                const { auth } = store.getState();
                const { refresh, access } = auth.token;
                return createParamsForTokenRefresh({ refresh, access });
            })
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');
                    const { access } = response;
                    store.dispatch(setAccessTokenAction(access));
                    // call itself again
                    this.schedule();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
    }

    load = () => {
    }

    schedule = () => {
        if (this.refreshId) {
            console.warn('Refresh is already scheduled');
        }
        this.refreshId = setTimeout(() => {
            this.refreshRequest.start();
            this.refreshId = undefined;
        }, this.refreshTime);
    }

    stop = () => {
        clearTimeout(this.refreshId);
        this.refreshId = undefined;
    }
}

const createRefreshAccessToken = (refreshTime = 150000) => {
    const refreshAccessToken = (store) => {
        const refresher = new Refresher(store, refreshTime);
        return next => (action) => {
            // store, next, action
            switch (action.type) {
                case START_TOKEN_REFRESH:
                    refresher.load();
                    refresher.schedule();
                    break;
                case STOP_TOKEN_REFRESH:
                    refresher.stop();
                    break;
                default:
            }
            return next(action);
        };
    };
    return refreshAccessToken;
};

export default createRefreshAccessToken;
