import React from 'react';
import { storiesOf, action } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withKnobs, boolean, select, text } from '@storybook/addon-knobs';
import MultiSelectV2 from '../MultiSelectV2';

const items = [
  {
    id: 'item-1',
    text: 'Item 1',
  },
  {
    id: 'item-2',
    text: 'Item 2',
  },
  {
    id: 'item-3',
    text: 'Item 3',
  },
  {
    id: 'item-4',
    text: 'Item 4',
  },
  {
    id: 'item-5',
    text: 'Item 5',
  },
];

const defaultLabel = 'MultiSelect Label';
const defaultPlaceholder = 'Search';
const types = {
  default: 'Default (default)',
  inline: 'Inline (inline)',
};
const searchBoxTypes = {
  default: 'Default (default)',
  inner: 'Inner (inner)',
};
const props = () => ({
  filterable: boolean(
    'Filterable (`<MultiSelectV2.Filterable>` instead of `<MultiSelectV2>`)',
    false
  ),
  disabled: boolean('Disabled (disabled)', false),
  light: boolean('Light variant (light)', false),
  inlineSelectedItems: boolean(
    'Display selected values as labels (inlineSelectedItems)',
    false
  ),
  searchBoxType: select(
    'Search box type (Only for `<MultiSelectV2.Filterable>`) (searchBoxType)',
    searchBoxTypes,
    'default'
  ),
  type: select('UI type (type)', types, 'default'),
  toggleItemSelection: boolean(
    'Items Toggle (Adds another option for toggling all items at once)',
    false
  ),
  label: text('Label (label)', defaultLabel),
  invalid: boolean('Show form validation UI (invalid)', false),
  invalidText: text(
    'Form validation UI content (invalidText)',
    'Invalid Selection'
  ),
  placeholder: text(
    'Search input placeholder (Only for `<MultiSelectV2.Filterable>`)' +
      '(placeholder)',
    defaultPlaceholder
  ),
  onChange: action('onChange'),
});

storiesOf('MultiSelectV2', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    withInfo({
      text: `
        MultiSelect
      `,
    })(() => {
      const { filterable, ...multiSelectProps } = props();
      const ComponentToUse = !filterable
        ? MultiSelectV2
        : MultiSelectV2.Filterable;
      const placeholder = !filterable ? undefined : defaultPlaceholder;

      return (
        <div style={{ width: 300 }}>
          <ComponentToUse
            {...multiSelectProps}
            items={items}
            itemToString={item => (item ? item.text : '')}
            placeholder={placeholder}
          />
        </div>
      );
    })
  )
  .add(
    'with initial selected items',
    withInfo({
      text: `
        Provide a set of items to initially select in the control
      `,
    })(() => {
      const { filterable, ...multiSelectProps } = props();
      const ComponentToUse = !filterable
        ? MultiSelectV2
        : MultiSelectV2.Filterable;
      const placeholder = !filterable ? undefined : defaultPlaceholder;
      return (
        <div style={{ width: 300 }}>
          <ComponentToUse
            {...multiSelectProps}
            items={items}
            itemToString={item => (item ? item.text : '')}
            initialSelectedItems={[items[0], items[1]]}
            placeholder={placeholder}
          />
        </div>
      );
    })
  );
