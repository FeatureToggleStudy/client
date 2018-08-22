import {
    createUrlForUserGroupProjects,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';

/*
 * parent: setUserGroupProject
*/
export default class UserGroupProjectsRequest extends Request {
    schemaName = 'projectsGetResponse'

    handleSuccess = (response) => {
        const { usergroupId } = this.extraParent;
        this.parent.setUsergroupView({
            usergroupId,
            projects: response.results,
        });
    }

    handleFailure = () => {
        // TODO: Notify
    }

    handleFatal = () => {
        // TODO: Notify
    }

    init = (usergroupId) => {
        this.extraParent = { usergroupId };
        this.createDefault({
            url: createUrlForUserGroupProjects(usergroupId),
            params: createParamsForGet,
        });
        return this;
    }
}
