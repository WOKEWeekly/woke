import React, { memo, useState, useEffect } from 'react';

import { Icon } from 'components/icon.js';
import { Default, Mobile } from 'components/layout.js';
import { Empty, Loader } from 'components/loader.js';
import { Fader } from 'components/transitioner';
import css from 'styles/components/Tabler.module.scss';

/**
 * A component for tabling entities.
 * @param {object} props  - The component props.
 * @param {any[]} props.columns - The table column headings.
 * @param {object} props.items - The map of items for rows.
 * @param {string} props.emptyMessage - The message shown when there are no rows.
 * @param {string} props.distribution - The CSS grid-template-columns value.
 * @param {boolean} props.itemsLoaded - Indicates if items are loaded.
 * @returns {React.Component} - The component.
 */
const Tabler = ({
  columns,
  items,
  emptyMessage = '',
  distribution,
  itemsLoaded
}) => {
  const gridDistribution = { gridTemplateColumns: distribution };

  /**
   * The header row for the table.
   * @returns {React.Component} The component.
   */
  const HeaderRow = () => {
    return (
      <div className={css['tabler-header-row']} style={gridDistribution}>
        {columns.map((name, key) => {
          return <span key={key}>{name}</span>;
        })}
      </div>
    );
  };

  /**
   * The items rows for the table.
   * @returns {React.Component[]} The list of row components.
   */
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

/**
 * Each row in the {@see Tabler} component.
 * @param {object} props - The component props.
 * @param {any[]} props.fields - Each field in the row.
 * @returns {React.Component} - The component.
 */
const Item = memo(({ fields }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  if (!isLoaded) return null;

  return fields.map((field, key) => {
    const [value] = field;
    return (
      <React.Fragment key={key}>
        <Default>
          <span>{value}</span>
        </Default>
        <Mobile>
          <MobileView field={field} key={key} />
          <CrudButtons fields={fields} />
        </Mobile>
      </React.Fragment>
    );
  });
});

/**
 * The mobile view for each {@see Item}.
 * @param {object} props - The component props.
 * @param {any[]} props.field - Each field in the row.
 * @param {any[]} props.key - The key for each row.
 * @returns {React.Component} - The component.
 */
const MobileView = ({ field, key }) => {
  const [value, { icon, type, hideOnMobile = false } = {}] = field;
  if (hideOnMobile || type === 'button') return null;

  if (type === 'image') {
    return value;
  } else if (type === 'index') {
    return (
      <div className={css['tabler-item-index']} key={key}>
        {value}
      </div>
    );
  } else {
    return (
      <div className={css['tabler-field-mobile']} key={key}>
        <span>
          <Icon name={icon} />
        </span>
        <span>{value}</span>
      </div>
    );
  }
};

/**
 * The CRUD buttons for each {@see Item}.
 * @param {object} props - The component props.
 * @param {any[]} props.fields - All fields of the {@see Item}.
 * @returns {React.Component} - The component.
 */
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
