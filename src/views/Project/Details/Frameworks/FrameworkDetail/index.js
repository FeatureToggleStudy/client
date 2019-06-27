import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
} from '@togglecorp/fujs';

import Message from '#rscv/Message';
import ScrollTabs from '#rscv/ScrollTabs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import AccentButton from '#rsca/Button/AccentButton';
import modalize from '#rscg/Modalize';

import {
    RequestClient,
    requestMethods,
} from '#request';
import {
    projectDetailsSelector,
    setProjectAfAction,
    addNewAfAction,
} from '#redux';

import { pathNames } from '#constants';
import _ts from '#ts';

import Preview from './Preview';

import UseFrameworkButton from './UseFrameworkButton';
import CloneFrameworkModal from './CloneFrameworkModal';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    className: PropTypes.string,
    frameworkId: PropTypes.number,
    addNewFramework: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjectFramework: PropTypes.func.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    frameworkGetRequest: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    readOnly: false,
    frameworkId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewFramework: params => dispatch(addNewAfAction(params)),
    setProjectFramework: params => dispatch(setProjectAfAction(params)),
});

const emptyObject = {};

const requests = {
    frameworkGetRequest: {
        url: ({ props }) => `/analysis-frameworks/${props.frameworkId}`,
        method: requestMethods.GET,
        onPropsChanged: ['frameworkId'],
        onMount: ({ props }) => !!props.frameworkId,
        schemaName: 'analysisFramework',
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class FrameworkDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            activeView: 'overview',
        };

        this.tabs = {
            overview: _ts('project.framework', 'entryOverviewTitle'),
            list: _ts('project.framework', 'entryListTitle'),
        };
    }

    handleTabClick = (tabId) => {
        this.setState({ activeView: tabId });
    }

    renderHeader = ({ framework }) => {
        if (!framework) {
            return null;
        }

        const {
            id: analysisFrameworkId,
            title: frameworkTitle,
            description: frameworkDescription,
            isAdmin: isFrameworkAdmin,
        } = framework;

        const {
            projectDetails: {
                analysisFramework: currentFrameworkId,
                id: projectId,
            } = emptyObject,
            setProjectFramework,
            addNewFramework,
            setActiveFramework,
            readOnly,
        } = this.props;

        const {
            pending,
            activeView,
        } = this.state;

        return (
            <header className={styles.header}>
                <div className={styles.top}>
                    <h2
                        title={frameworkTitle}
                        className={styles.heading}
                    >
                        {frameworkTitle}
                    </h2>
                    <ScrollTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        onClick={this.handleTabClick}
                        active={activeView}
                    />
                    <div className={styles.actionButtons}>
                        <UseFrameworkButton
                            currentFrameworkId={currentFrameworkId}
                            disabled={pending || readOnly}
                            frameworkId={analysisFrameworkId}
                            frameworkTitle={frameworkTitle}
                            projectId={projectId}
                            setProjectFramework={setProjectFramework}
                        />

                        { isFrameworkAdmin &&
                            <Link
                                className={styles.editFrameworkLink}
                                to={reverseRoute(
                                    pathNames.analysisFramework,
                                    { analysisFrameworkId },
                                )}
                            >
                                { _ts('project.framework', 'editFrameworkButtonTitle') }
                            </Link>
                        }

                        <AccentModalButton
                            disabled={pending || readOnly}
                            modal={
                                <CloneFrameworkModal
                                    projectId={projectId}
                                    frameworkId={analysisFrameworkId}
                                    addNewFramework={addNewFramework}
                                    setActiveFramework={setActiveFramework}
                                />
                            }
                        >
                            { _ts('project.framework', 'cloneButtonTitle') }
                        </AccentModalButton>

                    </div>
                </div>
                { frameworkDescription && (
                    <div
                        className={styles.description}
                        title={frameworkDescription}
                    >
                        { frameworkDescription }
                    </div>
                )}
            </header>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            frameworkGetRequest: {
                pending: pendingFramework,
                responseError: errorFramework,
            },
            frameworkId,
        } = this.props;

        const {
            activeView,
        } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.frameworkDetails}
        `;

        if (!frameworkId) {
            return (
                <div className={className}>
                    <Message className={styles.noFrameworkMessage}>
                        { _ts('project', 'noAfText') }
                    </Message>
                </div>
            );
        }

        if (pendingFramework) {
            return (
                <div className={className}>
                    <LoadingAnimation />
                </div>
            );
        }

        if (errorFramework) {
            return (
                <div className={className}>
                    <Message>
                        {_ts('project.framework', 'errorFrameworkLoad')}
                    </Message>
                </div>
            );
        }

        const {
            frameworkGetRequest: {
                response: framework,
            },
        } = this.props;

        const Header = this.renderHeader;

        return (
            <div className={className}>
                <Header
                    framework={framework}
                />
                <Preview
                    activeView={activeView}
                    className={styles.preview}
                    framework={framework}
                />
            </div>
        );
    }
}
