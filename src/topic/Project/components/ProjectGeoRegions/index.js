import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeoRegions extends React.PureComponent {
    render() {
        return (
            <div>
                Project Geo Regions
            </div>
        );
    }
}
