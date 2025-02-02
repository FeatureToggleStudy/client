import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    RequestClient,
    requestMethods,
} from '#request';

import {
    setNotificationAction,
} from '#redux';

import { reverseRoute, _cs } from '@togglecorp/fujs';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerButton from '#rsca/Button/DangerButton';

import DisplayPicture from '#components/viewer/DisplayPicture';
import { pathNames } from '#constants';
import _ts from '#ts';

import Notification from '../Notification';
import LinkItem from '../LinkItem';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    projectJoinApproveRequest: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    projectJoinRejectRequest: PropTypes.object,

    className: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    notification: {},
    className: '',
    projectJoinApproveRequest: {},
    projectJoinRejectRequest: {},
};

// TODO: show error message for request failure
const requests = {
    projectJoinApproveRequest: {
        url: ({
            params: {
                projectId,
                requestId,
            },
        }) => `/projects/${projectId}/requests/${requestId}/accept/`,
        method: requestMethods.POST,
        body: ({ params: { role } }) => ({ role }),
        onSuccess: ({
            response,
            props: {
                updateNotification,
                notification,
            },
        }) => {
            updateNotification({
                notification: {
                    ...notification,
                    data: response,
                },
            });
        },
    },
    projectJoinRejectRequest: {
        url: ({
            params: {
                projectId,
                requestId,
            },
        }) => `/projects/${projectId}/requests/${requestId}/reject/`,
        method: requestMethods.POST,
    },
};

const mapDispatchToProps = dispatch => ({
    updateNotification: params => dispatch(setNotificationAction(params)),
});

@connect(undefined, mapDispatchToProps)
@RequestClient(requests)
export default class ProjectJoinRequestItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleAddButtonClick = () => {
        const {
            notification: {
                data: {
                    id: requestId,
                    project: { id: projectId },
                },
            },
            projectJoinApproveRequest,
        } = this.props;

        projectJoinApproveRequest.do({
            requestId,
            projectId,
            role: 'normal',
        });
    }

    handleRejectButtonClick = () => {
        const {
            notification: {
                data: {
                    id: requestId,
                    project: { id: projectId },
                },
            },
            projectJoinRejectRequest,
        } = this.props;

        projectJoinRejectRequest.do({
            requestId,
            projectId,
        });
    }

    render() {
        const {
            className: classNameFromProps,
            notification: {
                data: {
                    status,
                    requestedBy: {
                        displayPicture: requestorDisplayPictureId,
                        displayName: requestorName,
                        id: requestorId,
                    } = {},
                    project: {
                        id: projectId,
                        title: projectTitle,
                    } = {},
                },
                timestamp,
            },
            projectJoinApproveRequest: {
                pending: pendingProjectJoinAcceptRequest,
            },
            projectJoinRejectRequest: {
                pending: pendingProjectJoinRejectRequest,
            },
            closeModal,
        } = this.props;

        if (!projectId) {
            return null;
        }

        const pending = pendingProjectJoinAcceptRequest || pendingProjectJoinRejectRequest;

        const requestorProfileLink = reverseRoute(
            pathNames.userProfile,
            { userId: requestorId },
        );

        const projectLink = reverseRoute(
            pathNames.projects,
            { projectId },
        );

        return (
            <Notification
                className={_cs(classNameFromProps, styles.projectJoinRequestNotification)}
                icon={
                    <DisplayPicture
                        className={styles.displayPicture}
                        galleryId={requestorDisplayPictureId}
                    />
                }
                message={
                    <div>
                        {_ts('notifications.projectJoinRequest', 'message', {
                            requestorName: (
                                <LinkItem
                                    link={requestorProfileLink}
                                    title={requestorName}
                                    closeModal={closeModal}
                                />
                            ),
                            projectTitle: (
                                <LinkItem
                                    link={projectLink}
                                    title={projectTitle}
                                    closeModal={closeModal}
                                />
                            ),
                        })}
                    </div>
                }
                timestamp={timestamp}
                actions={
                    status === 'pending' ? (
                        <React.Fragment>
                            <SuccessButton
                                disabled={pending}
                                className={styles.button}
                                iconName="check"
                                onClick={this.handleAddButtonClick}
                                transparent
                                pending={pendingProjectJoinAcceptRequest}
                            >
                                {_ts('notifications.projectJoinRequest', 'addButtonTitle')}
                            </SuccessButton>
                            <DangerButton
                                disabled={pending}
                                className={styles.button}
                                iconName="close"
                                onClick={this.handleRejectButtonClick}
                                transparent
                                pending={pendingProjectJoinRejectRequest}
                            >
                                {_ts('notifications.projectJoinRequest', 'rejectButtonTitle')}
                            </DangerButton>
                        </React.Fragment>
                    ) : null
                }
            />
        );
    }
}
