import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { detachedFaram } from '@togglecorp/faram';

import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ResizableH from '#rscv/Resizable/ResizableH';
import { reverseRoute, checkVersion } from '@togglecorp/fujs';
import Message from '#rscv/Message';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';

import Cloak from '#components/general/Cloak';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';
import {
    routeUrlSelector,
    setAryTemplateAction,
    setAryForEditAryAction,
    setGeoOptionsAction,
    setErrorAryForEditAryAction,
    editAryHasErrorsSelector,
    editAryIsPristineSelector,
    assessmentSchemaSelector,

    editAryFaramValuesSelector,
    projectIdFromRoute,
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,
    editAryVersionIdSelector,
    editAryServerIdSelector,
} from '#redux';
import { pathNames } from '#constants';
import notify from '#notify';
import _ts from '#ts';
import _cs from '#cs';
import BackLink from '#components/general/BackLink';

import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import styles from './styles.scss';

const propTypes = {
    routeUrl: PropTypes.string.isRequired,
    projectId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types

    editAryFaramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    editAryHasErrors: PropTypes.bool.isRequired,
    editAryIsPristine: PropTypes.bool.isRequired,
    setErrorAry: PropTypes.func.isRequired,

    activeLeadId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    activeLeadGroupId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    editAryVersionId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    editAryServerId: PropTypes.number,
    setAry: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setAryTemplate: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    // FIXME: use RequestClient.propType.isRequired
    assessmentRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadGroupRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptionsRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    arySaveRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    assessmentTemplateRequest: PropTypes.object.isRequired,
    // FIXME: inject for individual request
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    schema: {},
    editAryVersionId: undefined,
    editAryServerId: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
    editAryFaramValues: {},
};

