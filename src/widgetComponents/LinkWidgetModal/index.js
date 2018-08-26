import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import SelectInput from '#rsci/SelectInput';
import { TreeSelectionWithSelectors as TreeSelection } from '#rsci/TreeSelection';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import { FaramActionElement } from '#rscg/FaramElements';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { afViewAnalysisFrameworkWidgetsSelector } from '#redux';

import _ts from '#ts';

import {
    getSupportedWidgets,
    getOptionsForSelectedWidget,
} from './SupportedWidgets';

import styles from './styles.scss';

const propTypes = {
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onClick: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    widgets: afViewAnalysisFrameworkWidgetsSelector(state, props),
});

const getFlatItems = (params) => {
    const {
        data,
        items,
        itemValues,
        itemValue,
        treeKeySelector,
        treeLabelSelector,
        treeNodesSelector,
    } = params;

    if (!items || items.length === 0) {
        if (data) {
            return [{
                key: treeKeySelector(data),
                label: treeLabelSelector(data),
                selected: itemValue.selected,
            }];
        }
        return [];
    }

    return items.reduce((selections, d) => [
        ...selections,
        ...getFlatItems({
            data: d,
            items: treeNodesSelector && treeNodesSelector(d),
            itemValue: itemValues[treeKeySelector(d)],
            itemValues: itemValues[treeKeySelector(d)].nodes,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        }),
    ], []);
};

@FaramActionElement
@connect(mapStateToProps)
export default class LinkWidgetModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static widgetKeySelector = w => w.key;
    static widgetLabelSelector = w => w.title;

    static optionsKeySelector = w => w.key;
    static optionsLabelSelector = w => w.title;

    static getSelectedWidgetOption = (id, options) => (
        options.find(o => LinkWidgetModal.optionsKeySelector(o) === id)
    );

    static getWidgetData = (id, widgets) => {
        const widget = widgets.find(w => LinkWidgetModal.widgetKeySelector(w) === id);
        if (!widget) {
            return {};
        }
        return (widget.properties || {}).data;
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedWidget: '',
            selectedWidgetItem: '',
            itemValues: {},
        };
    }

    handleWidgetChange = (selectedWidget) => {
        this.selectedWidgetOptions = getOptionsForSelectedWidget(
            selectedWidget,
            this.filteredWidgets,
        );
        const selectedWidgetItem = LinkWidgetModal.optionsKeySelector(
            this.selectedWidgetOptions[0],
        );

        const selectedWidgetOption = LinkWidgetModal.getSelectedWidgetOption(
            selectedWidgetItem,
            this.selectedWidgetOptions,
        );

        const widgetData = LinkWidgetModal.getWidgetData(selectedWidget, this.filteredWidgets);

        const treeKeySelector = selectedWidgetOption && selectedWidgetOption.keySelector;
        const treeLabelSelector = selectedWidgetOption && selectedWidgetOption.labelSelector;
        const treeNodesSelector = selectedWidgetOption && selectedWidgetOption.nodesSelector;

        const items = selectedWidgetOption ? (selectedWidgetOption.items(widgetData)) : [];

        this.setState({
            items,
            itemValues: {},
            selectedWidget,
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
    }

    handleWidgetOptionChange = (selectedWidgetItem) => {
        const { selectedWidget } = this.state;
        const selectedWidgetOption = LinkWidgetModal.getSelectedWidgetOption(
            selectedWidgetItem,
            this.selectedWidgetOptions,
        );

        const widgetData = LinkWidgetModal.getWidgetData(selectedWidget, this.filteredWidgets);

        const items = selectedWidgetOption ? selectedWidgetOption.items(widgetData) : [];
        const treeKeySelector = selectedWidgetOption && selectedWidgetOption.keySelector;
        const treeLabelSelector = selectedWidgetOption && selectedWidgetOption.labelSelector;
        const treeNodesSelector = selectedWidgetOption && selectedWidgetOption.nodesSelector;

        this.setState({
            items,
            itemValues: {},
            selectedWidgetItem,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
    }

    handleItemValuesChange = (itemValues) => {
        this.setState({ itemValues });
    }

    handleSaveClick = () => {
        const {
            itemValues,
            items,
            selectedWidget,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        } = this.state;

        const flatItems = getFlatItems({
            items,
            itemValues,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
        });
        const filteredItems = flatItems
            .filter(item => item.selected)
            .map(item => ({
                ...item,
                originalWidget: selectedWidget,
                originalKey: item.key,
            }));

        if (this.props.onClick) {
            this.props.onClick(filteredItems);
        }
    }

    render() {
        const {
            onClose,
            widgets,
            widgetKey,
        } = this.props;

        const {
            items,
            itemValues,
            treeKeySelector,
            treeLabelSelector,
            treeNodesSelector,
            selectedWidget,
            selectedWidgetItem,
        } = this.state;

        this.filteredWidgets = getSupportedWidgets(widgets, widgetKey);
        this.selectedWidgetOptions = getOptionsForSelectedWidget(
            selectedWidget,
            this.filteredWidgets,
        );

        const modalTitle = _ts('widgets.editor.link', 'modalTitle');
        const widgetSelectionLabel = _ts('widgets.editor.link', 'widgetSelectionLabel');
        const optionsTypeSelectionLabel = _ts('widgets.editor.link', 'optionsTypeSelectionLabel');
        const listOfItemsHeader = _ts('widgets.editor.link', 'listOfItemsHeader');
        const saveButtonLabel = _ts('widgets.editor.link', 'saveButtonLabel');
        const cancelButtonLabel = _ts('widgets.editor.link', 'cancelButtonLabel');

        return (
            <Modal className={styles.modal} >
                <ModalHeader title={modalTitle} />
                <ModalBody className={styles.modalBody} >
                    <div className={styles.selectionBar} >
                        <SelectInput
                            className={styles.selectInput}
                            label={widgetSelectionLabel}
                            options={this.filteredWidgets}
                            keySelector={LinkWidgetModal.widgetKeySelector}
                            labelSelector={LinkWidgetModal.widgetLabelSelector}
                            onChange={this.handleWidgetChange}
                            value={selectedWidget}
                            showHintAndError={false}
                        />
                        <SelectInput
                            className={styles.selectInput}
                            label={optionsTypeSelectionLabel}
                            options={this.selectedWidgetOptions}
                            keySelector={LinkWidgetModal.optionsKeySelector}
                            labelSelector={LinkWidgetModal.optionsLabelSelector}
                            onChange={this.handleWidgetOptionChange}
                            value={selectedWidgetItem}
                            showHintAndError={false}
                        />
                    </div>
                    <div className={styles.selectionBox} >
                        <header className={styles.header}>
                            {listOfItemsHeader}
                        </header>
                        <TreeSelection
                            className={styles.tree}
                            data={items}
                            value={itemValues}
                            onChange={this.handleItemValuesChange}
                            labelSelector={treeLabelSelector}
                            keySelector={treeKeySelector}
                            nodesSelector={treeNodesSelector}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={onClose}>
                        {cancelButtonLabel}
                    </DangerButton>
                    <PrimaryButton onClick={this.handleSaveClick} >
                        {saveButtonLabel}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
