import PropTypes from 'prop-types';
import React from 'react';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rscg/Faram';

import _ts from '#ts';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
};

const defaultProps = {
    data: {},
};

export default class DefaultEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const { title } = props;
        this.state = {
            faramValues: { title },
            faramErrors: {},
            pristine: true,
            hasError: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const { title } = faramValues;
        this.props.onSave(undefined, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        const cancelButtonLabel = _ts('widgets.editor.default', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.default', 'saveButtonLabel');
        const cancelConfirmMessage = _ts('widgets.editor.default', 'cancelConfirmMessage');

        return (
            <Modal>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={DefaultEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            autoFocus
                            label={_ts('widgets.editor.default', 'titleLabel')}
                            placeholder={_ts('widgets.editor.default', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={onClose}
                            confirmationMessage={cancelConfirmMessage}
                            skipConfirmation={pristine}
                        >
                            {cancelButtonLabel}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
