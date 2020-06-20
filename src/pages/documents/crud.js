import React, { Component } from 'react';
import { connect } from 'react-redux';
import { zFile, zHandlers } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
import request from 'constants/request.js';
import { OPERATIONS } from 'constants/strings.js';
import { isValidDocument } from 'constants/validations.js';

import DocumentForm from './form.js';

class DocumentCrud extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor() {
    super();
    this.state = {
      title: '',
      name: '',
      file: null,
      lastModified: null,

      isCreateOperation: true
    };
  }

  componentDidMount() {
    const { document, operation } = this.props;
    this.setState({
      ...document,
      isCreateOperation: operation === OPERATIONS.CREATE
    });
  }

  buildRequest = () => {
    const { title, name, file } = this.state;
    const { operation } = this.props;

    const document = {
      title: title.trim(),
      name,
      file
    };

    let data;

    if (operation === OPERATIONS.CREATE) {
      data = JSON.stringify(document);
    } else {
      data = JSON.stringify({
        document,
        changed: zFile.checkBase64(file)
        // TODO: Repeat this for all changed
        // TODO: Change "changed" to "hasChanged"
      });
    }

    return data;
  };

  /** Submit document to server */
  submitDocument = () => {
    if (!isValidDocument(this.state)) return;
    const data = this.buildRequest();

    request({
      url: `/api/v1/documents`,
      method: 'POST',
      body: data,
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully added the ${this.state.title} document.`
        });
        location.href = '/admin/documents';
      }
    });
  };

  /** Update document on server */
  updateDocument = () => {
    if (!isValidDocument(this.state)) return;
    const data = this.buildRequest();

    request({
      url: `/api/v1/documents/${this.props.document.id}`,
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully updated the ${this.state.title}.`
        });
        location.href = '/admin/documents';
      }
    });
  };

  render() {
    const { title, operation } = this.props;
    const { isCreateOperation } = this.state;

    return (
      <DocumentForm
        heading={title}
        document={this.state}
        handlers={zHandlers(this)}
        confirmText={isCreateOperation ? 'Submit' : 'Update'}
        confirmFunc={
          isCreateOperation ? this.submitDocument : this.updateDocument
        }
        cancelFunc={() => (location.href = '/admin/documents')}
        operation={operation}
        metaTitle={title}
        metaUrl={`/${operation}`}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(DocumentCrud);
