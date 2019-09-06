import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reverseRoute, _cs } from '@togglecorp/fujs';

import DisplayPicture from '#components/viewer/DisplayPicture';
import { currentUserProjectsSelector } from '#redux';
import { pathNames } from '#constants';

import _ts from '#ts';

import Notification from '../Notification';
import styles from './styles.scss';

const LinkItem = ({ link, title }) => (
    <a
        className={styles.title}
        href={link}
    >
        {title}
    </a>
);

LinkItem.propTypes = {
    link: PropTypes.string,
    title: PropTypes.string,
};

LinkItem.defaultProps = {
    link: '',
    title: '',
};

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notification: PropTypes.object,
    notificationType: PropTypes.string.isRequired,
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    userProjects: PropTypes.array.isRequired,
};

const defaultProps = {
    notification: {},
    className: '',
};

const mapStateToProps = state => ({
    userProjects: currentUserProjectsSelector(state),
});

@connect(mapStateToProps)
export default class EntryCommentItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getNotificationText = (notificationType, notification, projects) => {
        let notificationText = notificationType;
        const {
            data: {
                createdByDetail: {
                    id,
                    name,
                } = {},
                entry,
                lead,
            } = {},
            project,
        } = notification;

        const projectDetails = projects.find(p => p.id === project);
        const projectTitle = projectDetails && projectDetails.title;

        const userLink = reverseRoute(
            pathNames.userProfile,
            { userId: id },
        );

        const entriesLink = reverseRoute(
            pathNames.editEntries,
            {
                projectId: project,
                leadId: lead,
            },
        );

        const projectLink = reverseRoute(
            pathNames.projects,
            {
                projectId: project,
            },
        );

        const stringParams = {
            userName: (
                <LinkItem
                    link={userLink}
                    title={name}
                />
            ),
            comment: (
                <LinkItem
                    link={`${entriesLink}?entry_id=${entry}`}
                    title="comment"
                />
            ),
            project: (
                <LinkItem
                    link={projectLink}
                    title={projectTitle}
                />
            ),
        };

        if (notificationType === 'entry_comment_add') {
            notificationText = _ts(
                'entryComments.notifications',
                'entryCommentAdd',
                stringParams,
            );
        } else if (notificationType === 'entry_comment_reply_add') {
            notificationText = _ts(
                'entryComments.notifications',
                'entryCommentReplyAdd',
                stringParams,
            );
        } else if (notificationType === 'entry_comment_resolved') {
            notificationText = _ts(
                'entryComments.notifications',
                'entryCommentResolved',
                stringParams,
            );
        } else if (notificationType === 'entry_comment_modify') {
            notificationText = _ts(
                'entryComments.notifications',
                'entryCommentModified',
                stringParams,
            );
        } else if (notificationType === 'entry_comment_reply_modify') {
            notificationText = _ts(
                'entryComments.notifications',
                'entryCommentReplyModified',
                stringParams,
            );
        }

        return (
            <div>
                {notificationText}
            </div>
        );
    }

    render() {
        const {
            notification,
            notificationType,
            userProjects,
            className,
        } = this.props;

        const notificationText = this.getNotificationText(
            notificationType,
            notification,
            userProjects,
        );

        const {
            data: {
                createdByDetail: {
                    displayPicture,
                } = {},
            } = {},
            timestamp,
        } = notification;

        return (
            <Notification
                className={_cs(className, styles.entryCommentItem)}
                icon={
                    <DisplayPicture
                        className={styles.displayPicture}
                        url={displayPicture}
                    />
                }
                message={notificationText}
                timestamp={timestamp}
            />
        );
    }
}
