import React, { useState, useEffect } from 'react';
import { Dropdown, Nav, Navbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setAlert, checkAlert } from 'components/alert.js';
import { Icon, HeaderIcon } from 'components/icon';
import { CloudinaryImage } from 'components/image';
import { Default, Mobile, zIndices } from 'components/layout';
import { useModal } from 'components/modal';
import CLEARANCES from 'constants/clearances.js';
import { accounts, cloudinary } from 'constants/settings.js';
import Login from 'pages/_auth/login';
import { clearUser } from 'reducers/actions';
import css from 'styles/partials/Header.module.scss';

/** The list of options in the account menu. */
const accountMenuOptions = [
  ['Admin Console', '/admin', 8],
  ['Your Account', '/account'],
  ['Team Members', '/admin/members', CLEARANCES.ACTIONS.MEMBERS.VIEW],
  ['Registered Users', '/admin/users', CLEARANCES.ACTIONS.USERS.VIEW],
  ['Subscribers', '/admin/subscribers', CLEARANCES.ACTIONS.SUBSCRIBERS.VIEW],
  ['Documents', '/admin/documents', CLEARANCES.ACTIONS.DOCUMENTS.VIEW]
];

/** The social media hyperlinks in the prenav bar. */
const socialButtons = [
  ['facebook-f', accounts.facebook],
  ['twitter', accounts.twitter],
  ['instagram', accounts.instagram],
  ['linkedin-in', accounts.linkedin],
  ['youtube', accounts.youtube]
];

/** The site navigation links on the main nav bar. */
const navigationLinks = [
  ['About Us', '/about'],
  ['Sessions', '/sessions'],
  ['Blog', '/blog'],
  ['Reviews', '/reviews'],
  ['The Team', '/team'],
  ['#BlackExcellence', '/blackexcellence'],
  ['Topic Bank', '/topics', CLEARANCES.ACTIONS.TOPICS.VIEW]
];

/**
 * The bar above the navigation bar.
 * @param {object} props - The component props.
 * @param {object} props.user - The current user.
 * @param {string} props.theme - The page theme.
 * @param {Function} props.clearUser - The reducer called after user logs out.
 * @returns {React.Component} The component.
 */
const PreNavbar = ({ user, theme, clearUser }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [loginModalVisible, setLoginModalVisibility] = useModal(false);

  useEffect(() => {
    checkAlert();
    setLoaded(true);
  }, [isLoaded]);

  if (!isLoaded) return null;

  /** Log out, de-authenticating the user */
  const logOut = () => {
    clearUser();
    setAlert({ type: 'info', message: 'You have successfully logged out.' });
    setTimeout(() => location.reload(), 500);
  };

  const AccountBlock = () => {
    const { firstname, lastname, clearance, fullname, isAuthenticated } = user;

    if (isAuthenticated) {
      return (
        <div className={css['prenav-authorized']}>
          <Dropdown style={{ zIndex: zIndices.accountMenu }} alignRight>
            <Dropdown.Toggle variant={'dark'}>
              <Icon name={'user'} />
              <Default>{fullname}</Default>
              <Mobile>
                {firstname} {lastname.substring(0, 1)}.
              </Mobile>
            </Dropdown.Toggle>
            <Dropdown.Menu className={css['prenav-dropdown-menu']}>
              {accountMenuOptions.map(([title, href, requisite], key) => {
                if (requisite && clearance < requisite) return null;
                return (
                  <Dropdown.Item
                    className={css['prenav-dropdown-item']}
                    onClick={() => (location.href = href)}
                    key={key}>
                    {title}
                  </Dropdown.Item>
                );
              })}
              <Dropdown.Item
                className={css['prenav-dropdown-item']}
                onClick={logOut}>
                Log Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    } else {
      return (
        <div className={css[`prenav-unauthorized-${theme}`]}>
          <button
            className={css['prenav-account-button']}
            onClick={() => setLoginModalVisibility(true)}>
            Login
          </button>
          <a className={css['prenav-account-divider']}>|</a>
          <button
            className={css['prenav-account-button']}
            onClick={() => (location.href = '/signup')}>
            Sign Up
          </button>
        </div>
      );
    }
  };

  return (
    <>
      <div className={css['prenav']}>
        <div>
          {socialButtons.map(([icon, href], key) => (
            <HeaderIcon icon={icon} href={href} key={key} />
          ))}
        </div>

        <AccountBlock />
      </div>
      <Login
        visible={loginModalVisible}
        close={() => setLoginModalVisibility(false)}
      />
    </>
  );
};

/**
 * The main navigation bar.
 * @param {object} props - The component props.
 * @param {object} props.user - The current user.
 * @param {string} props.theme - The page theme.
 * @returns {React.Component} The component.
 */
const MainNavbar = ({ user, theme }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [navImageSrc, setNavImageSource] = useState('');

  useEffect(() => {
    setLoaded(true);
    setNavImageSource(`${cloudinary.url}/public/bg/nav-bg-${theme}.jpg`);
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <Navbar
      className={css[`nav-${theme}`]}
      variant={'dark'}
      expand={'lg'}
      sticky={'top'}
      style={{ backgroundImage: `url(${navImageSrc})` }}>
      <Navbar.Brand className={css['nav-brand']} href="/">
        <CloudinaryImage
          src={`public/logos/wokeweekly-logo.png`}
          alt={'#WOKEWeekly Logo'}
          className={css['nav-brand-image']}
        />
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className={'ml-auto'}>
          {navigationLinks.map(([title, href, requisite], key) => {
            if (requisite && user.clearance < requisite) return null;
            return (
              <Nav.Link href={href} className={css[`${theme}-links`]} key={key}>
                {title}
              </Nav.Link>
            );
          })}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

const mapStateToProps = ({ theme, user }) => ({
  theme,
  user
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearUser
    },
    dispatch
  );

const Header = () => {
  const PreNav = connect(mapStateToProps, mapDispatchToProps)(PreNavbar);
  const MainNav = connect(mapStateToProps, mapDispatchToProps)(MainNavbar);

  return (
    <>
      <PreNav />
      <MainNav />
    </>
  );
};

export default Header;
