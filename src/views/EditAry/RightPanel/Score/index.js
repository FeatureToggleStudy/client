import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import List from '../../../../vendor/react-store/components/View/List';
import styles from './styles.scss';

const propTypes = {
};
const defaultProps = {
};

export default class Score extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.scores = {
            fitForPurpose: {
                title: 'Fit for purpose',
                fields: {
                    relivance: {
                        title: 'Relivance',
                        detail: 'Results answers the original research questions or objectives, bring new or additional information and fill previous information gaps',
                    },
                    comprehensiveness: {
                        title: 'Comprehensiveness',
                        detail: 'Results cover all affected geographical areas, groups and sectors',
                    },
                    timeliness: {
                        title: 'Timeliness',
                        detail: 'Results were available on time to inform decision-making',
                    },
                    granularity: {
                        title: 'Granularity',
                        detail: 'Results are available at least for two levels of breakdown (sector/sub sector, Admin2/3, Affected groups level 2/3, etc.) and are broken down by relevant categories of analysis (sex, age, urban/rural, Conflict/no conflict, etc.)',
                    },
                    comparability: {
                        title: 'Comparability',
                        detail: 'Results uses or contributes to Common Operational Datasets',
                    },
                },
            },
            trustworthiness: {
                title: 'Analytical density',
                fields: {
                    sourceReliability: {
                        title: 'Source reliability',
                        detail: 'Authors of the reports are reliable (Track record for accuracy, technical expertise, motive for bias)',
                    },
                    methods: {
                        title: 'Methods',
                        detail: 'Methodology used is following golden standards/official guidelines and uses an analysis framework and plan',
                    },
                    triangulation: {
                        title: 'Triangulation',
                        detail: 'Efforts were made to use different methods and independent sources and triangulate results',
                    },
                    inclusiveness: {
                        title: 'Inclusiveness',
                        detail: 'Opinions from population and assessment teams were captured and contrasted',
                    },
                },
            },
            analyticalDensity: {
                title: 'Analytical density',
                fields: {
                    sector1: {
                        title: 'Sector #1',
                        detail: '',
                    },
                    sector2: {
                        title: 'Sector #2',
                        detail: '',
                    },
                    sector3: {
                        title: 'Sector #3',
                        detail: '',
                    },
                },
            },
            analyticalRigor: {
                title: 'Analytical rigor',
                fields: {
                    assumption: {
                        title: 'Assumptions',
                        detail: 'Key assumptions, information gaps and alternative explanations or inconsistencies are identified, clearly communicated and caveated',
                    },
                    corroboration: {
                        title: 'Corroboration',
                        detail: 'Results are corroborated and convergent across different independent sources',
                    },
                    structuredAnalyticalTechniques: {
                        title: 'Structured analytical techniques',
                        detail: 'At least one structured analytical technique was used for each analytical level',
                    },
                },
            },
            analyticalWriting: {
                title: 'Analytical writing',
                fields: {
                    bluf: {
                        title: 'BLUF',
                        detail: 'Results are articulated using a clear line of analysis and “Bottom Line Up Front”',
                    },
                    uncertainityCommunicatoin: {
                        title: 'Uncertainity communicatoin',
                        detail: 'Levels of confidence in estimates are available as well as reasons for uncertainty',
                    },
                    graphicalAdequity: {
                        title: 'Graphical adequity',
                        detail: 'Charts, tables and maps are used to illustrate results in a compelling and efficient way',
                    },
                    documentedDataAndMethod: {
                        title: 'Documented data and method',
                        detail: 'Data, evidence and tools supporting judgments are available, documented and clearly sourced',
                    },
                },
            },
        };
    }

    getClassName = () => {
        const className = styles.score;
        return className;
    }

    renderHeader = (k, data) => (
        <th
            className={styles.heading}
            key={data}
        >
            {data}
        </th>
    )

    renderSubRows = (key, data) => {
        const {
            title,
            detail,
        } = data;

        return (
            <tr
                key={key}
                className={styles.row}
            >
                <td className={styles.cell}>
                    <h5>{ title }</h5>
                    <div>{ detail }</div>
                </td>
                <td className={styles.cell}>
                    scale input maybe?
                </td>
            </tr>
        );
    }

    renderRow = (k, rowKey) => {
        const {
            fields,
            title,
        } = this.scores[rowKey];

        const subRows = Object.values(fields);
        const keys = Object.keys(fields);

        return (
            <React.Fragment key={rowKey}>
                <tr className={styles.row}>
                    <td
                        className={styles.pillarTitle}
                        colSpan="2"
                    >
                        { title }
                    </td>
                </tr>
                <List
                    data={subRows}
                    modifier={this.renderSubRows}
                    keyExtractor={(d, i) => keys[i]}
                />
            </React.Fragment>
        );
    }

    render() {
        const className = this.getClassName();
        const columns = ['', 'Score'];
        const scoreList = Object.keys(this.scores);

        return (
            <div className={className}>
                <table className={styles.table}>
                    <thead className={styles.head}>
                        <tr className={styles.row}>
                            <List
                                data={columns}
                                modifier={this.renderHeader}
                            />
                        </tr>
                    </thead>
                    <tbody className={styles.body}>
                        {
                            <List
                                data={scoreList}
                                modifier={this.renderRow}
                            />
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

