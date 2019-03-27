import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import VirtualList from 'react-tiny-virtual-list';
import Downshift from 'downshift';
import Search from '../Search';
import ListBox from '../ListBox';
import Checkbox from '../Checkbox';
import Selection from '../../internal/Selection';
import { sortingPropTypes } from './MultiSelectV2PropTypes';
import { defaultItemToString } from './tools/itemToString';
import { defaultSortItems, defaultCompareItems } from './tools/sorting';
import { defaultFilterItems } from '../ComboBox/tools/filter';

export default class FilterableMultiSelectV2 extends PureComponent {
  static propTypes = {
    ...sortingPropTypes,

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
     * Descriptive label providing minimal information regarding the control
     */
    label: PropTypes.string,

    selectAllLabel: PropTypes.string,

    /**
     * Specifies the position of the search box
     */
    searchBoxType: PropTypes.oneOf(['default', 'inner']),

    /**
     * Allow users to pass in arbitrary items from their collection that are
     * pre-selected
     */
    initialSelectedItems: PropTypes.array,

    /**
     * Shows the selected values inline in the input
     */
    inlineSelectedItems: PropTypes.bool,

    /**
     * Helper function passed to downshift that allows the library to render a
     * given item to a string label. By default, it extracts the `label` field
     * from a given item to serve as the item label in the list.
     */
    itemToString: PropTypes.func,

    /**
     * Specify the locale of the control. Used for the default `compareItems`
     * used for sorting the list of items in the control.
     */
    locale: PropTypes.string,

    /**
     * `onChange` is a utility for this controlled component to communicate to a
     * consuming component what kind of internal state changes are occuring.
     */
    onChange: PropTypes.func,

    /**
     * Specify 'inline' to create an inline multi-select.
     */
    type: PropTypes.oneOf(['default', 'inline']),

    /**
     * Generic `placeholder` that will be used as the textual representation of
     * what this field is for
     */
    placeholder: PropTypes.string.isRequired,

    /**
     * Adds another option in the dropdown for toggling all values
     */
    toggleItemSelection: PropTypes.bool,

    /**
     * Controls the open state of the dropdown
     */
    open: PropTypes.bool,

    /**
     * `true` to use the light version.
     */
    light: PropTypes.bool,
  };

  static defaultProps = {
    compareItems: defaultCompareItems,
    sortItems: defaultSortItems,
    filterItems: defaultFilterItems,
    itemToString: defaultItemToString,
    disabled: false,
    open: false,
    light: false,
    inlineSelectedItems: false,
    initialSelectedItems: [],
    toggleItemSelection: false,
    locale: 'en',
    selectAllLabel: 'Select All',
    searchBoxType: 'default',
  };

  constructor(props) {
    super(props);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnOuterClick = this.handleOnOuterClick.bind(this);
    this.handleOnStateChange = this.handleOnStateChange.bind(this);
    this.clearInputValue = this.clearInputValue.bind(this);
    this.handleOnInputValueChange = this.handleOnInputValueChange.bind(this);
    this.state = {
      isOpen: props.open,
      inputValue: '',
    };
    this.downshiftRef = React.createRef();
  }

  handleOnChange = changes => {
    if (this.props.onChange) {
      this.props.onChange(changes);
    }
  };

  handleOnOuterClick = () => {
    this.setState({ isOpen: false }, () => {
      this.handleOnChange(this.state);
    });
  };

  handleOnStateChange = changes => {
    const { type } = changes;
    switch (type) {
      case Downshift.stateChangeTypes.changeInput:
        this.setState({ inputValue: changes.inputValue }, () => {
          this.handleOnChange(this.state);
        });
        break;
      case Downshift.stateChangeTypes.keyDownEscape:
      case Downshift.stateChangeTypes.mouseUp:
        this.setState({ isOpen: false }, () => {
          this.handleOnChange(this.state);
        });
        break;
      // Opt-in to some cases where we should be toggling the menu based on
      // a given key press or mouse handler
      // Reference: https://github.com/paypal/downshift/issues/206
      case Downshift.stateChangeTypes.clickButton:
      case Downshift.stateChangeTypes.keyDownSpaceButton:
        this.setState(
          () => {
            let nextIsOpen = changes.isOpen;
            if (changes.isOpen === false) {
              // If Downshift is trying to close the menu, but we know the input
              // is the active element in the document, then keep the menu open
              if (this.inputNode === document.activeElement) {
                nextIsOpen = true;
              }
            }
            return {
              isOpen: nextIsOpen,
            };
          },
          () => {
            this.handleOnChange(this.state);
          }
        );
        break;
    }
  };

  handleOnInputKeyDown = event => {
    event.stopPropagation();
  };

  handleOnInputValueChange = (inputValue, stateAndHelpers) => {
    if (stateAndHelpers.type && Downshift.stateChangeTypes.clickItem) return;
    this.setState(() => {
      if (Array.isArray(inputValue)) {
        return {
          inputValue: '',
        };
      }
      return {
        inputValue: inputValue || '',
      };
    });
  };

  clearInputValue = event => {
    event.stopPropagation();
    this.setState({ inputValue: '' });
    this.inputNode && this.inputNode.focus && this.inputNode.focus();
  };

