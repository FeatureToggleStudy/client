import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { FaramInputElement } from '#rscg/FaramElements';
import Confirm from '#rscv/Modal/Confirm';
import {
    findDuplicates,
    listToMap,
} from '#rsu/common';
import GeoInput from '#components/GeoInput';
import { afViewGeoOptionsSelector } from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    dataModifier: PropTypes.func.isRequired,
    titleSelector: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, // eslint-disable-line
};

const defaultProps = {
    geoOptions: {},
};

const getRegions = memoize(geoOptions => (
    Object.keys(geoOptions).reduce((acc, r) => {
        if (geoOptions[r] && geoOptions[r][0]) {
            return (
                [
                    {
                        id: geoOptions[r][0].region,
                        title: geoOptions[r][0].regionTitle,
                    },
                    ...acc,
                ]
            );
        }
        return (acc);
    }, [])
));

const emptyArray = [];

const mapStateToProps = state => ({
    geoOptions: afViewGeoOptionsSelector(state),
});

@FaramInputElement
@connect(mapStateToProps)
export default class GeoLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showDuplicateConfirm: false,
            duplicateItems: [],
            nonDuplicateItems: [],
        };
    }

    handleDuplicatesConfirmClose = () => {
        const { newValue } = this.state;

        this.setState({
            showDuplicateConfirm: false,
        }, () => {
            this.props.onChange(newValue, { lastItem: newValue[newValue.length - 1] });
        });
    }

    handleGeoChange = (_, objectValues) => {
        const locations = objectValues.map(item => ({
            ...item,
            label: item.title,
            originalKey: item.key,
            originalWidget: 'geo',
        }));
        if (locations.length < 1) {
            return;
        }
        const {
            dataModifier,
            titleSelector,
            value,
        } = this.props;

        const itemsMap = dataModifier(locations);
        let finalRows = [...value, ...itemsMap];

        const duplicates = findDuplicates(finalRows, titleSelector);
        if (duplicates.length > 0) {
            const duplicatesMap = listToMap(
                duplicates,
                d => d,
            );
            const newRowsWithoutDuplicates = itemsMap
                .filter(row => !duplicatesMap[titleSelector(row)]);

            finalRows = [...value, ...newRowsWithoutDuplicates];
            this.setState({
                showDuplicateConfirm: true,
                duplicateItems: duplicates,
                nonDuplicateItems: newRowsWithoutDuplicates.map(u => titleSelector(u)),
                newValue: finalRows,
            });
        } else {
            this.props.onChange(finalRows, { lastItem: finalRows[finalRows.length - 1] });
        }
    }

    render() {
        const { geoOptions } = this.props;
        const {
            duplicateItems,
            nonDuplicateItems,
            showDuplicateConfirm,
        } = this.state;

        const regions = getRegions(geoOptions);

        const label = _ts('widgets.editor.link', 'addFromGeoLabel');
        const modalClassNames = [];
        if (showDuplicateConfirm) {
            modalClassNames.push(styles.disableModal);
        }

        return (
            <React.Fragment>
                <GeoInput
                    className={modalClassNames.join(' ')}
                    geoOptionsByRegion={geoOptions}
                    label={label}
                    onChange={this.handleGeoChange}
                    regions={regions}
                    showLabel={false}
                    hideList
                    hideInput
                />
                <Confirm
                    show={showDuplicateConfirm}
                    hideCancel
                    closeOnEscape={false}
                    closeOnOutsideClick={false}
                    title={_ts('widgets.editor.link', 'duplicatesConfirmTitle')}
                    onClose={this.handleDuplicatesConfirmClose}
                >
                    {nonDuplicateItems.length > 0 ? (
                        <React.Fragment>
                            {_ts(
                                'widgets.editor.link',
                                'duplicatesConfirmText',
                                {
                                    duplicates: (
                                        <span className={styles.duplicateItems}>
                                            {duplicateItems.join(', ')}
                                        </span>
                                    ),
                                },
                            )}
                            <div className={styles.nonDuplicates} >
                                {_ts(
                                    'widgets.editor.link',
                                    'nonDuplicatesConfirmText',
                                    {
                                        nonDuplicates: (
                                            <span className={styles.duplicateItems}>
                                                {nonDuplicateItems.join(', ')}
                                            </span>
                                        ),
                                    },
                                )}
                            </div>
                        </React.Fragment>
                    ) : (
                        _ts(
                            'widgets.editor.link',
                            'duplicatesConfirmText',
                            {
                                duplicates: (
                                    <span className={styles.duplicateItems}>
                                        {duplicateItems.join(', ')}
                                    </span>
                                ),
                            },
                        )
                    )}
                </Confirm>
            </React.Fragment>
        );
    }
}