const mapStateToProps = state => ({
    projectId: projectIdFromRoute(state),
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),
    editAryVersionId: editAryVersionIdSelector(state),
    editAryServerId: editAryServerIdSelector(state),
    editAryHasErrors: editAryHasErrorsSelector(state),
    editAryIsPristine: editAryIsPristineSelector(state),
    editAryFaramValues: editAryFaramValuesSelector(state),
    schema: assessmentSchemaSelector(state),
    routeUrl: routeUrlSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setErrorAry: params => dispatch(setErrorAryForEditAryAction(params)),
    setAryTemplate: params => dispatch(setAryTemplateAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const requests = {
    assessmentRequest: {
        schema: 'aryGetResponse',
        url: ({ props: { activeLeadId, activeLeadGroupId } }) => (
            activeLeadId === undefined
                ? `/lead-group-assessments/${activeLeadGroupId}/`
                : `/lead-assessments/${activeLeadId}/`
        ),
        onMount: ({ props }) => !!props.activeLeadId || !!props.activeLeadGroupId,
        onPropsChanged: ['activeLeadId', 'activeLeadGroupId'],
        onSuccess: ({ props, response, params }) => {
            const oldVersionId = props.editAryVersionId;

            let shouldSetValue = true;
            let isValueOverriden = false;

            if (!params.override) {
                ({
                    shouldSetValue,
                    isValueOverriden,
                } = checkVersion(oldVersionId, response.versionId));
            }

            if (shouldSetValue) {
                props.setAry({
                    serverId: response.id,
                    leadId: response.lead,
                    leadGroupId: response.leadGroup,
                    versionId: response.versionId,
                    metadata: response.metadata,
                    methodology: response.methodology,
                    summary: response.summary,
                    questionnaire: response.questionnaire,
                    score: response.score,
                });
            }
            if (isValueOverriden) {
                // FIXME: use strings
                notify.send({
                    type: notify.type.WARNING,
                    title: 'Assessment',
                    message: 'Your copy was overridden by server\'s copy.',
                    duration: notify.duration.SLOW,
                });
            }
        },
    },
    leadRequest: {
        schema: 'lead',
        url: ({ props: { activeLeadId } }) => `/leads/${activeLeadId}/`,
        onMount: ({ props: { activeLeadId } }) => !!activeLeadId,
        onPropsChanged: ['activeLeadId'],
        // TODO: check mismatch between project and lead
    },
    leadGroupRequest: {
        schema: 'leadGroup',
        url: ({ props: { activeLeadGroupId } }) => `/lead-groups/${activeLeadGroupId}/`,
        onMount: ({ props: { activeLeadGroupId } }) => !!activeLeadGroupId,
        onPropsChanged: ['activeLeadGroupId'],
        // TODO: check mismatch between project and leadGroup
    },
    assessmentTemplateRequest: {
        schema: 'aryTemplateGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/assessment-template/`,
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
        onPreLoad: ({ params }) => {
            params.setState({ noTemplate: false });
        },
        onSuccess: ({ props, response }) => {
            props.setAryTemplate({
                template: response,
                projectId: props.projectId,
            });
        },
        onFailure: ({ params }) => {
            params.setState({ noTemplate: true });
        },
    },
    geoOptionsRequest: {
        schema: 'geoOptions',
        url: '/geo-options/',
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onMount: ({ props: { projectId } }) => !!projectId,
        onPropsChanged: ['projectId'],
        onSuccess: ({ props, response }) => {
            props.setGeoOptions({
                projectId: props.projectId,
                locations: response,
            });
        },
    },
    arySaveRequest: {
        schema: 'aryPutResponse',
        url: ({ params: { value } }) => (value.id ? `/assessments/${value.id}/` : '/assessments/'),
        method: ({ params: { value } }) => (value.id ? requestMethods.PUT : requestMethods.POST),
        body: ({ params }) => params.value,
        onSuccess: ({ props, response }) => {
            props.setAry({
                leadId: response.lead,
                leadGroupId: response.leadGroup,
                serverId: response.id,
                versionId: response.versionId,
                metadata: response.metadata,
                methodology: response.methodology,
                summary: response.summary,
                score: response.score,
                questionnaire: response.questionnaire,
            });

            // FIXME: use strings
            notify.send({
                type: notify.type.SUCCESS,
                title: 'Assessment',
                message: 'Assessment save successful.',
                duration: notify.duration.MEDIUM,
            });
        },
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class EditAry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            noTemplate: false,
            activeSector: undefined,
            pendingUploads: {},
        };

        this.props.setDefaultRequestParams({
            setState: params => this.setState(params),
        });
    }

    shouldHideSaveButton = ({ assessmentPermissions }) => (
        this.props.editAryServerId
            ? !assessmentPermissions.modify
            : !assessmentPermissions.create
    )

    handleUploadPending = (key, value) => {
        this.setState(state => ({
            ...state,
            pendingUploads: {
                ...state.pendingUploads,
                [key]: value,
            },
        }));
    }

    handleActiveSectorChange = (activeSector) => {
        this.setState({ activeSector });
    }

    handleCancelButtonClick = () => {
        const {
            setAry,
            editAryServerId,
            activeLeadId,
            activeLeadGroupId,
        } = this.props;

        if (editAryServerId) {
            this.props.assessmentRequest.do({
                override: true,
            });
        } else {
            setAry({
                leadId: activeLeadId,
                leadGroupId: activeLeadGroupId,
            });
        }
    }

    handleFaramValidationSuccess = (value) => {
        this.props.arySaveRequest.do({
            value: {
                ...value,
                id: this.props.editAryServerId,
                lead: this.props.activeLeadId,
                leadGroup: this.props.activeLeadGroupId,
            },
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        if (this.props.activeLeadId) {
            this.props.setErrorAry({
                leadId: this.props.activeLeadId,
                faramErrors,
            });
        } else {
            this.props.setErrorAry({
                leadGroupId: this.props.activeLeadGroupId,
                faramErrors,
            });
        }
    };

    handleSaveButtonClick = () => {
        detachedFaram({
            value: this.props.editAryFaramValues,
            schema: this.props.schema,
            onValidationFailure: this.handleFaramValidationFailure,
            onValidationSuccess: this.handleFaramValidationSuccess,
        });
    }

    render() {
        const {
            assessmentRequest,
            leadRequest,
            leadGroupRequest,
            assessmentTemplateRequest,
            geoOptionsRequest,
            arySaveRequest,

            projectId,
            activeLeadId,
            editAryIsPristine,
            editAryHasErrors,
            className: classNameFromProps,
        } = this.props;

        const {
            noTemplate,
            activeSector,
            pendingUploads,
        } = this.state;

        const className = _cs(
            classNameFromProps,
            styles.editAssessment,
        );

        if (noTemplate) {
            return (
                <Page
                    className={className}
                    mainContent={
                        <Message>
                            {_ts('editAssessment', 'noAryTemplateForProject')}
                        </Message>
                    }
                />
            );
        } else if (
            leadRequest.pending
                || leadGroupRequest.pending
                || assessmentTemplateRequest.pending
                || geoOptionsRequest.pending
        ) {
            return (
                <Page
                    className={className}
                    mainContent={<LoadingAnimation />}
                />
            );
        }

        const exitPath = reverseRoute(pathNames.leads, {
            projectId,
        });

        const title = activeLeadId
            ? leadRequest.response.title
            : (leadGroupRequest.response.leads || []).map(lead => lead.title).join(',');

        const shouldHidePrompt = editAryIsPristine;
        const uploadPending = Object.keys(pendingUploads).some(key => pendingUploads[key]);

        return (
            <React.Fragment>
                <Page
                    className={className}
                    headerClassName={styles.header}
                    header={
                        <React.Fragment>
                            <BackLink defaultLink={exitPath} />
                            <h4 className={styles.heading}>
                                {title}
                            </h4>
                            <Cloak
                                hide={this.shouldHideSaveButton}
                                render={
                                    <div className={styles.actionButtons}>
                                        <DangerButton
                                            disabled={
                                                editAryIsPristine
                                                    || assessmentRequest.pending
                                                    || uploadPending
                                            }
                                            onClick={this.handleCancelButtonClick}
                                        >
                                            { _ts('editAssessment', 'cancelButtonTitle') }
                                        </DangerButton>
                                        <SuccessButton
                                            pending={arySaveRequest.pending}
                                            onClick={this.handleSaveButtonClick}
                                            disabled={
                                                editAryIsPristine
                                                    || editAryHasErrors
                                                    || assessmentRequest.pending
                                                    || uploadPending
                                            }
                                        >
                                            { _ts('editAssessment', 'saveButtonTitle') }
                                        </SuccessButton>
                                    </div>
                                }
                            />
                        </React.Fragment>
                    }
                    mainContentClassName={styles.main}
                    mainContent={
                        <ResizableH
                            className={styles.assessments}
                            leftContainerClassName={styles.left}
                            rightContainerClassName={styles.right}
                            leftChild={
                                <LeftPanel
                                    className={styles.leftPanel}
                                    lead={leadRequest.response}
                                    leadGroup={leadGroupRequest.response}
                                    activeSector={activeSector}
                                />
                            }
                            rightChild={
                                <Cloak
                                    makeReadOnly={this.shouldHideSaveButton}
                                    render={
                                        <RightPanel
                                            onActiveSectorChange={this.handleActiveSectorChange}
                                            onUploadPending={this.handleUploadPending}
                                            pending={
                                                arySaveRequest.pending || assessmentRequest.pending
                                            }
                                        />
                                    }
                                />
                            }
                        />
                    }
                />
                <Prompt
                    message={
                        (location) => {
                            const { routeUrl } = this.props;
                            if (location.pathname === routeUrl) {
                                return true;
                            } else if (shouldHidePrompt) {
                                return true;
                            }
                            return _ts('common', 'youHaveUnsavedChanges');
                        }
                    }
                />
            </React.Fragment>
        );
    }
}