  render() {
    const { isOpen, inputValue } = this.state;
    const {
      className: containerClassName,
      disabled,
      filterItems,
      inlineSelectedItems,
      searchBoxType,
      type,
      toggleItemSelection,
      items,
      itemToString,
      initialSelectedItems,
      id,
      locale,
      label,
      placeholder,
      selectAllLabel,
      sortItems,
      compareItems,
      light,
    } = this.props;
    const className = cx(
      'bx--multi-select',
      'bx--combo-box',
      containerClassName,
      {
        'bx--list-box--light': light,
      }
    );
    return (
      <Selection
        onChange={this.handleOnChange}
        initialSelectedItems={initialSelectedItems}
        render={({
          selectedItems,
          onItemChange,
          clearSelection,
          onToggleAll,
        }) => (
          <Downshift
            isOpen={isOpen}
            itemCount={toggleItemSelection ? items.length + 1 : items.length}
            inputValue={inputValue}
            itemToString={itemToString}
            onChange={onItemChange}
            onStateChange={this.handleOnStateChange}
            onOuterClick={this.handleOnOuterClick}
            onInputValueChange={this.handleOnInputValueChange}
            selectedItem={selectedItems}
            render={({
              getRootProps,
              getItemProps,
              getInputProps,
              getToggleButtonProps,
              isOpen,
              itemToString,
              highlightedIndex,
              inputValue,
              selectedItem,
            }) => {
              let showCount = selectedItem.length > 0;
              if (inlineSelectedItems && selectedItem.length === items.length) {
                showCount = false;
              }
              let sortedItems = items;
              if (isOpen) {
                sortedItems = sortItems(
                  filterItems(items, { itemToString, inputValue }),
                  {
                    selectedItems,
                    itemToString,
                    compareItems,
                    locale,
                  }
                );
              }
              return (
                <ListBox
                  className={className}
                  disabled={disabled}
                  type={type}
                  {...getRootProps({ refKey: 'innerRef' })}>
                  <ListBox.Field {...getToggleButtonProps({ disabled })}>
                    {showCount && (
                      <ListBox.Selection
                        clearSelection={clearSelection}
                        selectionCount={selectedItem.length}
                      />
                    )}
                    {searchBoxType === 'default' && (
                      <input
                        className="bx--text-input"
                        ref={el => (this.inputNode = el)}
                        {...getInputProps({
                          disabled,
                          id,
                          placeholder,
                          onKeyDown: this.handleOnInputKeyDown,
                        })}
                      />
                    )}
                    {inputValue &&
                      isOpen &&
                      searchBoxType === 'default' && (
                        <ListBox.Selection
                          clearSelection={this.clearInputValue}
                        />
                      )}
                    {searchBoxType === 'inner' &&
                      (inlineSelectedItems ? (
                        <div className="bx--list-box__selected-items">
                          {!selectedItem.length ||
                          selectedItems.length === items.length ? (
                            <span className="bx--list-box__label">{label}</span>
                          ) : (
                            sortItems(selectedItem, {
                              selectedItems,
                              itemToString,
                              compareItems,
                              locale,
                            }).map(item => (
                              <span
                                className="bx--list-box__label"
                                key={item.id}>
                                {itemToString(item)}
                              </span>
                            ))
                          )}
                        </div>
                      ) : (
                        <span className="bx--list-box__label">{label}</span>
                      ))}
                    <ListBox.MenuIcon isOpen={isOpen} />
                  </ListBox.Field>
                  {isOpen && (
                    <ListBox.Menu>
                      {searchBoxType === 'inner' && (
                        <ListBox.MenuItem isActive={false}>
                          <Search
                            small
                            {...getInputProps({
                              role: 'input',
                              tabIndex: 0,
                              labelText: placeholder,
                              placeHolderText: placeholder,
                              disabled,
                              id,
                              onKeyDown: this.handleOnInputKeyDown,
                            })}
                          />
                        </ListBox.MenuItem>
                      )}
                      {toggleItemSelection && (
                        <ListBox.MenuItem
                          {...getItemProps({
                            item: {
                              id: 'select-all',
                              label: selectAllLabel,
                            },
                            index: 0,
                            isActive: highlightedIndex === 0,
                            isHighlighted: highlightedIndex === 0,
                            onKeyDown: e => {
                              e.preventDefault();
                              if (e.which === 27) {
                                onToggleAll(items);
                              }
                            },
                            onClick: e => {
                              e.preventDefault();
                              onToggleAll(items);
                            },
                          })}>
                          <Checkbox
                            id="select-all"
                            name="select-all"
                            tabIndex={0}
                            checked={selectedItem.length === items.length}
                            readOnly={true}
                            labelText={selectAllLabel}
                          />
                        </ListBox.MenuItem>
                      )}
                      <VirtualList
                        width="100%"
                        height={Math.min(252, sortedItems.length * 42)}
                        itemCount={sortedItems.length}
                        itemSize={42}
                        renderItem={({ index, style }) => {
                          const item = sortedItems[index];
                          const itemIndex = toggleItemSelection
                            ? index + 1
                            : index;
                          const isChecked =
                            selectedItem
                              .map(selected => selected.id)
                              .indexOf(item.id) !== -1;
                          const itemProps = getItemProps({
                            item,
                            index: itemIndex,
                            style,
                            isActive: isChecked,
                            checked: isChecked,
                            isHighlighted: highlightedIndex === itemIndex,
                          });
                          const itemText = itemToString(item);
                          return (
                            <ListBox.MenuItem key={itemProps.id} {...itemProps}>
                              <Checkbox
                                id={itemProps.id}
                                name={itemText}
                                checked={isChecked}
                                readOnly={true}
                                tabIndex={0}
                                labelText={itemText}
                              />
                            </ListBox.MenuItem>
                          );
                        }}
                      />
                    </ListBox.Menu>
                  )}
                </ListBox>
              );
            }}
          />
        )}
      />
    );
  }
}
