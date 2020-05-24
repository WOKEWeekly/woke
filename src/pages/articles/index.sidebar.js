import React, { useState, useEffect } from 'react';
import { Col } from 'react-bootstrap';

import css from '@styles/pages/Articles.module.scss';

// TODO: Complete
const MainArticleSidebar = () => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  return (
    <Col md={4} className={css.mainArticleSidebar}>
      
    </Col>
  );
};

export default MainArticleSidebar;