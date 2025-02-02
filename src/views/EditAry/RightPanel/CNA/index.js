import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import {
    _cs,
    compareNumber,
} from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    aryTemplateQuestionnaireListSelector,
} from '#redux';

import Questionnaire from '../Questionnaire';
import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool,
    className: PropTypes.string,
    questionnaireList: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    pending: false,
    className: '',
    questionnaireList: [],
};

const mapStateToProps = state => ({
    questionnaireList: aryTemplateQuestionnaireListSelector(state),
});

const valueMap = {
    criteria: 0,
    ethos: 1,
};

const CNA = 'cna';

@connect(mapStateToProps)
export default class CNAPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getQuestionnaireList = memoize(questionnaireList => (
        questionnaireList
            .filter(d => d.method === CNA)
            // Show all 'criteria' submethod before 'ethos' submethod
            .sort((a, b) => compareNumber(valueMap[a.subMethod], valueMap[b.subMethod]))
    ))

    render() {
        const {
            pending,
            className,
            questionnaireList,
        } = this.props;

        const questionnaires = this.getQuestionnaireList(questionnaireList);

        return (
            <div className={_cs(className, styles.cna)}>
                {pending && <LoadingAnimation />}
                <Questionnaire
                    data={questionnaires}
                    method={CNA}
                />
            </div>
        );
    }
}
