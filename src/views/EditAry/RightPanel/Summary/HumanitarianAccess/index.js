import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '#rscg/FaramGroup';
import SelectInput from '#rsci/SelectInput';
import HiearchicalSelectInput from '#rsci/HierarchicalSelectInput';

import {
    priorityIssuesSelector,
    affectedLocationsSelector,
} from '#redux';
import _ts from '#ts';
import _cs from '#cs';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    priorityIssues: PropTypes.arrayOf(PropTypes.object).isRequired,
    affectedLocations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    priorityIssues: priorityIssuesSelector(state),
    affectedLocations: affectedLocationsSelector(state),
});

@connect(mapStateToProps)
export default class HumanitarianAccess extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static nodeIdSelector = d => d.id;
    static nodeLabelSelector = d => d.title;
    static nodeChildrenSelector = d => d.children;

    static rowFieldTitles = [
        {
            key: 'priorityIssue',
            title: _ts('editAssessment.summary', 'priorityIssue'),
        },
        {
            key: 'affectedLocation',
            title: _ts('editAssessment.summary', 'affectedLocation'),
        },
    ];

    static rowSubFieldTitles = [
        {
            key: 'rank1',
            title: _ts('editAssessment.summary', 'rank1Title'),
        },
        {
            key: 'rank2',
            title: _ts('editAssessment.summary', 'rank2Title'),
        },
        {
            key: 'rank3',
            title: _ts('editAssessment.summary', 'rank3Title'),
        },
    ];

    static columnFieldTitles = [
        {
            key: 'limitedAccessPopulation',
            title: _ts('editAssessment.summary', 'limitedAccessPopulation'),
        },
        {
            key: 'restrictedAccessPopulation',
            title: _ts('editAssessment.summary', 'restrictedAccessPopulation'),
        },
        {
            key: 'humanitarianAccessPopulation',
            title: _ts('editAssessment.summary', 'humanitarianAccessPopulation'),
        },
    ];

    renderInput = (rowKey, subRowKey, columnKey) => {
        const {
            priorityIssues,
            affectedLocations,
        } = this.props;

        if (rowKey === 'priorityIssue') {
            return (
                <HiearchicalSelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={priorityIssues}
                    keySelector={HumanitarianAccess.nodeIdSelector}
                    labelSelector={HumanitarianAccess.nodeLabelSelector}
                    childrenSelector={HumanitarianAccess.nodeChildrenSelector}
                    placeholder=""
                />
            );
        } else if (rowKey === 'affectedLocation') {
            return (
                <SelectInput
                    faramElementName={columnKey}
                    showHintAndError={false}
                    options={affectedLocations}
                    labelSelector={HumanitarianAccess.nodeLabelSelector}
                    keySelector={HumanitarianAccess.nodeIdSelector}
                    placeholder=""
                />
            );
        }

        return null;
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const className = _cs(
            classNameFromProps,
            'humanitarian-access',
            styles.humanitarianAccess,
        );

        return (
            <FaramGroup faramElementName="humanitarianAccess">
                <TabularInputs
                    rowFieldTitles={HumanitarianAccess.rowFieldTitles}
                    columnFieldTitles={HumanitarianAccess.columnFieldTitles}
                    rowSubFieldTitles={HumanitarianAccess.rowSubFieldTitles}
                    classNames={{
                        wrapper: className,
                        table: styles.table,
                        head: styles.head,
                        body: styles.body,
                        row: styles.row,
                        header: styles.header,
                        cell: styles.cell,
                        sectionTitle: styles.sectionTitle,
                    }}
                    inputModifier={this.renderInput}
                />
            </FaramGroup>
        );
    }
}
