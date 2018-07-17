import {
    wsEndpoint,
    POST,
    PATCH,
    p,
    commonHeaderForPost,
} from '#config/rest';

const connectorsMiniFields = ['id', 'title', 'version_id', 'source', 'role'];
export const urlForConnectors = `${wsEndpoint}/connectors/?${p({ fields: connectorsMiniFields })}`;
export const urlForConnectorsForAdmin = `${wsEndpoint}/connectors/?${p({
    fields: connectorsMiniFields,
    role: ['admin'],
})}`;
export const urlForConnectorsFull = `${wsEndpoint}/connectors/`;
export const createUrlForConnector = connectorId => `${wsEndpoint}/connectors/${connectorId}/`;
export const createUrlForConnectorleads = connectorId =>
    `${wsEndpoint}/connectors/${connectorId}/leads/`;
export const urlForConnectorSources = `${wsEndpoint}/connector-sources/`;

export const createUrlForRssField = url => `${wsEndpoint}/connector-sources/rss-feed/fields/?feed-url=${url}`;
export const createUrlForConnectorTest = source => `${urlForConnectorSources}${source}/leads/`;

export const createUrlForConnectorsOfProject = projectId => `${urlForConnectors}&projects=${projectId}`;

export const createParamsForConnectorCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForConnectorLeads = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForConnectorTest = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForConnectorPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
