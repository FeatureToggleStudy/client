import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import Faram, { FaramGroup, requiredCondition, urlCondition } from '@togglecorp/faram';
import {
    _cs,
    compareString,
    compareDate,
    isFalsy,
    isValidUrl,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TabularSelectInput from '#rsci/TabularSelectInput';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import DateInput from '#rsci/DateInput';
import NumberInput from '#rsci/NumberInput';
import FormattedDate from '#rscv/FormattedDate';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import update from '#rsu/immutable-update';

import Badge from '#components/viewer/Badge';

import {
    connectorDetailsSelector,
    connectorSourceSelector,
    usersInformationListSelector,
    currentUserProjectsSelector,
    setUsersInformationAction,
    changeUserConnectorDetailsAction,
    deleteConnectorAction,
    setErrorUserConnectorDetailsAction,
    setUserConnectorDetailsAction,
} from '#redux';
import _ts from '#ts';

import ConnectorDetailsGetRequest from '../../requests/ConnectorDetailsGetRequest';
import ConnectorPatchRequest from '../../requests/ConnectorPatchRequest';
import RssFieldsGet from '../../requests/RssFieldsGet';
import ConnectorDeleteRequest from '../../requests/ConnectorDeleteRequest';
import UserListGetRequest from '../../requests/UserListGetRequest';
import TestResults from '../TestResults';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    connectorId: PropTypes.number,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    changeUserConnectorDetails: PropTypes.func.isRequired,
    setErrorUserConnectorDetails: PropTypes.func.isRequired,
    setUserConnectorDetails: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
    deleteConnector: PropTypes.func.isRequired,
    onConnectorDelete: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    connectorDetails: {},
    connectorSource: {},
    userProjects: [],
    className: '',
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorDetails: connectorDetailsSelector(state),
    users: usersInformationListSelector(state),
    userProjects: currentUserProjectsSelector(state),
    connectorSource: connectorSourceSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    changeUserConnectorDetails: params => dispatch(changeUserConnectorDetailsAction(params)),
    setErrorUserConnectorDetails: params => dispatch(setErrorUserConnectorDetailsAction(params)),
    setUserConnectorDetails: params => dispatch(setUserConnectorDetailsAction(params)),
    deleteConnector: params => dispatch(deleteConnectorAction(params)),
});

const emptyList = [];

