import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramGroup from '#rsci/Faram/FaramGroup';
import TextInput from '#rsci/TextInput';

import { iconNames } from '#constants';

import styles from './styles.scss';

const InputRow = ({ index }) => (
    <div className={styles.inputRow}>
        <FaramGroup faramElementName={String(index)}>
            <TextInput
                className={styles.input}
                faramElementName="value"
                autoFocus
                // FIXME: use strings
                label={`Cell ${index + 1}`}
                selectOnFocus
            />
        </FaramGroup>
        <DangerButton
            className={styles.deleteButton}
            iconName={iconNames.delete}
            faramAction="remove"
            // FIXME: use strings
            title="Remove Cell"
            faramElementIndex={index}
            transparent
        />
    </div>
);

InputRow.propTypes = {
    index: PropTypes.number.isRequired,
};

export default InputRow;

