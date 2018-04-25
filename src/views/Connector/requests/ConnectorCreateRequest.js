import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForConnectorCreate,
    alterResponseErrorToFaramError,
    urlForConnectors,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorCreateRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'connector');
            const connector = {
                id: response.id,
                versionId: response.versionId,
                faramValues: { ...response },
                faramErrors: {},
                prisitne: false,
            };

            this.props.addUserConnector({ connector });

            notify.send({
                title: this.props.notificationStrings('connectorCreateTitle'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('connectorCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.props.handleModalClose();
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setState({
            faramErrors,
            pending: false,
        });
    }

    fatal = () => {
        // FIXME: use strings
        this.props.setState({
            faramErrors: { $internal: ['Could not save connector.'] },
        });
    }

    create = (newConnector) => {
        const connectorsRequest = new FgRestBuilder()
            .url(urlForConnectors)
            .params(createParamsForConnectorCreate(newConnector))
            .preLoad(() => { this.props.setState({ dataLoading: true }); })
            .postLoad(() => { this.props.setState({ dataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return connectorsRequest;
    }
}
