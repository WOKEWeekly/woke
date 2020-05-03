import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Heading, Group, Label, TextInput, FileSelector } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';

import css from '~/styles/pages/Documents.module.scss';

class DocumentForm extends Component {
  constructor(props){
    super(props);

    this.state = {
      authors: []
    }
    
    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_DOCUMENTS){
      return location.href = '/';
    }
  }

  render(){

    const { heading, confirmText, confirmFunc, cancelFunc, handlers, operation } = this.props;
    const { handleText, handleFile } = handlers;
    const { title, file } = this.props.document;
    
    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col>
                <Label>Title:</Label>
                <TextInput
                  name={'title'}
                  value={title}
                  onChange={handleText}
                  placeholder={"Enter the title."} />
              </Col>
            </Group>
            <Group>
              <Col>
                <FileSelector
                  image={file}
                  operation={operation}
                  onChange={e => handleFile(e, 'file')} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={confirmFunc} className={'mr-2'}>{confirmText}</SubmitButton>
                <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
              </Col>
            </Group>
          </div>
        </Spacer>
      </Shader>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(DocumentForm);