const xmlConnectorTypes = [
    'rss-feed',
    'atom-feed',
    'emm',
];

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorDetailsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = s => s.key;
    static labelSelector = s => s.title;
    static userLabelSelector = (d = {}) => d.displayName;
    static userKeySelector = (d = {}) => d.user;
    static projectLabelSelector = (d = {}) => d.title;
    static projectKeySelector = (d = {}) => d.project;

    static getFeedUrl = (faramValues = {}) => {
        const { params: { 'feed-url': feedUrl } = {} } = faramValues;
        return feedUrl;
    }

    constructor(props) {
        super(props);

        const {
            connectorId,
            setErrorUserConnectorDetails,
        } = this.props;

        this.state = {
            userDataLoading: true,
            connectorDataLoading: false,
            pending: false,
            rssOptions: undefined,
            schema: this.createSchema(props),
        };

        this.rssFieldGetRequest = new RssFieldsGet({
            setState: params => this.setState(params),
            connectorId,
            setConnectorError: setErrorUserConnectorDetails,
        });

        this.connectorDeleteRequest = new ConnectorDeleteRequest({
            setState: params => this.setState(params),
            deleteConnector: this.props.deleteConnector,
            onConnectorDelete: this.props.onConnectorDelete,
        });

        this.usersHeader = [
            {
                key: 'displayName',
                label: _ts('connector', 'tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.displayName, b.displayName),
            },
            {
                key: 'email',
                label: _ts('connector', 'tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.email, b.email),
            },
            {
                key: 'role',
                label: _ts('connector', 'tableHeaderRights'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'addedAt',
                label: _ts('connector', 'tableHeaderJoinedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.addedAt, b.addedAt),
                modifier: row => (
                    <FormattedDate date={row.addedAt} mode="dd-MM-yyyy hh:mm" />
                ),
            },
            {
                key: 'actions',
                label: _ts('connector', 'tableHeaderActions'),
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <Fragment>
                            <PrimaryButton
                                smallVerticalPadding
                                key="role-change"
                                title={
                                    isAdmin
                                        ? _ts('connector', 'revokeAdminRightsTitle')
                                        : _ts('connector', 'grantAdminRightsTitle')
                                }
                                onClick={() => this.handleToggleUserRoleClick(row)}
                                iconName={isAdmin ? 'locked' : 'person'}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={_ts('connector', 'deleteMemberLinkTitle')}
                                onClick={() => this.handleDeleteUserClick(row)}
                                iconName="delete"
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];
        this.projectsHeader = [
            {
                key: 'title',
                label: _ts('connector', 'tableHeaderTitle'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'role',
                label: _ts('connector', 'tableHeaderVisibility'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
                modifier: (row) => {
                    const isGlobal = row.role === 'global';
                    if (isGlobal) {
                        return _ts('connector', 'globalVisibilityLabel');
                    }
                    return _ts('connector', 'selfVisibilityLabel');
                },
            },
            {
                key: 'actions',
                label: _ts('connector', 'tableHeaderActions'),
                order: 3,
                modifier: (row) => {
                    const isGlobal = row.role === 'global';
                    const isProjectAdmin = row.admin === 'admin';
                    let toggleTitle = '';
                    let deleteTitle = _ts('connector', 'removeProjectTitle');
                    if (isGlobal) {
                        toggleTitle = _ts('connector', 'setLocalVisibilityTitle');
                    } else {
                        toggleTitle = _ts('connector', 'setGlobalVisibilityTitle');
                    }
                    if (!isProjectAdmin) {
                        toggleTitle = _ts('connector', 'needAdminRightsTitle');
                        deleteTitle = _ts('connector', 'needAdminRightsTitle');
                    }

                    return (
                        <Fragment>
                            <PrimaryButton
                                smallVerticalPadding
                                key="role-change"
                                title={toggleTitle}
                                onClick={() => this.handleToggleProjectRoleClick(row)}
                                iconName={isGlobal ? 'globe' : 'locked'}
                                disabled={!isProjectAdmin}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={deleteTitle}
                                onClick={() => this.handleDeleteProjectClick(row)}
                                iconName="delete"
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];
    }

    componentDidMount() {
        const {
            connectorSource: { key },
            connectorDetails: { faramValues = {} },
        } = this.props;

        this.startUsersListGetRequest();

        if (xmlConnectorTypes.includes(key)) {
            const urlFeed = ConnectorDetailsForm.getFeedUrl(faramValues);
            if (urlFeed && isValidUrl(urlFeed)) {
                this.rssFieldGetRequest.init(urlFeed, key);
                this.rssFieldGetRequest.start();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            connectorSource: newConnectorSource,
            connectorDetails: {
                faramValues: newFaramValues = {},
            },
        } = nextProps;

        const {
            connectorSource: oldConnectorSource,
            connectorDetails: {
                faramValues: oldFaramValues = {},
            },
        } = this.props;

        if (oldConnectorSource !== newConnectorSource) {
            this.setState({
                schema: this.createSchema(newConnectorSource),
            });
        }

        if (xmlConnectorTypes.includes(newConnectorSource.key)) {
            const newFeedUrl = ConnectorDetailsForm.getFeedUrl(newFaramValues);
            const oldFeedUrl = ConnectorDetailsForm.getFeedUrl(oldFaramValues);
            if (newFeedUrl !== oldFeedUrl && newFeedUrl && isValidUrl(newFeedUrl)) {
                this.rssFieldGetRequest.init(newFeedUrl, newConnectorSource.key);
                this.rssFieldGetRequest.start();
            }
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        if (this.requestForUserList) {
            this.requestForUserList.stop();
        }
        if (this.connectorDeleteRequest) {
            this.connectorDeleteRequest.stop();
        }
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
    }

    getOptionsForUser = memoize((users, members) => {
        if (!members) {
            return emptyList;
        }

        if (!users) {
            return members;
        }

        const finalOptions = members.map(m => ({
            ...m,
            sortKey: `${m.displayName}-${m.user}`,
        }));

        users.forEach((u) => {
            const memberIndex = members.findIndex(m => m.user === u.id);
            if (memberIndex === -1) {
                finalOptions.push({
                    displayName: u.displayName,
                    email: u.email,
                    role: 'normal',
                    user: u.id,
                    sortKey: `${u.displayName}-${u.id}`,
                });
            }
        });

        return finalOptions.sort((a, b) => compareString(a.sortKey, b.sortKey));
    })

    getOptionsForProjects = memoize((allProjects, connectorProjects) => {
        if (!connectorProjects) {
            return emptyList;
        }

        if (!allProjects) {
            return connectorProjects;
        }

        const finalOptions = connectorProjects.map(m => ({
            ...m,
            sortKey: `${m.title}-${m.project}`,
        }));

        allProjects.forEach((a) => {
            const memberIndex = connectorProjects.findIndex(m => m.project === a.id);
            if (memberIndex === -1) {
                finalOptions.push({
                    title: a.title,
                    role: 'self',
                    project: a.id,
                    admin: a.memberStatus,
                    sortKey: `${a.title}-${a.id}`,
                });
            } else {
                finalOptions[memberIndex].admin = a.memberStatus;
            }
        });

        return finalOptions.sort((a, b) => compareString(a.sortKey, b.sortKey));
    })

    createSchema = memoize((props) => {
        // FIXME: potential problem here with params,
        // it should be empty array not empty object
        const { connectorSource = {} } = props;
        const schema = {
            fields: {
                title: [requiredCondition],
                params: {},
                users: [],
                projects: [],
            },
        };
        if ((connectorSource.options || emptyList).length === 0) {
            return schema;
        }
        const paramFields = {};
        connectorSource.options.forEach((o) => {
            const validation = [];
            if (o.fieldType === 'url') {
                validation.push(urlCondition);
            }
            paramFields[o.key] = validation;
        });
        schema.fields.params.fields = paramFields;
        return schema;
    })

    startConnectorPatchRequest = (connectorId, connectorDetails) => {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        const requestForConnectorPatch = new ConnectorPatchRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
            connectorId: this.props.connectorId,
            setConnectorError: this.props.setErrorUserConnectorDetails,
        });

        this.requestForConnectorPatch = requestForConnectorPatch.create(
            connectorId,
            connectorDetails,
        );

        this.requestForConnectorPatch.start();
    }

    startUsersListGetRequest = () => {
        if (this.requestForUserList) {
            this.requestForUserList.stop();
        }
        const requestForUserList = new UserListGetRequest({
            setState: v => this.setState(v),
            setUsers: this.props.setUsers,
        });

        this.requestForUserList = requestForUserList.create();
        this.requestForUserList.start();
    }

    startConnectorDetailsRequest = (connectorId) => {
        const {
            setUserConnectorDetails,
            connectorDetails,
        } = this.props;

        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }

        const requestForConnectorDetails = new ConnectorDetailsGetRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails,
            connectorDetails,
            isBeingCancelled: true,
        });

        this.requestForConnectorDetails = requestForConnectorDetails.create(connectorId);
        this.requestForConnectorDetails.start();
    }

    handleToggleUserRoleClick = (selectedUser) => {
        const {
            connectorId,
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
        } = this.props;

        const index = (faramValues.users || emptyList).findIndex(u => u.user === selectedUser.user);

        if (index !== -1) {
            const settings = {
                users: {
                    [index]: {
                        role: {
                            $set: selectedUser.role === 'admin' ? 'normal' : 'admin',
                        },
                    },
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleToggleProjectRoleClick = (selectedProject) => {
        const {
            connectorId,
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
        } = this.props;

        const index = (faramValues.projects || []).findIndex(p =>
            p.project === selectedProject.project);

        if (index !== -1) {
            const settings = {
                projects: {
                    [index]: {
                        role: {
                            $set: selectedProject.role === 'global' ? 'self' : 'global',
                        },
                    },
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleDeleteUserClick = (selectedUser) => {
        const {
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
            connectorId,
        } = this.props;

        const index = (faramValues.users || emptyList).findIndex(u => u.user === selectedUser.user);

        if (index !== -1) {
            const settings = {
                users: {
                    $splice: [[index, 1]],
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleDeleteProjectClick = (selectedProject) => {
        const {
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
            connectorId,
        } = this.props;

        const index = (faramValues.projects || []).findIndex(p =>
            p.project === selectedProject.project);

        if (index !== -1) {
            const settings = {
                projects: {
                    $splice: [[index, 1]],
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleFaramChange = (faramValues, faramErrors) => {
        const {
            changeUserConnectorDetails,
            connectorId,
        } = this.props;

        changeUserConnectorDetails({
            faramValues,
            faramErrors,
            connectorId,
        });
    };

    handleValidationFailure = (faramErrors) => {
        const {
            setErrorUserConnectorDetails,
            connectorId,
        } = this.props;

        setErrorUserConnectorDetails({
            faramErrors,
            connectorId,
        });
    };

    handleValidationSuccess = (connectorDetails) => {
        this.startConnectorPatchRequest(this.props.connectorId, connectorDetails);
    };

    handleFormCancel = () => {
        this.startConnectorDetailsRequest(this.props.connectorId);
    };

    handleConnectorDelete = () => {
        const { connectorId } = this.props;
        this.connectorDeleteRequest.init(connectorId);
        this.connectorDeleteRequest.start();
    };

    renderParamInput = (key, data) => {
        const { connectorSource: { key: connectorKey } } = this.props;
        const {
            rssOptions,
            pendingRssFields,
        } = this.state;

        if (data.fieldType === 'string' || data.fieldType === 'url') {
            if (data.key === 'feed-url') {
                return (
                    <div className={styles.feedUrlContainer}>
                        <TextInput
                            key={data.key}
                            className={styles.feedUrl}
                            faramElementName={data.key}
                            label={data.title}
                        />
                        { pendingRssFields &&
                            <div className={styles.loadingAnimationContainer} >
                                <LoadingAnimation className={styles.loadingAnimation} />
                            </div>
                        }
                    </div>
                );
            }
            return (
                <TextInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        } else if (data.fieldType === 'select') {
            if (xmlConnectorTypes.includes(connectorKey)) {
                if (isFalsy(rssOptions)) {
                    return null;
                }
                return (
                    <SelectInput
                        key={data.key}
                        faramElementName={data.key}
                        label={data.title}
                        options={rssOptions}
                        disabled={pendingRssFields}
                    />
                );
            }
            return (
                <SelectInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                    options={data.options}
                />
            );
        } else if (data.fieldType === 'date') {
            return (
                <DateInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        } else if (data.fieldType === 'number') {
            return (
                <NumberInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        }
        return null;
    }

    render() {
        const {
            users,
            userProjects,
            className,
            connectorSource,
            connectorDetails,
            connectorId,
        } = this.props;

        const {
            schema,
            pending,
            connectorDataLoading,
            userDataLoading,
        } = this.state;

        const {
            faramValues = {},
            faramErrors,
            pristine,
        } = connectorDetails;

        const {
            users: faramValuesUsers,
            projects: faramValuesProjects,
            params,
        } = faramValues;

        const usersOptions = this.getOptionsForUser(users, faramValuesUsers);
        const projectsOptions = this.getOptionsForProjects(userProjects, faramValuesProjects);

        const {
            usersHeader,
            projectsHeader,
        } = this;

        const loading =
            userDataLoading ||
            connectorDataLoading ||
            pending;

        return (
            <Faram
                className={_cs(styles.connectorDetailsForm, className)}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading}
            >
                { loading && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {faramValues.title}
                        <Badge
                            className={styles.badge}
                            title={connectorSource.title}
                        />
                    </h3>
                    <div className={styles.actionButtons}>
                        <AccentModalButton
                            modal={
                                <TestResults
                                    connectorId={connectorId}
                                    paramsForTest={params}
                                    onConnectorTestLoading={this.handleConnectorTestLoading}
                                />
                            }
                        >
                            {_ts('connector', 'connectorDetailTestLabel')}
                        </AccentModalButton>
                        <DangerConfirmButton
                            confirmationMessage={_ts(
                                'connector',
                                'deleteConnectorConfirmText',
                                { connector: faramValues.title },
                            )}
                            onClick={this.handleConnectorDelete}
                            disabled={loading}
                        >
                            {_ts('connector', 'connectorDetailDeleteLabel')}
                        </DangerConfirmButton>
                        <WarningButton
                            onClick={this.handleFormCancel}
                            disabled={loading || !pristine}
                        >
                            {_ts('connector', 'connectorDetailCancelLabel')}
                        </WarningButton>
                        <SuccessButton
                            type="submit"
                            disabled={loading || !pristine}
                        >
                            {_ts('connector', 'connectorDetailSaveLabel')}
                        </SuccessButton>
                    </div>
                </header>
                <div className={styles.content} >
                    <NonFieldErrors
                        faramElement
                        className={styles.errors}
                    />
                    <div className={styles.normalInputs} >
                        <TextInput
                            faramElementName="title"
                            label={_ts('connector', 'connectorTitleLabel')}
                            placeholder="Relief Web"
                            autoFocus
                        />
                        <FaramGroup faramElementName="params">
                            <List
                                data={connectorSource.options}
                                modifier={this.renderParamInput}
                            />
                        </FaramGroup>
                    </div>
                    {!(userDataLoading || connectorDataLoading) &&
                        <div className={styles.tabularSelectInputs} >
                            <TabularSelectInput
                                className={styles.users}
                                faramElementName="users"
                                options={usersOptions}
                                label={_ts('connector', 'connectorUsersLabel')}
                                labelSelector={ConnectorDetailsForm.userLabelSelector}
                                keySelector={ConnectorDetailsForm.userKeySelector}
                                tableHeaders={usersHeader}
                                hideRemoveFromListButton
                                hideSelectAllButton
                            />
                            <TabularSelectInput
                                faramElementName="projects"
                                options={projectsOptions}
                                label={_ts('connector', 'connectorProjectsLabel')}
                                labelSelector={ConnectorDetailsForm.projectLabelSelector}
                                keySelector={ConnectorDetailsForm.projectKeySelector}
                                tableHeaders={projectsHeader}
                                hideRemoveFromListButton
                            />
                        </div>
                    }
                </div>
            </Faram>
        );
    }
}
