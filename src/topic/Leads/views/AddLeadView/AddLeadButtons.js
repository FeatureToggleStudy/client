/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../../public/utils/immutable-update';
import {
    TransparentButton,
} from '../../../../public/components/Action';
import {
    FileInput,
} from '../../../../public/components/Input';

import {
    addAddLeadViewLeadsAction,
    addLeadViewLeadsCountSelector,
    activeProjectSelector,
} from '../../../../common/redux';
import DropboxChooser from '../../../../common/components/DropboxChooser';
import GooglePicker from '../../../../common/components/GooglePicker';
import { dropboxAppKey } from '../../../../common/config/dropbox';
import { googleDriveClientId, googleDriveDeveloperKey } from '../../../../common/config/google-drive';

import styles from './styles.scss';

const supportedGoogleDriveMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'image/png', 'image/jpeg', 'image/fig',
    'application/json', 'application/xml', 'application/msword',
];

const supportedDropboxExtension = [
    '.doc', '.docx', '.rtf', '.txt',
    '.otf', '.pdf', '.ppt', '.pptx',
    '.xls', '.xlsx', '.csv', '.png',
    '.jpg', '.gif', '.json', '.xml',
];

const leadReference = {
    data: {
        id: 'lead-0',
        type: 'void',
    },
    form: {
        values: {
            title: 'Lead #0',
            project: 0,
        },
        errors: [],
        fieldErrors: {},
    },
    uiState: {
        error: false,
        pending: false,
        ready: true,
        stale: false,
    },
    isFiltrate: true,
};

const leadForGoogleDrive = (counter, title, projectId) => {
    const settings = {
        data: {
            id: { $set: `lead-${counter}` },
            type: { $set: 'drive' },
        },
        form: { values: {
            title: { $set: title },
            project: { $set: projectId },
        } },
    };
    return update(leadReference, settings);
};

const leadForDropbox = (counter, title, projectId) => {
    const settings = {
        data: {
            id: { $set: `lead-${counter}` },
            type: { $set: 'dropbox' },
        },
        form: { values: {
            title: { $set: title },
            project: { $set: projectId },
        } },
    };
    return update(leadReference, settings);
};

const leadForFile = (counter, title, projectId) => {
    const settings = {
        data: {
            id: { $set: `lead-${counter}` },
            type: { $set: 'file' },
        },
        uiState: {
            ready: { $set: false },
        },
        form: { values: {
            title: { $set: title },
            project: { $set: projectId },
        } },
    };
    return update(leadReference, settings);
};

const leadForWebsite = (counter, projectId) => {
    const settings = {
        data: {
            id: { $set: `lead-${counter}` },
            type: { $set: 'website' },
        },
        form: { values: {
            title: { $set: `Lead #${counter}` },
            project: { $set: projectId },
        } },
    };
    return update(leadReference, settings);
};

const leadForText = (counter, projectId) => {
    const settings = {
        data: {
            id: { $set: `lead-${counter}` },
            type: { $set: 'text' },
        },
        form: { values: {
            title: { $set: `Lead #${counter}` },
            project: { $set: projectId },
        } },
    };
    return update(leadReference, settings);
};

const defaultProps = {
};

const propTypes = {
    leadsCount: PropTypes.number.isRequired,
    addLeads: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
    leadsCount: addLeadViewLeadsCountSelector(state),
    activeProject: activeProjectSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeads: leads => dispatch(addAddLeadViewLeadsAction(leads)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { dropboxDisabled: false };
    }

    handleAddLeadFromGoogleDrive = (response) => {
        const { docs, action } = response;
        if (action !== 'picked') {
            return;
        }

        const { activeProject } = this.props;
        const newLeads = [];
        let counter = this.props.leadsCount;
        docs.forEach((doc) => {
            counter += 1;
            const newLead = leadForGoogleDrive(counter, doc.name, activeProject);
            newLeads.unshift(newLead);
        });
        this.props.addLeads(newLeads);
    }

    handleAddLeadFromDropbox = (response) => {
        if (response.length <= 0) {
            return;
        }
        const { activeProject } = this.props;
        const newLeads = [];
        let counter = this.props.leadsCount;
        response.forEach((doc) => {
            counter += 1;
            const newLead = leadForDropbox(counter, doc.name, activeProject);
            newLeads.unshift(newLead);
        });
        this.props.addLeads(newLeads);
    }

    handleAddLeadFromDisk = (e) => {
        const files = Object.values(e);
        if (files.length <= 0) {
            return;
        }

        const { activeProject } = this.props;
        const newLeads = [];
        let counter = this.props.leadsCount;
        files.forEach((file) => {
            counter += 1;
            const newLead = leadForFile(counter, file.name, activeProject);
            newLeads.unshift(newLead);
        });
        this.props.addLeads(newLeads);
    }

    handleAddLeadFromWebsite = () => {
        const { activeProject } = this.props;
        let counter = this.props.leadsCount;
        counter += 1;
        const newLead = leadForWebsite(counter, activeProject);
        this.props.addLeads([newLead]);
    }

    handleAddLeadFromText = () => {
        const { activeProject } = this.props;
        let counter = this.props.leadsCount;
        counter += 1;
        const newLead = leadForText(counter, activeProject);
        this.props.addLeads([newLead]);
    }

    render() {
        const {
            dropboxDisabled,
        } = this.state;

        return (
            <div styleName="add-lead-buttons">
                <h3 styleName="heading">
                    Add new lead from:
                </h3>
                <GooglePicker
                    styleName="add-lead-btn"
                    clientId={googleDriveClientId}
                    developerKey={googleDriveDeveloperKey}
                    onChange={this.handleAddLeadFromGoogleDrive}
                    mimeTypes={supportedGoogleDriveMimeTypes}
                    multiselect
                    navHidden
                >
                    <span className="ion-social-google" />
                    <p>Drive</p>
                </GooglePicker>
                <DropboxChooser
                    styleName="add-lead-btn"
                    appKey={dropboxAppKey}
                    multiselect
                    extensions={supportedDropboxExtension}
                    success={this.handleAddLeadFromDropbox}
                    onClick={() => this.setState({ dropboxDisabled: true })}
                    cancel={() => this.setState({ dropboxDisabled: false })}
                    disabled={dropboxDisabled}
                >
                    <span className="ion-social-dropbox" />
                    <p>Dropbox</p>
                </DropboxChooser>
                <FileInput
                    styleName="add-lead-btn"
                    onChange={this.handleAddLeadFromDisk}
                    showStatus={false}
                    multiple
                >
                    <span className="ion-android-upload" />
                    <p>Local disk</p>
                </FileInput>
                <TransparentButton
                    styleName="add-lead-btn"
                    onClick={this.handleAddLeadFromWebsite}
                >
                    <span className="ion-earth" />
                    <p>Website</p>
                </TransparentButton>
                <TransparentButton
                    styleName="add-lead-btn"
                    onClick={this.handleAddLeadFromText}
                >
                    <span className="ion-clipboard" />
                    <p>Text</p>
                </TransparentButton>
            </div>
        );
    }
}
