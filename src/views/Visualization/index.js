import React from 'react';
import _ts from '#ts';

import VerticalTabs from '#rscv/VerticalTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import wrapViz from '#rscz/VizWrapper';
import SunBurst from '#rscz/SunBurst';
import ChordDiagram from '#rscz/ChordDiagram';
import TreeMap from '#rscz/TreeMap';
import CorrelationMatrix from '#rscz/CorrelationMatrix';
import OrgChart from '#rscz/OrgChart';
import HorizontalBar from '#rscz/HorizontalBar';
import Dendrogram from '#rscz/Dendrogram';
import ForceDirectedGraph from '#rscz/ForceDirectedGraph';
import CollapsibleTree from '#rscz/CollapsibleTree';
import RadialDendrogram from '#rscz/RadialDendrogram';
import PieChart from '#rscz/PieChart';
import DonutChart from '#rscz/DonutChart';
import Sankey from '#rscz/Sankey';
import ParallelCoordinates from '#rscz/ParallelCoordinates';
import StreamGraph from '#rscz/StreamGraph';
import StackedBarChart from '#rscz/StackedBarChart';
import SparkLines from '#rscz/SparkLines';
import Organigram from '#rscz/Organigram';

import BoundError from '#rscg/BoundError';
import VizError from '#components/VizError';
import AppError from '#components/AppError';

import barData from './dummydata/barData';
import chordData from './dummydata/chordData';
import correlationData from './dummydata/correlationData';
import forceDirectedData from './dummydata/forceDirectedData';
import hierarchicalData from './dummydata/hierarchical';
import lineData from './dummydata/lineData';
import parallelData from './dummydata/parallelData';
import sankeyData from './dummydata/sankeyData';
import stackedData from './dummydata/stackedData';
import streamData from './dummydata/streamData';

import styles from './styles.scss';

const ChordDiagramView = BoundError(VizError)(wrapViz(ChordDiagram));
const SunBurstView = BoundError(VizError)(wrapViz(SunBurst));
const CorrelationMatrixView = BoundError(VizError)(wrapViz(CorrelationMatrix));
const RadialDendrogramView = BoundError(VizError)(wrapViz(RadialDendrogram));
const TreeMapView = BoundError(VizError)(wrapViz(TreeMap));
const ForceDirectedGraphView = BoundError(VizError)(wrapViz(ForceDirectedGraph));
const CollapsibleTreeView = BoundError(VizError)(wrapViz(CollapsibleTree));
const OrgChartView = BoundError(VizError)(wrapViz(OrgChart));
const HorizontalBarView = BoundError(VizError)(wrapViz(HorizontalBar));
const DendrogramView = BoundError(VizError)(wrapViz(Dendrogram));
const SparkLinesView = BoundError(VizError)(wrapViz(SparkLines));
const StackedBarChartView = BoundError(VizError)(wrapViz(StackedBarChart));
const StreamGraphView = BoundError(VizError)(wrapViz(StreamGraph));
const SankeyView = BoundError(VizError)(wrapViz(Sankey));
const PieChartView = BoundError(VizError)(wrapViz(PieChart));
const DonutChartView = BoundError(VizError)(wrapViz(DonutChart));
const OrganigramView = BoundError(VizError)(wrapViz(Organigram));
const ParallelCoordinatesView = BoundError(VizError)(wrapViz(ParallelCoordinates));

const sizeAccessor = d => d.size;
const nameAccessor = d => d.name;
const valueAccessor = d => d.value;
const labelAccessor = d => d.label;
const idAccessor = d => d.id;
const groupAccessor = d => d.group;
const monthAccessor = d => d.month;
const timeAccessor = d => d.time;

