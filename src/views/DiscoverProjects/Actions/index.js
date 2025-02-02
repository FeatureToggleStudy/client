import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import { pathNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // className: PropTypes.string,
    project: PropTypes.shape({
        id: PropTypes.number,
        memberStatus: PropTypes.string,
    }).isRequired,
    onProjectJoin: PropTypes.func.isRequired,
    onProjectJoinCancel: PropTypes.func.isRequired,
};

const defaultProps = {
    // className: '',
};

export default class Actions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderUserAccessButtons = () => {
        const { project } = this.props;

        switch (project.memberStatus) {
            case 'admin': {
                const link = reverseRoute(
                    pathNames.projects,
                    { projectId: project.id },
                );
                return (
                    <Link
                        className={`${styles.editLink} edit-link`}
                        tabIndex="-1"
                        title={_ts('discoverProjects.table', 'editProjectTooltip')}
                        to={link}
                    >
                        <Icon name="edit" />
                    </Link>
                );
            } case 'pending':
                return (
                    <DangerButton
                        iconName="close"
                        title={_ts('discoverProjects.table', 'cancelJoinRequest')}
                        transparent
                        onClick={() => this.props.onProjectJoinCancel(project)}
                    />
                );
            case 'rejected':
                return (
                    <span>Rejected</span>
                );
            case 'none':
                return (
                    <PrimaryButton
                        className="join-button"
                        title={_ts('discoverProjects.table', 'joinLabel')}
                        onClick={() => this.props.onProjectJoin(project)}
                    >
                        {_ts('discoverProjects.table', 'joinLabel')}
                    </PrimaryButton>
                );
            default:
                return null;
        }
    }

    renderContactLink = () => {
        const {
            project: {
                memberships,
                title: projectName,
            },
        } = this.props;

        const admins = memberships.filter(m => m.memberStatus === 'admin');
        const adminEmails = admins.map(a => a.memberEmail);

        if (adminEmails.length < 1) {
            return null;
        }

        const subject = _ts(
            'discoverProjects.table',
            'contactAdminsSubject',
            { projectName },
        );
        const contantLink = `mailto:${adminEmails.join(',')}?subject=${subject}`;
        return (
            <a
                className={`${styles.emailLink} email-link`}
                tabIndex="-1"
                title={_ts('discoverProjects.table', 'contactAdminsTitle')}
                href={contantLink}
            >
                <Icon name="email" />
            </a>
        );
    }

    render() {
        const UserAccessButtons = this.renderUserAccessButtons;
        const ContactLink = this.renderContactLink;

        return (
            <React.Fragment>
                <ContactLink />
                <UserAccessButtons />
            </React.Fragment>
        );
    }
}
