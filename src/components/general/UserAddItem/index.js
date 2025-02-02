import React from 'react';
import PropTypes from 'prop-types';

import DisplayPicture from '#components/viewer/DisplayPicture';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    pending: PropTypes.bool,
    displayPicture: PropTypes.number,
    actionButtonTitle: PropTypes.string,
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    onAddButtonClick: PropTypes.func,
    userId: PropTypes.number,
};

const defaultProps = {
    className: undefined,
    actionButtonTitle: '',
    displayPicture: undefined,
    username: '',
    firstName: '',
    lastName: '',
    pending: false,
    userId: undefined,
    onAddButtonClick: undefined,
};

export default class UserAddItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleAddButtonClick = () => {
        const {
            userId,
            onAddButtonClick,
        } = this.props;

        if (onAddButtonClick) {
            onAddButtonClick(userId);
        }
    }

    render() {
        const {
            className,
            pending,
            actionButtonTitle,
            displayPicture,
            username,
            firstName,
            lastName,
        } = this.props;

        return (
            <div className={_cs(className, styles.user)}>
                <div className={styles.top}>
                    <DisplayPicture
                        className={styles.picture}
                        galleryId={displayPicture}
                    />
                    <div className={styles.name}>
                        <div className={styles.text}>
                            {`${firstName} ${lastName}`}
                        </div>
                        <div>
                            { username }
                        </div>
                    </div>
                </div>
                <div className={_cs(styles.actionButtons, pending && styles.pending)}>
                    <PrimaryButton
                        onClick={this.handleAddButtonClick}
                        iconName="add"
                        title={actionButtonTitle}
                        pending={pending}
                    />
                </div>
            </div>
        );
    }
}
