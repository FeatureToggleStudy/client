import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import {
    createRequestCoordinator,
    createRequestClient,
    RestRequest,
} from '@togglecorp/react-rest-request';

import update from '#rsu/immutable-update';
import { sanitizeResponse } from '#utils/common';

import { wsEndpoint } from '#config/rest';
import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';
import { tokenSelector } from '#redux';
import notify from '#notify';

export function getVersionedUrl(endpoint, url) {
    const oldVersionString = '/v1';
    const versionString = '/v2';
    if (!url.startsWith(versionString)) {
        return `${endpoint}${url}`;
    }
    const startIndex = 0;
    const endIndex = endpoint.search(oldVersionString);
    const newEndpoint = endpoint.slice(startIndex, endIndex);
    return `${newEndpoint}${url}`;
}

const mapStateToProps = state => ({
    myToken: tokenSelector(state),
});

const CustomRequestCoordinator = createRequestCoordinator({
    transformParams: (params, props) => {
        // NOTE: This is a hack to bypass auth for S3 requests
        // Need to fix this through use of new react-rest-request@2
        const { body: bodyAsString } = params;

        const body = bodyAsString ? JSON.parse(bodyAsString) : undefined;
        if (body && body.$noAuth) {
            return {};
        }

        const {
            myToken: { access },
        } = props;
        if (!access) {
            return params;
        }

        const settings = {
            headers: { $auto: {
                Authorization: { $set: `Bearer ${access}` },
            } },
        };

        return update(params, settings);
    },

    transformProps: (props) => {
        const {
            myToken, // eslint-disable-line no-unused-vars
            ...otherProps
        } = props;
        return otherProps;
    },

    transformUrl: (url) => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        return getVersionedUrl(wsEndpoint, url);
    },

    transformResponse: (body, request) => {
        const {
            url,
            method,
            schemaName,
        } = request;

        if (schemaName === undefined) {
            // NOTE: usually there is no response body for DELETE
            if (method !== 'DELETE') {
                console.error(`Schema is not defined for ${url} ${method}`);
            }
        } else {
            try {
                schema.validate(body, schemaName);
            } catch (e) {
                console.error(url, method, body, e.message);
                throw (e);
            }
        }
        return sanitizeResponse(body);
    },

    /*
     * FIXME: Use this one
    transformErrors: ({ errors, ...otherProps }) => ({
        ...otherProps,
        body: alterResponseErrorToFaramError(errors),
    }),
    */

    transformErrors: (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        // FIXME: Use strings for this
        const messageForNotification = (
            faramErrors
            && faramErrors.$internal
            && faramErrors.$internal.join(' ')
        ) || 'There was some error while performing this action. Please try again.';

        return {
            response,
            faramErrors,
            messageForNotification,
        };
    },
});

export const RequestCoordinator = compose(
    connect(mapStateToProps),
    CustomRequestCoordinator,
);

export const RequestClient = createRequestClient();
RequestClient.propType = PropTypes.shape({
    do: PropTypes.func,
    pending: PropTypes.bool,
    response: PropTypes.object,
    error: PropTypes.object,
});

export const notifyOnFailure = title => ({
    error: {
        messageForNotification,
    } = {},
}) => {
    notify.send({
        title,
        type: notify.type.ERROR,
        message: messageForNotification,
        duration: notify.duration.MEDIUM,
    });
};

export const requestMethods = RestRequest.methods;
