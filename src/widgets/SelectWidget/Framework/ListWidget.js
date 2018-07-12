import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '#rs/utils/common';
import update from '#rs/utils/immutable-update';
import TextInput from '#rs/components/Input/TextInput';
import Button from '#rs/components/Action/Button';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import AccentButton from '#rs/components/Action/Button/AccentButton';
import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import SelectInput from '#rs/components/Input/SelectInput';
import SortableList from '#rs/components/View/SortableList';
import BoundError from '#rs/components/General/BoundError';

import _ts from '#ts';
import { iconNames } from '#constants';
import WidgetError from '#components/WidgetError';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const emptyObject = {};
const emptyList = [];

@BoundError(WidgetError)
export default class Select extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static valueKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        const {
            title,
            data,
            editAction,
        } = this.props;
        const options = data.options || emptyList;

        this.state = {
            showEditModal: false,
            title,
            options,
        };

        editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            const { options } = (nextProps.data || emptyObject);
            this.setState({ options });
        }
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleOptionOrderChange = (newOptions) => {
        this.setState({ options: newOptions });
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleRemoveButtonClick = (key) => {
        const options = this.state.options.filter(d => d.key !== key);
        this.setState({ options });
    }

    handleValueInputChange = (key, value) => {
        const valueIndex = this.state.options.findIndex(d => d.key === key);
        const settings = {
            [valueIndex]: {
                label: { $set: value },
            },
        };
        const options = update(this.state.options, settings);

        this.setState({ options });
    }

    handleAddOptionButtonClick = () => {
        const newOption = {
            key: randomString(16).toLowerCase(),
            label: '',
        };

        this.setState({
            options: [
                ...this.state.options,
                newOption,
            ],
        });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            options: this.props.data.options,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { options } = this.state;
        const { data } = this.props;

        const newData = {
            ...data,
            options,
        };

        this.props.onChange(
            newData,
            this.state.title,
        );
    }

    renderEditOption = (key, data) => (
        <div
            className={styles.editOption}
            key={key}
        >
            <TextInput
                className={styles.titleInput}
                label={_ts('framework.selectWidget', 'optionLabel')}
                placeholder={_ts('framework.selectWidget', 'optionPlaceholder')}
                onChange={(value) => { this.handleValueInputChange(key, value); }}
                showHintAndError={false}
                value={data.label}
                autoFocus
            />
            <DangerButton
                className={styles.deleteButton}
                onClick={() => { this.handleRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    renderDragHandle = () => {
        const dragStyle = [styles.dragHandle];
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderEditModal = () => {
        const {
            showEditModal,
            options,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('framework.selectWidget', 'editSelectModalTitle');
        const titleInputLabel = _ts('framework.selectWidget', 'titleLabel');
        const titleInputPlaceholder = _ts('framework.selectWidget', 'titlePlaceholderScale');
        const optionsTitle = _ts('framework.selectWidget', 'optionsHeader');
        const addOptionButtonLabel = _ts('framework.selectWidget', 'addOptionButtonLabel');
        const cancelButtonLabel = _ts('framework.selectWidget', 'cancelButtonLabel');
        const saveButtonLabel = _ts('framework.selectWidget', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <ModalHeader title={headerTitle} />
                <ModalBody className={styles.body}>
                    <div className={styles.titleInputContainer}>
                        <TextInput
                            className={styles.titleInput}
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            onChange={this.handleWidgetTitleChange}
                            value={title}
                            showHintAndError={false}
                            autoFocus
                            selectOnFocus
                        />
                    </div>
                    <div className={styles.optionInputs}>
                        <header className={styles.header}>
                            <h4>
                                { optionsTitle }
                            </h4>
                            <AccentButton
                                onClick={this.handleAddOptionButtonClick}
                                transparent
                            >
                                { addOptionButtonLabel }
                            </AccentButton>
                        </header>
                        <SortableList
                            className={styles.editOptionList}
                            data={options}
                            modifier={this.renderEditOption}
                            onChange={this.handleOptionOrderChange}
                            sortableItemClass={styles.sortableUnit}
                            keyExtractor={Select.valueKeyExtractor}
                            dragHandleModifier={this.renderDragHandle}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleModalCancelButtonClick}>
                        { cancelButtonLabel }
                    </Button>
                    <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                        { saveButtonLabel }
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const { options } = this.state;
        const EditModal = this.renderEditModal;

        return (
            <div className={styles.list}>
                <SelectInput
                    className={styles.input}
                    options={options}
                    keyExtractor={Select.valueKeyExtractor}
                    disabled
                />
                <EditModal />
            </div>
        );
    }
}
