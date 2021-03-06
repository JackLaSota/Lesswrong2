import { Components, registerComponent, withCurrentUser, withList, withEdit } from 'meteor/vulcan:core';
import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { NavDropdown, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Users from 'meteor/vulcan:users';
import { withApollo } from 'react-apollo';
import Notifications from '../collections/notifications/collection.js'

class NotificationsMenu extends Component {

  renderNotificationsList() {

    const results = this.props.results;
    const currentUser = this.props.currentUser;
    const refetch = this.props.refetch;
    const loading = this.props.loading;
    const loadMore = this.props.loadMore;
    const totalCount = this.props.totalCount;
    // console.log(currentUser);
    // console.log(refetch);
    if (results && results.length) {
      return (
        <div>
          <LinkContainer to={{pathname: '/inbox', query: {select: "Notifications"}}}>
            <MenuItem> See all your notifications and messages </MenuItem>
          </LinkContainer>
          <MenuItem divider />
          {results.map(notification => <Components.NotificationsItem key={notification._id} currentUser={currentUser} notification={notification} />)}
          <MenuItem onClick={() => loadMore()}>Load More</MenuItem>
        </div>
      )
    } else if (loading) {
        return (<Components.Loading/>)
    } else {
        return (<MenuItem>No Results</MenuItem>)
    }
  }

  render() {
    const results = this.props.results;
    const currentUser = this.props.currentUser;
    const title = this.props.title;
    let unreadNotifications = [];
    if (results && results.length) {
      unreadNotifications = results.filter(this.isNotViewed);
    }

    if(!currentUser){
      return (<div></div>);
    } else {
      return (
        <NavDropdown id="notification-nav" onClick={() => this.viewNotifications(unreadNotifications)} title={title + ' (' + unreadNotifications.length + ')'}>
            {this.renderNotificationsList()}
        </NavDropdown>
      )
    }
  }


  isNotViewed(notification) {
    return (!notification.viewed);
  };

  viewNotifications(results) {
    if(results && results.length && this.props){
      let editMutation = this.props.editMutation;
      let set = {viewed: true};
      results.forEach(function(notification) {
        editMutation({documentId: notification._id, set: set, unset: {}});
      });
    }
  };

}

NotificationsMenu.propsTypes = {
  currentUser: React.PropTypes.object,
  client: React.PropTypes.object,
};

const withListOptions = {
  collection: Notifications,
  queryName: 'notificationsListQuery',
  fragmentName: 'notificationsNavFragment',
  limit: 5,
};

const withEditOptions = {
  collection: Notifications,
  fragmentName: 'notificationsNavFragment',
};


registerComponent('NotificationsMenu', NotificationsMenu, withList(withListOptions), withEdit(withEditOptions), withCurrentUser);