@BoundError(AppError)
export default class Visualization extends React.PureComponent {
    constructor(props) {
        super(props);

        this.tabs = {
            sunBurst: _ts('visualization', 'sunburst'),
            correlationMatrix: _ts('visualization', 'correlationMatrix'),
            dendrogram: _ts('visualization', 'dendrogram'),
            radialDendrogram: _ts('visualization', 'radialDendrogram'),
            treemap: _ts('visualization', 'treemap'),
            zoomableTreemap: _ts('visualization', 'zoomableTreemap'),
            chordDiagram: _ts('visualization', 'chordDiagram'),
            horizontalBar: _ts('visualization', 'horizontalBar'),
            forcedDirectedGraph: _ts('visualization', 'forcedDirectedGraph'),
            forcedDirectedGraphVoronoi: _ts('visualization', 'forceDirectedGraphVoronoi'),
            collapsibleTree: _ts('visualization', 'collapsibleTree'),
            orgChart: _ts('visualization', 'orgChart'),
            pieChart: _ts('visualization', 'pieChart'),
            donutChart: _ts('visualization', 'donutChart'),
            organigram: _ts('visualization', 'organigram'),
            stackedBarChart: _ts('visualization', 'stackedBarChart'),
            streamGraph: _ts('visualization', 'streamGraph'),
            sankey: _ts('visualization', 'sankey'),
            sparkLines: _ts('visualization', 'sparklines'),
            parallelCoordinates: _ts('visualization', 'parallelCoordinates'),
        };

        this.views = {
            sunBurst: {
                component: () => (
                    <SunBurstView
                        className={styles.sunburst}
                        headerText={_ts('visualization', 'sunburst')}
                        data={hierarchicalData}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                    />
                ),
            },
            correlationMatrix: {
                component: () => (
                    <CorrelationMatrixView
                        className={styles.correlationMatrix}
                        headerText={_ts('visualization', 'correlationMatrix')}
                        data={correlationData}
                        colorSchemeType="continuous"
                    />
                ),
            },
            dendrogram: {
                component: () => (
                    <DendrogramView
                        className={styles.dendrogram}
                        headerText={_ts('visualization', 'dendrogram')}
                        data={hierarchicalData}
                        labelAccessor={nameAccessor}
                        valueAccessor={sizeAccessor}
                    />
                ),
            },
            radialDendrogram: {
                component: () => (
                    <RadialDendrogramView
                        className={styles.radialDendrogram}
                        headerText={_ts('visualization', 'radialDendrogram')}
                        data={hierarchicalData}
                        labelAccessor={nameAccessor}
                    />
                ),
            },
            treemap: {
                component: () => (
                    <TreeMapView
                        className={styles.treemap}
                        headerText={_ts('visualization', 'treemap')}
                        data={hierarchicalData}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                    />
                ),
            },
            zoomableTreemap: {
                component: () => (
                    <TreeMapView
                        className={styles.treemap}
                        headerText={_ts('visualization', 'zoomableTreemap')}
                        data={hierarchicalData}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                        zoomable={false}
                    />
                ),
            },
            chordDiagram: {
                component: () => (
                    <ChordDiagramView
                        className={styles.chordDiagram}
                        headerText={_ts('visualization', 'chordDiagram')}
                        data={chordData.values}
                        labelsData={chordData.labels}
                        valueAccessor={sizeAccessor}
                        labelAccessor={nameAccessor}
                    />
                ),
            },
            horizontalBar: {
                component: () => (
                    <HorizontalBarView
                        className={styles.horizontalBar}
                        headerText={_ts('visualization', 'horizontalBar')}
                        data={barData.data}
                        valueAccessor={valueAccessor}
                        labelAccessor={labelAccessor}
                    />
                ),
            },
            forcedDirectedGraph: {
                component: () => (
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraph}
                        headerText={_ts('visualization', 'forcedDirectedGraph')}
                        data={forceDirectedData}
                        idAccessor={idAccessor}
                        groupAccessor={groupAccessor}
                        valueAccessor={valueAccessor}
                    />
                ),
            },
            forcedDirectedGraphVoronoi: {
                component: () => (
                    <ForceDirectedGraphView
                        className={styles.forcedDirectedGraphVoronoi}
                        headerText={_ts('visualization', 'forceDirectedGraphVoronoi')}
                        data={forceDirectedData}
                        idAccessor={idAccessor}
                        groupAccessor={groupAccessor}
                        valueAccessor={valueAccessor}
                        useVoronoi={false}
                    />
                ),
            },
            collapsibleTree: {
                component: () => (
                    <CollapsibleTreeView
                        className={styles.collapsibleTreeView}
                        headerText={_ts('visualization', 'collapsibleTree')}
                        data={hierarchicalData}
                        labelAccessor={nameAccessor}
                    />
                ),
            },
            orgChart: {
                component: () => (
                    <OrgChartView
                        className={styles.orgChart}
                        headerText={_ts('visualization', 'orgChart')}
                        data={hierarchicalData}
                        idAccessor={nameAccessor}
                    />
                ),
            },
            pieChart: {
                component: () => (
                    <PieChartView
                        className={styles.pieChart}
                        headerText={_ts('visualization', 'pieChart')}
                        data={barData.data}
                        valueAccessor={valueAccessor}
                        labelAccessor={labelAccessor}
                    />
                ),
            },
            donutChart: {
                component: () => (
                    <DonutChartView
                        className={styles.donutChart}
                        headerText={_ts('visualization', 'donutChart')}
                        data={barData.data}
                        valueAccessor={valueAccessor}
                        labelAccessor={labelAccessor}
                    />
                ),
            },
            organigram: {
                component: () => (
                    <OrganigramView
                        className={styles.organigram}
                        headerText={_ts('visualization', 'organigram')}
                        data={hierarchicalData}
                        idAccessor={nameAccessor}
                    />
                ),
            },
            stackedBarChart: {
                component: () => (
                    <StackedBarChartView
                        className={styles.stackedBarChart}
                        headerText={_ts('visualization', 'stackedBarChart')}
                        data={stackedData}
                        labelName="month"
                        labelAccessor={monthAccessor}
                    />
                ),
            },
            streamGraph: {
                component: () => (
                    <StreamGraphView
                        className={styles.streamGraph}
                        headerText={_ts('visualization', 'streamGraph')}
                        data={streamData}
                        labelName="time"
                        labelAccessor={timeAccessor}
                    />
                ),
            },
            sankey: {
                component: () => (
                    <SankeyView
                        className={styles.sankey}
                        headerText={_ts('visualization', 'sankey')}
                        data={sankeyData}
                        valueAccessor={valueAccessor}
                        labelAccessor={nameAccessor}
                    />
                ),
            },
            sparkLines: {
                component: () => (
                    <SparkLinesView
                        className={styles.sparklines}
                        headerText={_ts('visualization', 'sparklines')}
                        data={lineData.data}
                        valueAccessor={valueAccessor}
                    />
                ),
            },
            parallelCoordinates: {
                component: () => (
                    <ParallelCoordinatesView
                        className={styles.parallelCoordinates}
                        headerText={_ts('visualization', 'parallelCoordinates')}
                        data={parallelData}
                        labelName="name"
                        labelAccessor={nameAccessor}
                    />
                ),
            },
        };
    }

    render() {
        return (
            <div className={styles.visualization}>
                <header className={styles.header}>
                    <h2>
                        {_ts('visualization', 'visualizationTitle')}
                    </h2>
                </header>
                <div className={styles.content}>
                    <VerticalTabs
                        className={styles.tabs}
                        tabs={this.tabs}
                        useHash
                    />
                    <MultiViewContainer
                        className={styles.visualizations}
                        views={this.views}
                        useHash
                    />
                </div>
            </div>
        );
    }
}
