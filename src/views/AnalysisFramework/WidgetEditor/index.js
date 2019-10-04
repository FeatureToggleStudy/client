import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
// import produce from 'immer';

import { _cs } from '@togglecorp/fujs';
import Faram, { FaramGroup } from '@togglecorp/faram';

import Message from '#rscv/Message';
import WarningButton from '#rsca/Button/WarningButton';
import Icon from '#rscg/Icon';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import GridLayoutEditor from '#rscv/GridLayoutEditor';

import {
    updateAfViewWidgetLayoutAction,
    removeAfViewWidgetAction,
} from '#redux';
import { isDevelopment } from '#config/env';

import {
    fetchWidget,
    gridSize,
    VIEW,
    hasWidgetFrameworkComponent,
    fetchWidgetFrameworkComponent,
    shouldShowAltTagComponent,
} from '#widgets';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,

    updateWidgetLayout: PropTypes.func.isRequired,
    removeWidget: PropTypes.func.isRequired,

    widgetType: PropTypes.string.isRequired,
};

const defaultProps = {
    widgets: [],
};

const mapDispatchToProps = dispatch => ({
    removeWidget: params => dispatch(removeAfViewWidgetAction(params)),
    updateWidgetLayout: params => dispatch(updateAfViewWidgetLayoutAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class WidgetEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = widget => widget.key;

    static schema = {};
    static value = {};

    /*
    constructor(props) {
        super(props);

        this.state = {
            temporaryWidgetState: undefined,
        };
    }
    */

    /*
    getModifiedWidget = memoize((widget, temporaryWidgetState) => (
        produce(widget, (safeWidget) => {
            // eslint-disable-next-line no-param-reassign
            safeWidget.title = temporaryWidgetState.title;
            // eslint-disable-next-line no-param-reassign
            safeWidget.properties.data = temporaryWidgetState.data;
        })
    ))
    */

    getWidgets = memoize((widgets, widgetType) => (
        widgets.filter(
            w => hasWidgetFrameworkComponent(w.widgetId, widgetType, w.properties.addedFrom),
        )
    ))

    widgetMinSizeSelector = (widget) => {
        const { widgetType } = this.props;
        const { widgetId } = widget;
        const { minSize } = fetchWidget(widgetType, widgetId);
        return minSize;
    }

    /*
    handleItemCancel = () => {
        this.setState({ temporaryWidgetState: undefined });
    }
    */

    /*
    handleItemSave = (key, data, title) => {
        const {
            analysisFrameworkId,
            updateWidget,
        } = this.props;

        this.setState({ temporaryWidgetState: undefined });

        updateWidget({
            analysisFrameworkId,
            widgetKey: key,
            widgetData: data,
            widgetTitle: title,
        });
    }

    handleItemChange = (key, data, title) => {
        this.setState({
            temporaryWidgetState: {
                key,
                data,
                title,
            },
        });
    }
    */

    handleItemRemove = (widgetId) => {
        const {
            analysisFrameworkId,
            removeWidget,
        } = this.props;

        removeWidget({
            analysisFrameworkId,
            widgetId,
        });
    }

    handleWidgetLayoutChange = (key, layout) => {
        const {
            widgetType,
            updateWidgetLayout,
            analysisFrameworkId,
        } = this.props;

        updateWidgetLayout({
            analysisFrameworkId,
            widgetKey: key,
            widgetType,
            layout,
        });
    }

    layoutSelector = (widget) => {
        const { widgetType } = this.props;
        const {
            properties: {
                overviewGridLayout,
                listGridLayout,
            } = {},
        } = widget;

        return widgetType === VIEW.overview ? overviewGridLayout : listGridLayout;
    }

    renderWidgetHeader = (widget) => {
        const {
            title,
            widgetId,
            key,
            properties: { addedFrom },
        } = widget;
        const {
            widgetType,
            widgetsDisabled,
        } = this.props;

        const hideButtons = shouldShowAltTagComponent(widgetId, widgetType, addedFrom);

        const layout = this.layoutSelector(widget);
        const widthBlocks = Math.ceil(layout.width / gridSize.width);
        const heightBlocks = Math.ceil(layout.height / gridSize.height);

        const headingClassName = _cs(
            styles.heading,
            hideButtons && styles.disabled,
        );

        // const { editComponent: Widget } = fetchWidget(widgetType, widgetId);

        return (
            <div className={styles.header}>
                <h5
                    title={title}
                    className={headingClassName}
                >
                    {title}
                    {isDevelopment && `[${widthBlocks} ⨯ ${heightBlocks}]`}
                </h5>
                <div className={styles.actionButtons}>
                    {!hideButtons ? (
                        <Fragment>
                            <WarningButton
                                iconName="edit"
                                title={_ts('framework.widgetEditor', 'editTooltip')}
                                tabIndex="-1"
                                transparent
                                onClick={() => this.props.onWidgetEditClick(key, widget)}
                                disabled={widgetsDisabled}
                                // TODO: add onClick handler
                                /*
                                onClose={this.handleItemCancel}
                                modal={
                                    <Widget
                                        widgetKey={widget.key}
                                        title={widget.title}
                                        data={widget.properties.data}
                                        properties={widget.properties}
                                        onSave={this.handleItemSave}
                                        onChange={this.handleItemChange}
                                    />
                                }
                                */
                            />
                            <DangerConfirmButton
                                iconName="delete"
                                title={_ts('framework.widgetEditor', 'deleteTooltip')}
                                tabIndex="-1"
                                confirmationMessage={_ts('framework.widgetEditor', 'deleteConfirmDetail')}
                                transparent
                                onClick={() => this.handleItemRemove(key)}
                                disabled={widgetsDisabled}
                            />
                        </Fragment>
                    ) : (
                        <Icon
                            name="info"
                            className={styles.infoIcon}
                            title={_ts('framework.widgetEditor', 'infoTooltip', { addedFrom })}
                        />
                    )}
                </div>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            title,
            widgetId,
            id,
            properties: {
                addedFrom,
                listGridLayout: {
                    width = 0,
                    height = 0,
                } = {},
            },
            key,
        } = widget;

        const { widgetType } = this.props;

        const isDisabled = shouldShowAltTagComponent(widgetId, widgetType, addedFrom);

        const Widget = fetchWidgetFrameworkComponent(
            widgetId,
            widgetType,
            addedFrom,
        );

        const className = _cs(
            styles.content,
            isDisabled && styles.disabled,
        );

        /*
        const {
            temporaryWidgetState,
        } = this.state;

        const modifiedWidget = temporaryWidgetState && key === temporaryWidgetState.key
            ? this.getModifiedWidget(widget, temporaryWidgetState)
            : widget;
        */

        return (
            <div className={className}>
                <FaramGroup faramElementName={String(id)}>
                    <FaramGroup faramElementName="data">
                        <Widget
                            widgetName={widgetId}
                            widgetType={widgetType}
                            // widget={modifiedWidget}
                            widget={widget}

                            entryType="excerpt"
                            excerpt=""
                            image={undefined}

                            disabled
                        />
                    </FaramGroup>
                </FaramGroup>
                { isDisabled && ( // FIXME: use Message component?
                    <Message className={styles.disablerMask}>
                        {_ts('framework.widgetEditor', 'disablerMastText', { title })}
                    </Message>
                )}
            </div>
        );
    }

    render() {
        const {
            widgets,
            widgetType,
        } = this.props;

        const filteredWidgets = this.getWidgets(widgets, widgetType);

        return (
            <Faram
                className={styles.widgetEditorFaram}
                schema={WidgetEditor.schema}
                value={WidgetEditor.value}
                disabled
            >
                <GridLayoutEditor
                    className={styles.gridLayoutEditor}
                    gridSize={gridSize}
                    data={filteredWidgets}
                    layoutSelector={this.layoutSelector}
                    itemMinSizeSelector={this.widgetMinSizeSelector}
                    itemHeaderModifier={this.renderWidgetHeader}
                    itemContentModifier={this.renderWidgetContent}
                    keySelector={WidgetEditor.keySelector}
                    itemClassName={styles.widget}
                    onLayoutChange={this.handleWidgetLayoutChange}
                    dragItemClassName={styles.heading}
                />
            </Faram>
        );
    }
}
