import React, { memo, useEffect, useState } from 'react';

import { Icon } from 'components/icon.js';
import { Default, Mobile } from 'components/layout.js';
import { Empty, Loader } from 'components/loader.js';
import { Fader } from 'components/transitioner';
import css from 'styles/components/Tabler.module.scss';

/**
 * A component for tabling entities.
 * @param {object} props - The component props.
 * @param {string} props.emptyMessage - The message shown when there are no rows.
 * @param {boolean} props.itemsLoaded - Indicates if items are loaded.
 * @returns {React.Component} - The component.
 */
const Tabler = (props) => {
  const { items, emptyMessage = '', itemsLoaded } = props;

  if (!itemsLoaded) {
    return <Loader />;
  } else if (!items.length) {
    return <Empty message={emptyMessage} />;
  }

  return (
    <div className={css['tabler-container']}>
      <Default>
        <div className={css['tabler-grid']}>
          <HeaderRow {...props} />
          <ItemRows {...props} />
        </div>
      </Default>
      <Mobile>
        <div className={css['tabler-list']}>
          <ItemRows {...props} />
        </div>
      </Mobile>
    </div>
  );
};

/**
 * The header row for the table.
 * @param {object} props - The component props.
 * @param {any[]} props.columns - The table column headings.
 * @param {string} props.distribution - The CSS grid-template-columns value.
 * @returns {React.Component} The component.
 */
const HeaderRow = ({ columns, distribution }) => {
  return (
    <div
      className={css['tabler-header-row']}
      style={{ gridTemplateColumns: distribution }}>
      {columns.map((name, key) => {
        return <span key={key}>{name}</span>;
      })}
    </div>
  );
};

/**
 * The items rows for the table.
 * @param {object} props - The component props.
 * @param {string} props.distribution - The CSS grid-template-columns value.
 * @param {object} props.items - The map of items for rows.
 * @returns {React.Component[]} The list of row components.
 */
const ItemRows = ({ distribution, items }) => {
  return items.map((fields, key) => {
    return (
      <Item
        fields={fields}
        distribution={{ gridTemplateColumns: distribution }}
        key={key}
        index={key}
      />
    );
  });
};

/**
 * Each row in the {@see Tabler} component.
 * @param {object} props - The component props.
 * @param {any[]} props.distribution - The CSS grid-template-columns value.
 * @param {any[]} props.fields - Each field in the row.
 * @param {any[]} props.index - The row's index.
 * @returns {React.Component} - The component.
 */
const Item = memo(({ fields, distribution, index }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);

  return (
    <Fader
      key={index}
      determinant={isLoaded}
      duration={500 + index * 100}
      delay={index * 30}
      className={css['tabler-item-row']}
      postTransitions={'background-color .1s ease'}
      style={distribution}>
      {fields
        .filter((e) => e)
        .map((field, key) => {
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
        })}
    </Fader>
  );
});

/**
 * The mobile view for each {@see Item}.
 * @param {object} props - The component props.
 * @param {any[]} props.field - Each field in the row.
 * @returns {React.Component} - The component.
 */
const MobileView = ({ field }) => {
  const [
    value,
    { icon, type, hideIfEmpty = false, hideOnMobile = false } = {}
  ] = field;
  if (!value && hideIfEmpty) return null;
  if (hideOnMobile || type === 'button') return null;

  if (type === 'image') {
    return value;
  } else if (type === 'index') {
    return <div className={css['tabler-item-index']}>{value}</div>;
  } else {
    return (
      <div className={css['tabler-field-mobile']}>
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
    .filter((e) => e)
    .map(([value, options]) => {
      if (options.type === 'button') {
        return value;
      }
    })
    .filter((e) => e);
  return buttons.map((value, key) => {
    <div className={css['tabler-item-buttons']} key={key}>
      {value}
    </div>;
  });
});

export default Tabler;
