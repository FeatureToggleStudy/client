import React from 'react';
import PropTypes from 'prop-types';

import Conditional from '#widgetComponents/Conditional';

const propTypes = {
    widget: PropTypes.shape({
        properties: PropTypes.object,
    }).isRequired,
    widgetType: PropTypes.string.isRequired,
    entryType: PropTypes.string,
    excerpt: PropTypes.string,
    image: PropTypes.string,
    tabularField: PropTypes.number,
};

const defaultProps = {
    entryType: undefined,
    excerpt: undefined,
    image: undefined,
    tabularField: undefined,
};


export default class ConditionalWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <Conditional
                faramElementName="value"
                {...this.props}
            />
        );
    }
}
