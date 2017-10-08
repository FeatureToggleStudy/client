import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Link, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import browserHistory from '../../../common/browserHistory';
import CountryDetail from '../components/CountryDetail';
import TextInput from '../../../public/components/TextInput';
import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import { PrimaryButton } from '../../../public/components/Button';
import {
    countriesSelector,
} from '../../../common/selectors/domainData';

const propTypes = {
    // NOTE: is Required removed by @frozenhelium
    location: PropTypes.shape({
        pathname: PropTypes.string.isReqired,
    }),
    countries: PropTypes.array, // eslint-disable-line
};

const defaultProps = {
    location: {},
    countries: [],
};

// TODO:
// Scroll to selected country

const mapStateToProps = state => ({
    countries: countriesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            displayCountryList: this.props.countries,
            searchInputValue: '',
        };
    }

    goToAddCountry = () => {
        browserHistory.push('/countrypanel/');
    };

    search = (value) => {
        const caseInsensitiveSubmatch = country => (
            country.fullName.toLowerCase().includes(value.toLowerCase())
        );
        const displayCountryList = this.props.countries.filter(caseInsensitiveSubmatch);

        this.setState({
            displayCountryList,
            searchInputValue: value,
        });
    };

    render() {
        const { pathname } = this.props.location;

        return (
            <div styleName="country-panel">
                <Helmet>
                    <title>{ pageTitles.countryPanel }</title>
                </Helmet>
                <div styleName="country-list">
                    <div styleName="list-header">
                        <div styleName="header-text">
                            Countires
                        </div>
                        <PrimaryButton onClick={this.goToAddCountry}>
                            + Add country
                        </PrimaryButton>
                        <TextInput
                            onChange={this.search}
                            placeholder="Search Country"
                            type="search"
                        />
                    </div>
                    <div styleName="list">
                        {
                            this.state.displayCountryList.map(item => (
                                <Link
                                    key={item.iso}
                                    styleName={pathname === `/countrypanel/${item.iso}/` ? 'list-item active' : 'list-item'}
                                    to={`/countrypanel/${item.iso}/`}
                                >
                                    {item.fullName}
                                </Link>
                            ))
                        }
                    </div>
                </div>
                <div styleName="country-details">
                    <Switch>
                        {
                            this.props.countries.map(item => (
                                <Route
                                    component={() => (
                                        <CountryDetail
                                            fullName={item.fullName}
                                            iso={item.iso}
                                        />
                                    )}
                                    key={item.iso}
                                    path={`/countrypanel/${item.iso}/`}
                                />
                            ))
                        }
                        <Route
                            component={() => (
                                <CountryDetail fullName="Add new country" />
                            )}
                            path="/countrypanel/"
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
