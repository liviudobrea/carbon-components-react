/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import cx from 'classnames';
import Downshift from 'downshift';
import PropTypes from 'prop-types';
import React from 'react';
import { settings } from 'carbon-components';
import ListBox, { PropTypes as ListBoxPropTypes } from '../ListBox';

const { prefix } = settings;

const defaultItemToString = item => {
  if (typeof item === 'string') {
    return item;
  }

  return item ? item.label : '';
};

export default class DropdownV2 extends React.Component {
  static propTypes = {
    /**
     * Disable the control
     */
    disabled: PropTypes.bool,

    /**
     * We try to stay as generic as possible here to allow individuals to pass
     * in a collection of whatever kind of data structure they prefer
     */
    items: PropTypes.array.isRequired,

    /**
     * Allow users to pass in an arbitrary item or a string (in case their items are an array of strings)
     * from their collection that are pre-selected
     */
    initialSelectedItem: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),

    /**
     * Helper function passed to downshift that allows the library to render a
     * given item to a string label. By default, it extracts the `label` field
     * from a given item to serve as the item label in the list.
     */
    itemToString: PropTypes.func,

    /**
     * Function to render items as custom components instead of strings.
     * Defaults to null and is overriden by a getter
     */
    itemToElement: PropTypes.func,

    /**
     * `onChange` is a utility for this controlled component to communicate to a
     * consuming component what kind of internal state changes are occuring.
     */
    onChange: PropTypes.func,

    /**
     * Generic `label` that will be used as the textual representation of what
     * this field is for
     */
    label: PropTypes.node.isRequired,

    /**
     * 'aria-label' of the ListBox component.
     */
    ariaLabel: PropTypes.string,

    /**
     * The dropdown type, `default` or `inline`
     */
    type: ListBoxPropTypes.ListBoxType,

    /**
     * In the case you want to control the dropdown selection entirely.
     */
    selectedItem: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

    /**
     * `true` to use the light version.
     */
    light: PropTypes.bool,

    /**
     * Controls the open state of the dropdown
     */
    open: PropTypes.bool,

    /**
     * Provide the title text that will be read by a screen reader when
     * visiting this control
     */
    titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

    /**
     * Provide helper text that is used alongside the control label for
     * additional help
     */
    helperText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  };

  static defaultProps = {
    disabled: false,
    type: 'default',
    itemToString: defaultItemToString,
    itemToElement: null,
    open: false,
    light: false,
    titleText: '',
    helperText: '',
  };

  state = { isOpen: this.props.open };

  handleOnChange = changes => {
    if (this.props.onChange) {
      this.props.onChange(changes);
    }
  };

  handleOnOuterClick = () => {
    const isOpen = false;
    this.setState({ isOpen }, () => this.handleOnChange({ isOpen }));
  };

  handleOnStateChange = changes => {
    const { type } = changes;
    switch (type) {
      case Downshift.stateChangeTypes.clickItem:
      case Downshift.stateChangeTypes.keyDownEscape:
      case Downshift.stateChangeTypes.mouseUp:
        this.setState({ isOpen: false }, () => this.handleOnChange(changes));
        break;
      // Opt-in to some cases where we should be toggling the menu based on
      // a given key press or mouse handler
      // Reference: https://github.com/paypal/downshift/issues/206
      case Downshift.stateChangeTypes.clickButton:
      case Downshift.stateChangeTypes.keyDownSpaceButton:
        if (Reflect.has(changes, 'isOpen')) {
          this.setState({ isOpen: changes.isOpen },
            () => this.handleOnChange(changes)
          );
        }
        break;
    }
  };

  handleOnToggleMenu = (isOpen) => {
    this.setState({ isOpen }, () => this.handleOnChange({ isOpen }));
  };

  render() {
    const {
      className: containerClassName,
      disabled,
      items,
      label,
      ariaLabel,
      itemToString,
      itemToElement,
      type,
      initialSelectedItem,
      selectedItem,
      light,
      id,
      titleText,
      helperText,
    } = this.props;
    const { isOpen } = this.state;
    const className = cx(`${prefix}--dropdown`, containerClassName, {
      [`${prefix}--dropdown--light`]: light,
    });
    const title = titleText ? (
      <label htmlFor={id} className={`${prefix}--label`}>
        {titleText}
      </label>
    ) : null;
    const helper = helperText ? (
      <div className={`${prefix}--form__helper-text`}>{helperText}</div>
    ) : null;

    // needs to be Capitalized for react to render it correctly
    const ItemToElement = itemToElement;
    const Dropdown = (
      <Downshift
        id={id}
        onStateChange={this.handleOnStateChange}
        onChange={this.handleOnChange}
        onOuterClick={this.handleOnOuterClick}
        itemToString={itemToString}
        isOpen={isOpen}
        defaultSelectedItem={initialSelectedItem}
        selectedItem={selectedItem}
        render={({
          isOpen,
          itemToString,
          selectedItem,
          highlightedIndex,
          getRootProps,
          getToggleButtonProps,
          getItemProps,
          getLabelProps,
        }) => (
          <ListBox
            type={type}
            className={className}
            disabled={disabled}
            ariaLabel={ariaLabel}
            {...getRootProps({ refKey: 'innerRef' })}>
            <ListBox.Field {...getToggleButtonProps({ disabled })}>
              <span
                className={`${prefix}--list-box__label`}
                {...getLabelProps()}>
                {selectedItem ? itemToString(selectedItem) : label}
              </span>
              <ListBox.MenuIcon isOpen={isOpen} />
            </ListBox.Field>
            {isOpen && (
              <ListBox.Menu>
                {items.map((item, index) => (
                  <ListBox.MenuItem
                    key={itemToString(item)}
                    {...getItemProps({
                      item,
                      index,
                      isActive: selectedItem === item,
                      isHighlighted: highlightedIndex === index || selectedItem === item
                    })}
                  >
                    {itemToElement ? (
                      <ItemToElement key={itemToString(item)} {...item} />
                    ) : (
                      itemToString(item)
                    )}
                  </ListBox.MenuItem>
                ))}
              </ListBox.Menu>
            )}
          </ListBox>
        )}
      />
    );
    return title || helper ? (
      <>
        {title}
        {helper}
        {Dropdown}
      </>
    ) : (
      Dropdown
    );
  }
}
