import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { AddEntityButton } from 'components/button.js';
import { Icon } from 'components/icon.js';
import { Shader, Default, Mobile } from 'components/layout.js';
import { Loader, Empty } from 'components/loader.js';
import { ConfirmModal } from 'components/modal.js';
import { Title } from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import { Fader } from 'components/transitioner.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Documents.module.scss';

class Documents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
      isLoaded: false
    };

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_DOCUMENTS) {
      return (location.href = '/');
    }
  }

  /** Get documents on mount */
  componentDidMount() {
    this.getDocuments();
  }

  /** Retrieve all documents */
  getDocuments = () => {
    request({
      url: '/api/v1/documents',
      method: 'GET',
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: (documents) => {
        this.setState({
          documents: documents,
          isLoaded: true
        });
      }
    });
  };

  render() {
    const { isLoaded, documents } = this.state;

    const DocumentCollection = () => {
      if (!isLoaded) {
        return <Loader />;
      } else if (documents.length === 0) {
        return <Empty message={'No documents found.'} />;
      }

      const items = [];

      for (const [index, item] of documents.entries()) {
        items.push(
          <Document
            key={index}
            idx={index}
            item={item}
            getDocuments={this.getDocuments}
          />
        );
      }

      const DocumentTable = () => {
        const headerRow = (
          <div className={css.header}>
            <span>#</span>
            <span>Title</span>
            <span>Slug</span>
            <span>Last Modified</span>
            <span />
            <span />
            <span />
          </div>
        );

        return (
          <div className={css.grid}>
            {headerRow}
            {items}
          </div>
        );
      };

      const DocumentList = () => {
        return <div className={css.list}>{items}</div>;
      };

      return (
        <React.Fragment>
          <Title className={css.heading}>List of Documents</Title>
          <Default>
            <DocumentTable />
          </Default>
          <Mobile>
            <DocumentList />
          </Mobile>
        </React.Fragment>
      );
    };

    return (
      <React.Fragment>
        <Shader className={css.documentTabler}>
          <DocumentCollection />
        </Shader>

        <BottomToolbar>
          <AddEntityButton
            title={'Add Document'}
            onClick={() => (location.href = '/admin/documents/add')}
          />
        </BottomToolbar>
      </React.Fragment>
    );
  }
}

class IDocument extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...props.item,
      deleteVisible: false,
      isLoaded: false
    };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  /** Go to edit document */
  editDocument = (document) =>
    (location.href = `/admin/documents/edit/${document.id}`);

  /** Delete document */
  deleteDocument = () => {
    request({
      url: `/api/v1/documents/${this.state.id}`,
      method: 'DELETE',
      body: JSON.stringify(this.state),
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted the ${this.state.title}.`);
        this.closeDelete();
        this.props.getDocuments();
      }
    });
  };

  openDelete = () => this.setState({ deleteVisible: true });
  closeDelete = () => this.setState({ deleteVisible: false });

  render() {
    const { item, idx } = this.props;
    const { deleteVisible } = this.state;

    const LinkButton = () => (
      <button
        className={css.invisible_button}
        onClick={() => (location.href = `/docs/${item.name}`)}>
        <Icon name={'external-link-alt'} />
      </button>
    );

    return (
      <Fader
        key={idx}
        determinant={this.state.isLoaded}
        duration={500 + idx * 100}
        className={css.row}
        postTransitions={'background-color .1s ease'}>
        <Default>
          <span>{idx + 1}</span>
          <span>{item.title}</span>
          <span>{item.name}</span>
          <span>{zDate.formatDateTime(item.lastModified) || '-'}</span>
          <span>
            <LinkButton />
          </span>
          <span>
            <button
              className={css.invisible_button}
              onClick={() => this.editDocument(item)}>
              <Icon name={'edit'} />
            </button>
          </span>
          <span>
            <button className={css.invisible_button} onClick={this.openDelete}>
              <Icon name={'trash'} />
            </button>
          </span>
        </Default>
        <Mobile>
          <div>
            <span>
              <Icon name={'user'} />
            </span>
            <span className={css.name}>{item.title}</span>
          </div>
          <div>
            <span>
              <Icon name={'star'} />
            </span>
            <span>{item.name}</span>
          </div>
          <div>
            <span>
              <Icon name={'signature'} />
            </span>
            <span>{zDate.formatDateTime(item.lastModified)}</span>
          </div>
          <div className={css.index}>{idx + 1}</div>
          <div className={css.crud}>
            <LinkButton />
            <button
              className={css.invisible_button}
              onClick={() => this.editDocument(item)}>
              <Icon name={'edit'} />
            </button>
            <button className={css.invisible_button} onClick={this.openDelete}>
              <Icon name={'trash'} />
            </button>
          </div>
        </Mobile>

        <ConfirmModal
          visible={deleteVisible}
          message={`Are you sure you want to delete document: ${item.title}?`}
          confirmFunc={this.deleteDocument}
          confirmText={'Delete'}
          close={this.closeDelete}
        />
      </Fader>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  countries: state.countries
});

const Document = connect(mapStateToProps)(IDocument);
export default connect(mapStateToProps)(Documents);
