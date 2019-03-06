import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    listToMap,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import Button from '#rsca/Button';
import SimpleHorizontalBarChart from '#rscz/SimpleHorizontalBarChart';
import SimpleVerticalBarChart from '#rscz/SimpleVerticalBarChart';
import Histogram from '#rscz/Histogram';
import WordCloud from '#rscz/WordCloud';
import modalize from '#rscg/Modalize';

import GeoViz from '#components/geo/GeoViz';
import _cs from '#cs';
import _ts from '#ts';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.shape({
        fieldId: PropTypes.number,
        title: PropTypes.string,
        type: PropTypes.string,
        series: PropTypes.array,
    }),
};

const defaultProps = {
    className: '',
    value: {
        title: '',
        type: 'string',
        series: [],
    },
};

const chartMargins = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
};

const sizeSelector = d => d.size;
const chartsLabelSelector = d => d.text;
const tooltipSelector = d => `<span>${d.text}</span>`;

const GRAPH = {
    horizontalBarChart: 'horizontal-bar-chart',
    verticalBarChart: 'vertical-bar-chart',
    wordCloud: 'world-cloud',
    histogram: 'histogram',
    geo: 'geo',
};

const GRAPH_MODES = {
    string: [GRAPH.horizontalBarChart, GRAPH.verticalBarChart, GRAPH.wordCloud],
    number: [GRAPH.histogram],
    datetime: [GRAPH.horizontalBarChart, GRAPH.verticalBarChart],
    geo: [GRAPH.verticalBarChart, GRAPH.geo],
};


const GRAPH_DETAILS = {
    [GRAPH.horizontalBarChart]: {
        title: _ts('components.viz.dataSeries', 'horizontalBarChartLabel'),
        iconName: 'horizontalBar',
    },
    [GRAPH.verticalBarChart]: {
        title: _ts('components.viz.dataSeries', 'verticalBarChartLabel'),
        iconName: 'verticalBar',
    },
    [GRAPH.histogram]: {
        title: _ts('components.viz.dataSeries', 'histogramLabel'),
        iconName: 'histogram',
    },
    [GRAPH.wordCloud]: {
        title: _ts('components.viz.dataSeries', 'wordCloudLabel'),
        iconName: 'word',
    },
    [GRAPH.geo]: {
        title: _ts('components.viz.dataSeries', 'geoLabel'),
        iconName: 'globe',
    },
};

const Tab = ({
    icon,
    onClick,
    isActive,
}) => (
    <button
        onClick={onClick}
        type="button"
        className={_cs(
            styles.tab,
            isActive && styles.activeTab,
        )}
    >
        <Icon name={icon} />
    </button>
);

Tab.propTypes = {
    icon: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
};

Tab.defaultProps = {
    icon: '',
};


