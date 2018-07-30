import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rsci/Faram/FaramGroup';
import TextInput from '#rsci/TextInput';

import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class InputRow extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { index } = this.props;
        return (
            <div className={styles.inputContainer}>
                <FaramGroup
                    faramElementName={String(index)}
                >
                    <TextInput
                        className={styles.titleInput}
                        faramElementName="label"
                        // FIXME: use strings
                        label={`Option ${index + 1}`}
                        autoFocus
                    />
                </FaramGroup>
                <DangerButton
                    className={styles.deleteButton}
                    iconName={iconNames.delete}
                    faramAction="remove"
                    // FIXME: use strings
                    title="Remove Option"
                    faramElementIndex={index}
                    transparent
                />
            </div>
        );
    }
}
