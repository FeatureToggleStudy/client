import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import SegmentInput from '#rsci/SegmentInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { FgRestBuilder } from '#rsu/rest';
import Message from '#rscv/Message';

import {
    createParamsForGet,
    createUrlForAdminLevelsForRegion,
    createUrlForGeoAreasLoadTrigger,
    createUrlForGeoJsonMap,
    createUrlForGeoJsonBounds,
} from '#rest';
import _ts from '#ts';

import GeoJsonMap from './GeoJsonMap';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number,
    selections: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    onLocationsChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    regionId: undefined,
    selections: [],
    onChange: undefined,
    onLocationsChange: undefined,
};

const emptyObject = {};

export default class RegionMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static adminLevelKeySelector = d => d.value;
    static adminLevelLabelSelector = d => d.label;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
            adminLevelPending: {},
            error: false,
            adminLevels: [],
            geoJsons: {},
            geoJsonBounds: {},
        };
        this.geoJsonRequests = [];
    }

    componentDidMount() {
        this.create(this.props.regionId);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.regionId !== nextProps.regionId) {
            this.create(nextProps.regionId);
        }
    }

    componentWillUnmount() {
        this.geoJsonRequests.forEach(request => request.stop());
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
    }

    create = (regionId) => {
        this.geoJsonRequests.forEach(request => request.stop());

        if (!regionId) {
            this.setState({ pending: false, adminLevelPending: {} });
            return;
        }

        this.hasTriggeredOnce = false;
        this.setState({ pending: true, adminLevelPending: {} });

        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
        this.adminLevelsRequest = this.createAdminLevelsRequest(regionId);
        this.adminLevelsRequest.start();
    }

    createTriggerRequest = regionId => (
        new FgRestBuilder()
            .url(createUrlForGeoAreasLoadTrigger(regionId))
            .params(createParamsForGet)
            .success(() => {
                console.log(`Triggered geo areas loading task for ${regionId}`);
                if (this.adminLevelsRequest) {
                    this.adminLevelsRequest.stop();
                }
                this.adminLevelsRequest = this.createAdminLevelsRequest(regionId);
                this.adminLevelsRequest.start();
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'connectionFailureText'),
                });
            })
            .build()
    )

    createAdminLevelsRequest = regionId => (
        new FgRestBuilder()
            .url(createUrlForAdminLevelsForRegion(regionId))
            .params(createParamsForGet)
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => (
                this.hasTriggeredOnce &&
                response.results.reduce((acc, adminLevel) => (
                    adminLevel.staleGeoAreas || acc
                ), false)
            ))
            .success((response) => {
                const stale = response.results.reduce((acc, adminLevel) => (
                    adminLevel.staleGeoAreas || acc
                ), false);

                if (stale) {
                    this.hasTriggeredOnce = true;
                    if (this.triggerRequest) {
                        this.triggerRequest.stop();
                    }
                    this.triggerRequest = this.createTriggerRequest(regionId);
                    this.triggerRequest.start();
                } else {
                    this.setState({
                        pending: false,
                        adminLevelPending: {},
                        error: undefined,
                        selectedAdminLevelId: response.results.length > 0 ? `${response.results[0].id}` : '',
                        adminLevels: response.results,
                    }, this.loadGeoJsons);
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: _ts('components.regionMap', 'connectionFailureText'),
                });
            })
            .build()
    )

    handleAreaClick = (selection) => {
        if (!this.props.onChange) {
            return;
        }

        const selections = [...this.props.selections];
        const index = selections.indexOf(selection);

        if (index === -1) {
            selections.push(selection);
        } else {
            selections.splice(index, 1);
        }

        this.props.onChange(selections);
    }

    handleAdminLevelSelection = (id) => {
        this.setState({
            selectedAdminLevelId: id,
        }, this.loadGeoJsons);
    }

    // NOTE: Is onLocationsChange really necessary?
    // Assess in detail
    loadLocations = () => {
        const { adminLevels, geoJsons } = this.state;

        let locations = [];
        adminLevels.forEach((adminLevel) => {
            const geoJson = geoJsons[adminLevel.id];
            if (geoJson) {
                locations = [
                    ...locations,
                    ...geoJson.features.map(feature => ({
                        key: feature.properties.pk,
                        label: feature.properties.title,
                    })),
                ];
            }
        });

        if (this.props.onLocationsChange) {
            this.props.onLocationsChange(locations);
        }
    }

    loadGeoJsons = () => {
        // FIXME: use coordinator
        const {
            geoJsons: geoJsonsFromState,
            geoJsonBounds: geoJsonBoundsFromState,
            selectedAdminLevelId,
            adminLevelPending,
            adminLevels,
        } = this.state;

        const selectedAdminLevel = adminLevels.find(l => String(l.id) === selectedAdminLevelId)
            || emptyObject;

        if (!geoJsonsFromState[selectedAdminLevelId]) {
            const url = selectedAdminLevel.geojsonFile
                || createUrlForGeoJsonMap(selectedAdminLevelId);
            const params = selectedAdminLevel.geojsonFile ? undefined : createParamsForGet;
            const request = new FgRestBuilder()
                .url(url)
                .params(params)
                .preLoad(() => {
                    this.setState({
                        adminLevelPending: {
                            ...adminLevelPending,
                            [selectedAdminLevelId]: true,
                        },
                    });
                })
                .postLoad(() => {
                    this.setState({
                        adminLevelPending: {
                            ...adminLevelPending,
                            [selectedAdminLevelId]: false,
                        },
                    });
                })
                .success((response) => {
                    // FIXME: write schema
                    const geoJsons = {
                        [selectedAdminLevelId]: response,
                        ...geoJsonsFromState,
                    };
                    this.setState({ geoJsons }, this.loadLocations);
                })
                .failure((response) => {
                    console.log(response);
                })
                .fatal((response) => {
                    console.log(response);
                })
                .build();
            request.start();

            this.geoJsonRequests.push(request);
        }

        if (!geoJsonBoundsFromState[selectedAdminLevelId]) {
            const url = selectedAdminLevel.boundsFile
                || createUrlForGeoJsonBounds(selectedAdminLevelId);
            const params = selectedAdminLevel.boundsFile ? undefined : createParamsForGet;
            const request = new FgRestBuilder()
                .url(url)
                .params(params)
                .success((response) => {
                    // FIXME: write schema
                    const { bounds } = response;
                    const geoJsonBounds = {
                        [selectedAdminLevelId]: bounds && [[
                            bounds.minX,
                            bounds.minY,
                        ], [
                            bounds.maxX,
                            bounds.maxY,
                        ]],
                        ...geoJsonBoundsFromState,
                    };
                    this.setState({ geoJsonBounds });
                })
                .failure((response) => {
                    console.log(response);
                })
                .fatal((response) => {
                    console.log(response);
                })
                .build();
            request.start();

            this.geoJsonRequests.push(request);
        }
    }

    handleRefresh = () => {
        this.create(this.props.regionId);
    }

    renderContent = () => {
        const {
            error,
            adminLevels = [],
            selectedAdminLevelId,
            geoJsons,
            geoJsonBounds,
            adminLevelPending,
        } = this.state;

        if (error) {
            return (
                <Message>
                    { error }
                </Message>
            );
        }

        if (adminLevels.length === 0 || !selectedAdminLevelId) {
            return (
                <Message>
                    {_ts('components.regionMap', 'mapNotAvailable')}
                </Message>
            );
        }

        const adminLevel = adminLevels.find(al => al.id === +selectedAdminLevelId);
        const segmentButtonData = adminLevels.map(al => ({
            label: al.title,
            value: `${al.id}`,
        }));

        return (
            <div className={styles.mapContainer}>
                <Button
                    className={styles.refreshButton}
                    onClick={this.handleRefresh}
                    iconName="refresh"
                />
                <GeoJsonMap
                    selections={this.props.selections}
                    className={styles.geoJsonMap}
                    geoJson={geoJsons[selectedAdminLevelId]}
                    geoJsonBounds={geoJsonBounds[selectedAdminLevelId]}
                    onAreaClick={this.handleAreaClick}
                    thickness={adminLevels.length - adminLevel.level}
                    pending={adminLevelPending[selectedAdminLevelId]}
                />
                <div className={styles.bottomBar}>
                    <SegmentInput
                        name="admin-levels"
                        options={segmentButtonData}
                        value={selectedAdminLevelId}
                        onChange={this.handleAdminLevelSelection}
                        keySelector={RegionMap.adminLevelKeySelector}
                        labelSelector={RegionMap.adminLevelLabelSelector}
                        showLabel={false}
                        showHintAndError={false}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const { pending } = this.state;

        const className = `
            ${classNameFromProps}
            ${styles.regionMap}
        `;

        const Content = this.renderContent;

        return (
            <div className={className}>
                { pending ? <LoadingAnimation /> : <Content /> }
            </div>
        );
    }
}
