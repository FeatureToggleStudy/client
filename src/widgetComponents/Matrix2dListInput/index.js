import React from 'react';
import PropTypes from 'prop-types';

import FaramElement from '#rsci/Faram/FaramElement';
import ListView from '#rs/components/View/List/ListView';
import update from '#rsu/immutable-update';

import Row from './Row';
import styles from './styles.scss';

const propTypes = {
    dimensions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    sectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    onChange: PropTypes.func, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    dimensions: [],
    sectors: [],
    value: undefined,
    disabled: false,
    onChange: () => {},
};

const getSelectedSectors = (dimensions = [], sectors = [], value) => {
    const selectedSectors = [];

    if (!value) {
        return selectedSectors;
    }

    dimensions.forEach((dimension) => {
        const dimensionAttribute = value[dimension.id];
        if (!dimensionAttribute) {
            return;
        }

        dimension.subdimensions.forEach((subdimension) => {
            const subdimensionAttribute = dimensionAttribute[subdimension.id];
            if (!subdimensionAttribute) {
                return;
            }

            sectors.forEach((sector) => {
                const sectorAttribute = subdimensionAttribute[sector.id];
                if (!sectorAttribute) {
                    return;
                }

                selectedSectors.push({
                    key: `${sector.id}-${dimension.id}-${subdimension.id}`,
                    dimension,
                    subdimension,
                    sector,
                    subsectors: sectorAttribute,
                });
            });
        });
    });
    return selectedSectors;
};

class Matrix2dListInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static rowKeyExtractor = d => d.key;

    handleChange = (dimensionId, subdimensionId, sectorId, subsectors) => {
        const {
            value,
            onChange,
        } = this.props;

        const settings = { $auto: {
            [dimensionId]: { $auto: {
                [subdimensionId]: { $auto: {
                    [sectorId]: { $set: subsectors },
                } },
            } },
        } };

        const newValue = update(value, settings);
        onChange(newValue);
    }

    rendererParams = (key, row) => ({
        dimension: row.dimension,
        subdimension: row.subdimension,
        sector: row.sector,
        subsectors: row.subsectors,
        disabled: this.props.disabled,
        onChange: this.handleChange,
    })

    render() {
        const {
            dimensions,
            sectors,
            value,
        } = this.props;

        const data = getSelectedSectors(dimensions, sectors, value);

        return (
            <ListView
                className={styles.list}
                data={data}
                renderer={Row}
                rendererParams={this.rendererParams}
                keyExtractor={Matrix2dListInput.rowKeyExtractor}
            />
        );
    }
}

export default FaramElement('input')(Matrix2dListInput);
