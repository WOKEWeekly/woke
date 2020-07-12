import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { setAlert } from 'components/alert.js';
import { SubmitButton, CancelButton } from 'components/button.js';
import { Heading, Group, LabelInfo, LongTextArea } from 'components/form';
import { Shader, Spacer } from 'components/layout.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Information.module.scss';

class EditPage extends Component {
  /** Retrieve informaiton from server */
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(props) {
    super(props);
    const path = location.pathname;
    this.state = {
      isLoaded: false,
      backPath: path.substring(0, path.indexOf('/', 1)),
      pageText: props.pageText
    };

    if (props.user.clearance < CLEARANCES.ACTIONS.PAGES.MODIFY) {
      return (location.href = this.state.backPath);
    }
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  /** Update information */
  updateInfo = () => {
    const { user, title, pageName } = this.props;
    const { pageText, backPath } = this.state;

    request({
      url: '/api/v1/pages',
      method: 'PUT',
      body: JSON.stringify({ page: pageName, text: pageText }),
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully updated the '${title.substring(5)}'.`
        });
        location.href = backPath;
      }
    });
  };

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { isLoaded, pageText, backPath } = this.state;
    const { title, placeholderText } = this.props;

    if (!isLoaded) return null;

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{title}</Heading>

            <Group>
              <Col>
                <LabelInfo>Description:</LabelInfo>
                <LongTextArea
                  name={'pageText'}
                  value={pageText}
                  onChange={this.handleText}
                  placeholder={placeholderText}
                />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={this.updateInfo} className={'mr-2'}>
                  Update
                </SubmitButton>
                <CancelButton onClick={() => (location.href = backPath)}>
                  Cancel
                </CancelButton>
              </Col>
            </Group>
          </div>
        </Spacer>
      </Shader>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(EditPage);
