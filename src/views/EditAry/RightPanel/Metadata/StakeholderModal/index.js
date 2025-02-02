import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import DangerButton from '#rsca/Button/DangerButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ListView from '#rscv/List/ListView';

// import Widget from './Widget';

import OrganizationList from './OrganizationList';

import {
    renderDroppableWidget,
    isDroppableWidget,
} from '../../widgetUtils';

import styles from './styles.scss';

// FIXME: Use strings everywhere, define all the props
// FIXME: No inline functions


const propTypes = {
    closeModal: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    sources: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    fields: PropTypes.array,
};

const defaultProps = {
    closeModal: () => {},
    sources: {},
    fields: [],
};

const fieldKeySelector = d => d.id;

export default class StakeholderModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderWidget = (k, data) => renderDroppableWidget(
        k,
        data,
        this.props.sources,
        {
            containerClassName: styles.widgetContainer,
            className: isDroppableWidget(data.sourceType, data.fieldType)
                ? styles.droppableWidget : styles.widget,
            itemClassName: styles.widgetItem,
        },
    );

    render() {
        const {
            closeModal,
            fields,
            sources,
        } = this.props;

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
                className={styles.modal}
            >
                <ModalHeader title="Stakeholders" />
                <ModalBody className={styles.modalBody}>
                    <OrganizationList
                        sources={sources}
                        className={styles.organizationList}
                    />
                    <div className={styles.right}>
                        <ListView
                            className={styles.widgetList}
                            data={fields}
                            modifier={this.renderWidget}
                            keySelector={fieldKeySelector}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={closeModal}>
                        Close
                    </DangerButton>
                </ModalFooter>
            </Modal>
        );
    }
}
