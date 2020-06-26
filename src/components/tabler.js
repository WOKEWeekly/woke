import React, { memo, useState, useEffect } from 'react';

import { Icon } from 'components/icon.js';
import { Default, Mobile } from 'components/layout.js';
import { Empty, Loader } from 'components/loader.js';
import { Fader } from 'components/transitioner';
import css from 'styles/components/Tabler.module.scss';

const Tabler = ({
  columns,
  items,
  emptyMessage,
  distribution,
  itemsLoaded
}) => {
  const gridDistribution = { gridTemplateColumns: distribution };

  const HeaderRow = () => {
    return (
      <div className={css['tabler-header-row']} style={gridDistribution}>
        {columns.map((name, key) => {
          return <span key={key}>{name}</span>;
        })}
      </div>
    );
  };

  const ItemRows = () => {
    return items.map((fields, itemKey) => {
      return (
        <Fader
          key={itemKey}
          determinant={itemsLoaded}
          duration={500 + itemKey * 100}
          className={css['tabler-item-row']}
          postTransitions={'background-color .1s ease'}
          style={gridDistribution}>
          <Item fields={fields} />
        </Fader>
      );
    });
  };

  if (!itemsLoaded) {
    return <Loader />;
  } else if (!items.length) {
    return <Empty message={emptyMessage} />;
  }

  return (
    <div className={css['tabler-container']}>
      <Default>
        <div className={css['tabler-grid']}>
          <HeaderRow />
          <ItemRows />
        </div>
      </Default>
      <Mobile>
        <div className={css['tabler-list']}>
          <ItemRows />
        </div>
      </Mobile>
    </div>
  );
};

const Item = memo(({ fields }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  if (!isLoaded) return null;

  return fields.map((field, fieldKey) => {
    const [value, { icon, type, hideOnMobile = false } = {}] = field;

    // Configure what shows on mobile
    const MobileView = () => {
      if (hideOnMobile || type === 'button') return null;

      if (type === 'image') {
        return value;
      } else if (type === 'index') {
        return (
          <div className={css['tabler-item-index']} key={fieldKey}>
            {value}
          </div>
        );
      } else {
        return (
          <div className={css['tabler-field-mobile']} key={fieldKey}>
            <span>
              <Icon name={icon} />
            </span>
            <span>{value}</span>
          </div>
        );
      }
    };

    return (
      <React.Fragment key={fieldKey}>
        <Default>
          <span>{value}</span>
        </Default>
        <Mobile>
          <MobileView />
          <CrudButtons fields={fields} />
        </Mobile>
      </React.Fragment>
    );
  });
});

/** Get link, edit and delete buttons */
const CrudButtons = memo(({ fields }) => {
  const buttons = fields
    .map(([value, options]) => {
      if (options.type === 'button') {
        return value;
      }
    })
    .filter((e) => e);
  return (
    <div className={css['tabler-item-buttons']}>
      {buttons.map((value) => value)}
    </div>
  );
});

export default Tabler;