export default class DataSeries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.views = this.createView({ showLegend: false });
        this.modalViews = this.createView({ showLegend: true });

        this.state = {
            activeView: undefined,
        };
    }

    getSegmentOptions = memoize(type => (
        listToMap(
            GRAPH_MODES[type],
            mode => mode,
            mode => GRAPH_DETAILS[mode],
        )
    ))

    getWordCountSeries = memoize((series) => {
        const sanitizedSeries = series
            .filter(datum => !datum.empty && !datum.invalid);

        const tags = sanitizedSeries.reduce(
            (acc, { value }) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {},
        );

        const newSeries = Object.keys(tags).map(word => ({
            text: word,
            size: tags[word],
        }));

        return newSeries;
    })

    getGeoCountSeries = memoize((series) => {
        const sanitizedSeries = series
            .filter(datum => !datum.empty && !datum.invalid);
        const tags = sanitizedSeries.reduce(
            (acc, { processedValue }) => {
                acc[processedValue] = (acc[processedValue] || 0) + 1;
                return acc;
            }, {},
        );
        return tags;
    })

    getNumberCountSeries = memoize((series) => {
        const sanitizedSeries = series
            .filter(datum => !datum.empty && !datum.invalid);
        const tags = sanitizedSeries.reduce(
            (acc, { value }) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {},
        );
        return Object.keys(tags)
            .map(word => ({
                text: word,
                size: tags[word],
            }))
            .sort((a, b) => a.size - b.size);
    })

    getNumberSeries = memoize(series => series.map((item, index) => ({
        key: index,
        value: parseFloat(item.value),
    })))

    getGeoValue = memoize(data => data
        .filter(d => d.processedValue)
        .map(d => String(d.processedValue)))

    createView = ({ showLegend }) => {
        const commonRendererParams = {
            valueSelector: sizeSelector,
            showTooltip: true,
            margins: chartMargins,
            tooltipSelector,
            labelSelector: chartsLabelSelector,
            showLegend,
        };

        return {
            [GRAPH.horizontalBarChart]: {
                component: SimpleHorizontalBarChart,
                rendererParams: () => {
                    const { value: { data } } = this.props;
                    return {
                        className: styles.horizontalBarChart,
                        data: this.getNumberCountSeries(data),
                        ...commonRendererParams,
                    };
                },
                lazyMount: true,
            },
            [GRAPH.histogram]: {
                component: Histogram,
                rendererParams: () => {
                    const { value: { data } } = this.props;
                    return {
                        className: styles.horizontalBarChart,
                        data: data.map(d => d.processedValue && d.processedValue),
                        ...commonRendererParams,
                    };
                },
                lazyMount: true,
            },
            [GRAPH.verticalBarChart]: {
                component: SimpleVerticalBarChart,
                rendererParams: () => {
                    const { value: { data } } = this.props;

                    return {
                        className: styles.verticalBarChart,
                        data: this.getNumberCountSeries(data),
                        ...commonRendererParams,
                    };
                },
                lazyMount: true,
            },
            [GRAPH.geo]: {
                component: GeoViz,
                rendererParams: () => {
                    const {
                        value: {
                            options = {},
                            data,
                        },
                    } = this.props;

                    const {
                        regions,
                        adminLevel,
                    } = options;

                    return {
                        className: styles.geoVisualization,
                        regions,
                        adminLevel,
                        value: this.getGeoValue(data),
                        frequency: this.getGeoCountSeries(data),
                        ...commonRendererParams,
                    };
                },
                lazyMount: true,
            },
            [GRAPH.wordCloud]: {
                component: WordCloud,
                rendererParams: () => {
                    const { value: { data } } = this.props;

                    return {
                        className: styles.wordCloud,
                        data: this.getWordCountSeries(data),
                        fontSizeSelector: sizeSelector,
                    };
                },
                lazyMount: true,
            },
        };
    }

    handleSegmentStateChange = (value) => {
        this.setState({ activeView: value });
    }

    scrollTabRendererParams = (_, tab) => ({
        icon: tab.iconName,
    })

    renderExpandedModal = ({
        closeModal,
        title,
        type,
        activeView: activeViewFromState,
    }) => {
        const options = this.getSegmentOptions(type);
        const activeView = activeViewFromState || Object.keys(options)[0];

        return (
            <Modal className={styles.expandedView}>
                <ModalHeader
                    title={title}
                    rightComponent={
                        <div className={styles.actionButtons}>
                            { options && Object.keys(options).length > 1 &&
                                <ScrollTabs
                                    active={activeView}
                                    className={styles.fixedTabs}
                                    onClick={this.handleSegmentStateChange}
                                    renderer={Tab}
                                    rendererParams={this.scrollTabRendererParams}
                                    tabs={options}
                                />
                            }
                            <Button
                                iconName="close"
                                onClick={closeModal}
                                transparent
                            />
                        </div>
                    }
                />
                <ModalBody className={styles.body}>
                    <MultiViewContainer
                        views={this.modalViews}
                        active={activeView}
                    />
                </ModalBody>
            </Modal>
        );
    };


    render() {
        const {
            className,
            value,
        } = this.props;

        const { activeView: activeViewFromState } = this.state;
        const ExpandedModal = this.renderExpandedModal;

        const options = this.getSegmentOptions(value.type);
        const activeView = activeViewFromState || Object.keys(options)[0];

        return (
            <div className={_cs(className, 'data-series', styles.dataSeries)}>
                <header className={styles.header}>
                    <h5 className={styles.heading}>
                        {value.title}
                    </h5>
                    <div className={styles.actions}>
                        { options && Object.keys(options).length > 1 &&
                            <ScrollTabs
                                active={activeView}
                                className={styles.fixedTabs}
                                onClick={this.handleSegmentStateChange}
                                renderer={Tab}
                                rendererParams={this.scrollTabRendererParams}
                                tabs={options}
                            />
                        }
                        <ModalButton
                            iconName="expand"
                            className={styles.expandButton}
                            transparent
                            modal={
                                <ExpandedModal
                                    title={value.title}
                                    type={value.type}
                                    activeView={activeView}
                                />
                            }
                        />
                    </div>
                </header>
                <div className={styles.content}>
                    <MultiViewContainer
                        views={this.views}
                        active={activeView}
                    />
                </div>
            </div>
        );
    }
}
