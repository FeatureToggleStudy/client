// ERRORS
// import { RavlError } from '../vendor/ravl/error';
// import { isFalsy } from '../vendor/ravl//common';
import attachValidator from '../vendor/ravl/attachValidator';
import dict from '../vendor/ravl/schema';

// TODO: add errorResponse and successResponse in RestRequest

// ATTACHING BEHAVIORS
attachValidator(dict);

// ATTACHING USER DEFINED SCHEMAS


// Base schema

{
    const name = 'dbentity';
    const schema = {
        doc: {
            name: 'Database Entity',
            description: 'Defines all the attributes common to db entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            createdAt: { type: 'string', required: true }, // date
            modifiedAt: { type: 'string', required: true }, // date
            createdBy: { type: 'uint', required: true },
            modifiedBy: { type: 'uint', required: true },
            createdByName: { type: 'string' },
            modifiedByName: { type: 'string' },
        },
    };
    dict.put(name, schema);
}
{
    const name = 'project';
    const schema = {
        doc: {
            name: 'Project',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            analysisFramework: { type: 'object', required: false },
            data: { type: 'object' },
            members: { type: 'array.uint', required: true },
            memberships: { type: 'array.uint', required: true },
            regions: { type: 'array.uint', required: true },
            title: { type: 'string', required: true },
            userGroups: { type: 'array.uint', required: true },
        },
    };
    dict.put(name, schema);
}
{
    const name = 'lead';
    const schema = {
        doc: {
            name: 'Lead',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            assignee: { type: 'array.uint' },
            attachment: { type: 'string' }, // file url
            confidentiality: { type: 'string', required: true },
            noOfEntries: { type: 'int' },
            project: { type: 'uint' },
            publishedOn: { type: 'string' },
            source: { type: 'string' }, // url
            status: { type: 'string', required: true },
            text: { type: 'string' },
            title: { type: 'string', required: true },
            url: { type: 'string' },
            website: { type: 'string' },
        },
    };
    dict.put(name, schema);
}
{
    const name = 'user';
    const schema = {
        doc: {
            name: 'User',
            description: 'Data for user',
        },
        fields: {
            displayName: { type: 'string', required: true },
            displayPicture: { type: 'string' }, // url
            email: { type: 'email', required: true },
            firstName: { type: 'string', required: true },
            id: { type: 'uint', required: true },
            lastName: { type: 'string', required: true },
            organization: { type: 'string', required: true },
            username: { type: 'string', required: true },
        },
    };
    dict.put(name, schema);
}
{
    const name = 'accessToken';
    const schema = {
        doc: {
            name: 'Access Token',
            description: 'Data decoded from access token',
        },
        fields: {
            userId: { type: 'uint', required: 'true' },
            tokenType: { type: 'string', required: 'true' },
            username: { type: 'string', required: 'true' },
            displayName: { type: 'string', required: 'true' },
            exp: { type: 'uint', required: 'true' },
        },
    };
    dict.put(name, schema);
}


// User request related

{
    const name = 'userCreateResponse';
    const schema = {
        doc: {
            name: 'User Create Response',
            description: 'Response for POST /users/',
            note: 'This is the first schema',
        },
        extends: 'user',
        /*
        validator: (self, context) => {
            if (isFalsy(self.token)) {
                return;
            }
            if (self.token.length <= 5) {
                throw new RavlError('Length must be greater than 5', context);
            }
        },
        */
    };
    dict.put(name, schema);
}
{
    const name = 'userGetResponse';
    const schema = {
        doc: {
            name: 'User Get Response',
            description: 'Response for GET /user/:id/',
        },
        extends: 'user',
    };
    dict.put(name, schema);
}
{
    const name = 'userPatchResponse';
    const schema = {
        doc: {
            name: 'User Patch Response',
            description: 'Response for PATCH /user/:id/',
        },
        extends: 'user',
    };
    dict.put(name, schema);
}


// Project request related

{
    const name = 'projectsGetResponse';
    const schema = {
        doc: {
            name: 'Projects Get Response',
            description: 'Response for GET /projects/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.project', required: true },
        },
    };
    dict.put(name, schema);
}


// Lead request related

{
    const name = 'leadsGetResponse';
    const schema = {
        doc: {
            name: 'Lead Get Response',
            description: 'Response for GET /leads/?params',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.lead', required: true },
        },
    };
    dict.put(name, schema);
}


// Token related requests
{
    const name = 'tokenGetResponse';
    const schema = {
        doc: {
            name: 'Token Get Response',
            description: 'Response for POST /token/',
        },
        fields: {
            access: { type: 'string', required: 'true' },
            refresh: { type: 'string', required: 'true' },
        },
    };
    dict.put(name, schema);
}
{
    const name = 'tokenRefreshResponse';
    const schema = {
        doc: {
            name: 'Token Refresh Response',
            description: 'Response for POST /token/refresh/',
        },
        fields: {
            access: { type: 'string', required: 'true' },
        },
    };
    dict.put(name, schema);
}

export default dict;
export { RavlError } from '../vendor/ravl/error';
