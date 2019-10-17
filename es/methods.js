var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import _ from './utils';

export default (function (Base) {
  return function (_Base) {
    _inherits(_class, _Base);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'getResolvedState',
      value: function getResolvedState(props, state) {
        var resolvedState = _extends({}, _.compactObject(this.state), _.compactObject(this.props), _.compactObject(state), _.compactObject(props));
        return resolvedState;
      }
    }, {
      key: 'getDataModel',
      value: function getDataModel(newState, dataChanged) {
        var _this2 = this;

        var columns = newState.columns,
            _newState$pivotBy = newState.pivotBy,
            pivotBy = _newState$pivotBy === undefined ? [] : _newState$pivotBy,
            data = newState.data,
            resolveData = newState.resolveData,
            pivotIDKey = newState.pivotIDKey,
            pivotValKey = newState.pivotValKey,
            subRowsKey = newState.subRowsKey,
            aggregatedKey = newState.aggregatedKey,
            nestingLevelKey = newState.nestingLevelKey,
            originalKey = newState.originalKey,
            indexKey = newState.indexKey,
            groupedByPivotKey = newState.groupedByPivotKey,
            SubComponent = newState.SubComponent;

        // Determine Header Groups

        var hasHeaderGroups = false;
        columns.forEach(function (column) {
          if (column.columns) {
            hasHeaderGroups = true;
          }
        });

        var columnsWithExpander = [].concat(_toConsumableArray(columns));

        var expanderColumn = columns.find(function (col) {
          return col.expander || col.columns && col.columns.some(function (col2) {
            return col2.expander;
          });
        });
        // The actual expander might be in the columns field of a group column
        if (expanderColumn && !expanderColumn.expander) {
          expanderColumn = expanderColumn.columns.find(function (col) {
            return col.expander;
          });
        }

        // If we have SubComponent's we need to make sure we have an expander column
        if (SubComponent && !expanderColumn) {
          expanderColumn = { expander: true };
          columnsWithExpander = [expanderColumn].concat(_toConsumableArray(columnsWithExpander));
        }

        var makeDecoratedColumn = function makeDecoratedColumn(column, parentColumn) {
          var dcol = void 0;
          if (column.expander) {
            dcol = _extends({}, _this2.props.column, _this2.props.expanderDefaults, column);
          } else {
            dcol = _extends({}, _this2.props.column, column);
          }

          // Ensure minWidth is not greater than maxWidth if set
          if (dcol.maxWidth < dcol.minWidth) {
            dcol.minWidth = dcol.maxWidth;
          }

          if (parentColumn) {
            dcol.parentColumn = parentColumn;
          }

          // First check for string accessor
          if (typeof dcol.accessor === 'string') {
            dcol.id = dcol.id || dcol.accessor;
            var accessorString = dcol.accessor;
            dcol.accessor = function (row) {
              return _.get(row, accessorString);
            };
            return dcol;
          }

          // Fall back to functional accessor (but require an ID)
          if (dcol.accessor && !dcol.id) {
            console.warn(dcol);
            throw new Error('A column id is required if using a non-string accessor for column above.');
          }

          // Fall back to an undefined accessor
          if (!dcol.accessor) {
            dcol.accessor = function () {
              return undefined;
            };
          }

          return dcol;
        };

        var allDecoratedColumns = [];

        // Decorate the columns
        var decorateAndAddToAll = function decorateAndAddToAll(column, parentColumn) {
          var decoratedColumn = makeDecoratedColumn(column, parentColumn);
          allDecoratedColumns.push(decoratedColumn);
          return decoratedColumn;
        };

        var decoratedColumns = columnsWithExpander.map(function (column) {
          if (column.columns) {
            return _extends({}, column, {
              columns: column.columns.map(function (d) {
                return decorateAndAddToAll(d, column);
              })
            });
          }
          return decorateAndAddToAll(column);
        });

        // Build the visible columns, headers and flat column list
        var visibleColumns = decoratedColumns.slice();
        var allVisibleColumns = [];

        visibleColumns = visibleColumns.map(function (column) {
          if (column.columns) {
            var visibleSubColumns = column.columns.filter(function (d) {
              return pivotBy.indexOf(d.id) > -1 ? false : _.getFirstDefined(d.show, true);
            });
            return _extends({}, column, {
              columns: visibleSubColumns
            });
          }
          return column;
        });

        visibleColumns = visibleColumns.filter(function (column) {
          return column.columns ? column.columns.length : pivotBy.indexOf(column.id) > -1 ? false : _.getFirstDefined(column.show, true);
        });

        // Find any custom pivot location
        var pivotIndex = visibleColumns.findIndex(function (col) {
          return col.pivot;
        });

        // Handle Pivot Columns
        if (pivotBy.length) {
          // Retrieve the pivot columns in the correct pivot order
          var pivotColumns = [];
          pivotBy.forEach(function (pivotID) {
            var found = allDecoratedColumns.find(function (d) {
              return d.id === pivotID;
            });
            if (found) {
              pivotColumns.push(found);
            }
          });

          var PivotParentColumn = pivotColumns.reduce(function (prev, current) {
            return prev && prev === current.parentColumn && current.parentColumn;
          }, pivotColumns[0].parentColumn);

          var PivotGroupHeader = hasHeaderGroups && PivotParentColumn.Header;
          PivotGroupHeader = PivotGroupHeader || function () {
            return React.createElement(
              'strong',
              null,
              'Pivoted'
            );
          };

          var pivotColumnGroup = {
            Header: PivotGroupHeader,
            columns: pivotColumns.map(function (col) {
              return _extends({}, _this2.props.pivotDefaults, col, {
                pivoted: true
              });
            })

            // Place the pivotColumns back into the visibleColumns
          };if (pivotIndex >= 0) {
            pivotColumnGroup = _extends({}, visibleColumns[pivotIndex], pivotColumnGroup);
            visibleColumns.splice(pivotIndex, 1, pivotColumnGroup);
          } else {
            visibleColumns.unshift(pivotColumnGroup);
          }
        }

        // Build Header Groups
        var headerGroups = [];
        var currentSpan = [];

        // A convenience function to add a header and reset the currentSpan
        var addHeader = function addHeader(columns, column) {
          headerGroups.push(_extends({}, _this2.props.column, column, {
            columns: columns
          }));
          currentSpan = [];
        };

        // Build flast list of allVisibleColumns and HeaderGroups
        visibleColumns.forEach(function (column) {
          if (column.columns) {
            allVisibleColumns = allVisibleColumns.concat(column.columns);
            if (currentSpan.length > 0) {
              addHeader(currentSpan);
            }
            addHeader(column.columns, column);
            return;
          }
          allVisibleColumns.push(column);
          currentSpan.push(column);
        });
        if (hasHeaderGroups && currentSpan.length > 0) {
          addHeader(currentSpan);
        }

        // Access the data
        var accessRow = function accessRow(d, i) {
          var _row;

          var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

          var row = (_row = {}, _defineProperty(_row, originalKey, d), _defineProperty(_row, indexKey, i), _defineProperty(_row, subRowsKey, d[subRowsKey]), _defineProperty(_row, nestingLevelKey, level), _row);
          allDecoratedColumns.forEach(function (column) {
            if (column.expander) return;
            row[column.id] = column.accessor(d);
          });
          if (row[subRowsKey]) {
            row[subRowsKey] = row[subRowsKey].map(function (d, i) {
              return accessRow(d, i, level + 1);
            });
          }
          return row;
        };

        // // If the data hasn't changed, just use the cached data
        var resolvedData = this.resolvedData;
        // If the data has changed, run the data resolver and cache the result
        if (!this.resolvedData || dataChanged) {
          resolvedData = resolveData(data);
          this.resolvedData = resolvedData;
        }
        // Use the resolved data
        resolvedData = resolvedData.map(function (d, i) {
          return accessRow(d, i);
        });

        // TODO: Make it possible to fabricate nested rows without pivoting
        var aggregatingColumns = allVisibleColumns.filter(function (d) {
          return !d.expander && d.aggregate;
        });

        // If pivoting, recursively group the data
        var aggregate = function aggregate(rows) {
          var aggregationValues = {};
          aggregatingColumns.forEach(function (column) {
            var values = rows.map(function (d) {
              return d[column.id];
            });
            aggregationValues[column.id] = column.aggregate(values, rows);
          });
          return aggregationValues;
        };
        if (pivotBy.length) {
          var groupRecursively = function groupRecursively(rows, keys) {
            var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            // This is the last level, just return the rows
            if (i === keys.length) {
              return rows;
            }
            // Group the rows together for this level
            var groupedRows = Object.entries(_.groupBy(rows, keys[i])).map(function (_ref) {
              var _ref3;

              var _ref2 = _slicedToArray(_ref, 2),
                  key = _ref2[0],
                  value = _ref2[1];

              return _ref3 = {}, _defineProperty(_ref3, pivotIDKey, keys[i]), _defineProperty(_ref3, pivotValKey, key), _defineProperty(_ref3, keys[i], key), _defineProperty(_ref3, subRowsKey, value), _defineProperty(_ref3, nestingLevelKey, i), _defineProperty(_ref3, groupedByPivotKey, true), _ref3;
            });
            // Recurse into the subRows
            groupedRows = groupedRows.map(function (rowGroup) {
              var _extends2;

              var subRows = groupRecursively(rowGroup[subRowsKey], keys, i + 1);
              return _extends({}, rowGroup, (_extends2 = {}, _defineProperty(_extends2, subRowsKey, subRows), _defineProperty(_extends2, aggregatedKey, true), _extends2), aggregate(subRows));
            });
            return groupedRows;
          };
          resolvedData = groupRecursively(resolvedData, pivotBy);
        }

        return _extends({}, newState, {
          resolvedData: resolvedData,
          allVisibleColumns: allVisibleColumns,
          headerGroups: headerGroups,
          allDecoratedColumns: allDecoratedColumns,
          hasHeaderGroups: hasHeaderGroups
        });
      }
    }, {
      key: 'getSortedData',
      value: function getSortedData(resolvedState) {
        var manual = resolvedState.manual,
            sorted = resolvedState.sorted,
            filtered = resolvedState.filtered,
            defaultFilterMethod = resolvedState.defaultFilterMethod,
            resolvedData = resolvedState.resolvedData,
            allVisibleColumns = resolvedState.allVisibleColumns,
            allDecoratedColumns = resolvedState.allDecoratedColumns;


        var sortMethodsByColumnID = {};

        allDecoratedColumns.filter(function (col) {
          return col.sortMethod;
        }).forEach(function (col) {
          sortMethodsByColumnID[col.id] = col.sortMethod;
        });

        // Resolve the data from either manual data or sorted data
        return {
          sortedData: manual ? resolvedData : this.sortData(this.filterData(resolvedData, filtered, defaultFilterMethod, allVisibleColumns), sorted, sortMethodsByColumnID)
        };
      }
    }, {
      key: 'fireFetchData',
      value: function fireFetchData() {
        this.props.onFetchData(this.getResolvedState(), this);
      }
    }, {
      key: 'getPropOrState',
      value: function getPropOrState(key) {
        return _.getFirstDefined(this.props[key], this.state[key]);
      }
    }, {
      key: 'getStateOrProp',
      value: function getStateOrProp(key) {
        return _.getFirstDefined(this.state[key], this.props[key]);
      }
    }, {
      key: 'filterData',
      value: function filterData(data, filtered, defaultFilterMethod, allVisibleColumns) {
        var _this3 = this;

        var filteredData = data;

        if (filtered.length) {
          filteredData = filtered.reduce(function (filteredSoFar, nextFilter) {
            var column = allVisibleColumns.find(function (x) {
              return x.id === nextFilter.id;
            });

            // Don't filter hidden columns or columns that have had their filters disabled
            if (!column || column.filterable === false) {
              return filteredSoFar;
            }

            var filterMethod = column.filterMethod || defaultFilterMethod;

            // If 'filterAll' is set to true, pass the entire dataset to the filter method
            if (column.filterAll) {
              return filterMethod(nextFilter, filteredSoFar, column);
            }
            return filteredSoFar.filter(function (row) {
              return filterMethod(nextFilter, row, column);
            });
          }, filteredData);

          // Apply the filter to the subrows if we are pivoting, and then
          // filter any rows without subcolumns because it would be strange to show
          filteredData = filteredData.map(function (row) {
            if (!row[_this3.props.subRowsKey]) {
              return row;
            }
            return _extends({}, row, _defineProperty({}, _this3.props.subRowsKey, _this3.filterData(row[_this3.props.subRowsKey], filtered, defaultFilterMethod, allVisibleColumns)));
          }).filter(function (row) {
            if (!row[_this3.props.subRowsKey]) {
              return true;
            }
            return row[_this3.props.subRowsKey].length > 0;
          });
        }

        return filteredData;
      }
    }, {
      key: 'sortData',
      value: function sortData(data, sorted) {
        var _this4 = this;

        var sortMethodsByColumnID = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!sorted.length) {
          return data;
        }

        var sortedData = (this.props.orderByMethod || _.orderBy)(data, sorted.map(function (sort) {
          // Support custom sorting methods for each column
          if (sortMethodsByColumnID[sort.id]) {
            return function (a, b) {
              return sortMethodsByColumnID[sort.id](a[sort.id], b[sort.id], sort.desc, a, b);
            };
          }
          return function (a, b) {
            return _this4.props.defaultSortMethod(a[sort.id], b[sort.id], sort.desc, a, b);
          };
        }), sorted.map(function (d) {
          return !d.desc;
        }), this.props.indexKey);

        sortedData.forEach(function (row) {
          if (!row[_this4.props.subRowsKey]) {
            return;
          }
          row[_this4.props.subRowsKey] = _this4.sortData(row[_this4.props.subRowsKey], sorted, sortMethodsByColumnID);
        });

        return sortedData;
      }
    }, {
      key: 'getMinRows',
      value: function getMinRows() {
        return _.getFirstDefined(this.props.minRows, this.getStateOrProp('pageSize'));
      }

      // User actions

    }, {
      key: 'onPageChange',
      value: function onPageChange(page) {
        var _props = this.props,
            onPageChange = _props.onPageChange,
            collapseOnPageChange = _props.collapseOnPageChange;


        var newState = { page: page };
        if (collapseOnPageChange) {
          newState.expanded = {};
        }
        this.setStateWithData(newState, function () {
          return onPageChange && onPageChange(page);
        });
      }
    }, {
      key: 'onPageSizeChange',
      value: function onPageSizeChange(newPageSize) {
        var onPageSizeChange = this.props.onPageSizeChange;

        var _getResolvedState = this.getResolvedState(),
            pageSize = _getResolvedState.pageSize,
            page = _getResolvedState.page;

        // Normalize the page to display


        var currentRow = pageSize * page;
        var newPage = Math.floor(currentRow / newPageSize);

        this.setStateWithData({
          pageSize: newPageSize,
          page: newPage
        }, function () {
          return onPageSizeChange && onPageSizeChange(newPageSize, newPage);
        });
      }
    }, {
      key: 'sortColumn',
      value: function sortColumn(column, additive) {
        var _getResolvedState2 = this.getResolvedState(),
            sorted = _getResolvedState2.sorted,
            skipNextSort = _getResolvedState2.skipNextSort,
            defaultSortDesc = _getResolvedState2.defaultSortDesc;

        var firstSortDirection = Object.prototype.hasOwnProperty.call(column, 'defaultSortDesc') ? column.defaultSortDesc : defaultSortDesc;
        var secondSortDirection = !firstSortDirection;

        // we can't stop event propagation from the column resize move handlers
        // attached to the document because of react's synthetic events
        // so we have to prevent the sort function from actually sorting
        // if we click on the column resize element within a header.
        if (skipNextSort) {
          this.setStateWithData({
            skipNextSort: false
          });
          return;
        }

        var onSortedChange = this.props.onSortedChange;


        var newSorted = _.clone(sorted || []).map(function (d) {
          d.desc = _.isSortingDesc(d);
          return d;
        });
        if (!_.isArray(column)) {
          // Single-Sort
          var existingIndex = newSorted.findIndex(function (d) {
            return d.id === column.id;
          });
          if (existingIndex > -1) {
            var existing = newSorted[existingIndex];
            if (existing.desc === secondSortDirection) {
              if (additive) {
                newSorted.splice(existingIndex, 1);
              } else {
                existing.desc = firstSortDirection;
                newSorted = [existing];
              }
            } else {
              existing.desc = secondSortDirection;
              if (!additive) {
                newSorted = [existing];
              }
            }
          } else if (additive) {
            newSorted.push({
              id: column.id,
              desc: firstSortDirection
            });
          } else {
            newSorted = [{
              id: column.id,
              desc: firstSortDirection
            }];
          }
        } else {
          // Multi-Sort
          var _existingIndex = newSorted.findIndex(function (d) {
            return d.id === column[0].id;
          });
          // Existing Sorted Column
          if (_existingIndex > -1) {
            var _existing = newSorted[_existingIndex];
            if (_existing.desc === secondSortDirection) {
              if (additive) {
                newSorted.splice(_existingIndex, column.length);
              } else {
                column.forEach(function (d, i) {
                  newSorted[_existingIndex + i].desc = firstSortDirection;
                });
              }
            } else {
              column.forEach(function (d, i) {
                newSorted[_existingIndex + i].desc = secondSortDirection;
              });
            }
            if (!additive) {
              newSorted = newSorted.slice(_existingIndex, column.length);
            }
            // New Sort Column
          } else if (additive) {
            newSorted = newSorted.concat(column.map(function (d) {
              return {
                id: d.id,
                desc: firstSortDirection
              };
            }));
          } else {
            newSorted = column.map(function (d) {
              return {
                id: d.id,
                desc: firstSortDirection
              };
            });
          }
        }

        this.setStateWithData({
          page: !sorted.length && newSorted.length || !additive ? 0 : this.state.page,
          sorted: newSorted
        }, function () {
          return onSortedChange && onSortedChange(newSorted, column, additive);
        });
      }
    }, {
      key: 'filterColumn',
      value: function filterColumn(column, value) {
        var _getResolvedState3 = this.getResolvedState(),
            filtered = _getResolvedState3.filtered;

        var onFilteredChange = this.props.onFilteredChange;

        // Remove old filter first if it exists

        var newFiltering = (filtered || []).filter(function (x) {
          return x.id !== column.id;
        });

        if (value !== '') {
          newFiltering.push({
            id: column.id,
            value: value
          });
        }

        this.setStateWithData({
          filtered: newFiltering
        }, function () {
          return onFilteredChange && onFilteredChange(newFiltering, column, value);
        });
      }
    }, {
      key: 'resizeColumnStart',
      value: function resizeColumnStart(event, column, isTouch) {
        var _this5 = this;

        event.stopPropagation();
        var parentWidth = event.target.parentElement.getBoundingClientRect().width;

        var pageX = void 0;
        if (isTouch) {
          pageX = event.changedTouches[0].pageX;
        } else {
          pageX = event.pageX;
        }

        this.trapEvents = true;
        this.setStateWithData({
          currentlyResizing: {
            id: column.id,
            startX: pageX,
            parentWidth: parentWidth
          }
        }, function () {
          if (isTouch) {
            document.addEventListener('touchmove', _this5.resizeColumnMoving);
            document.addEventListener('touchcancel', _this5.resizeColumnEnd);
            document.addEventListener('touchend', _this5.resizeColumnEnd);
          } else {
            document.addEventListener('mousemove', _this5.resizeColumnMoving);
            document.addEventListener('mouseup', _this5.resizeColumnEnd);
            document.addEventListener('mouseleave', _this5.resizeColumnEnd);
          }
        });
      }
    }, {
      key: 'resizeColumnMoving',
      value: function resizeColumnMoving(event) {
        event.stopPropagation();
        var onResizedChange = this.props.onResizedChange;

        var _getResolvedState4 = this.getResolvedState(),
            resized = _getResolvedState4.resized,
            currentlyResizing = _getResolvedState4.currentlyResizing;

        // Delete old value


        var newResized = resized.filter(function (x) {
          return x.id !== currentlyResizing.id;
        });

        var pageX = void 0;

        if (event.type === 'touchmove') {
          pageX = event.changedTouches[0].pageX;
        } else if (event.type === 'mousemove') {
          pageX = event.pageX;
        }

        // Set the min size to 10 to account for margin and border or else the
        // group headers don't line up correctly
        var newWidth = Math.max(currentlyResizing.parentWidth + pageX - currentlyResizing.startX, 11);

        newResized.push({
          id: currentlyResizing.id,
          value: newWidth
        });

        this.setStateWithData({
          resized: newResized
        }, function () {
          return onResizedChange && onResizedChange(newResized, event);
        });
      }
    }, {
      key: 'resizeColumnEnd',
      value: function resizeColumnEnd(event) {
        event.stopPropagation();
        var isTouch = event.type === 'touchend' || event.type === 'touchcancel';

        if (isTouch) {
          document.removeEventListener('touchmove', this.resizeColumnMoving);
          document.removeEventListener('touchcancel', this.resizeColumnEnd);
          document.removeEventListener('touchend', this.resizeColumnEnd);
        }

        // If its a touch event clear the mouse one's as well because sometimes
        // the mouseDown event gets called as well, but the mouseUp event doesn't
        document.removeEventListener('mousemove', this.resizeColumnMoving);
        document.removeEventListener('mouseup', this.resizeColumnEnd);
        document.removeEventListener('mouseleave', this.resizeColumnEnd);

        // The touch events don't propagate up to the sorting's onMouseDown event so
        // no need to prevent it from happening or else the first click after a touch
        // event resize will not sort the column.
        if (!isTouch) {
          this.setStateWithData({
            skipNextSort: true,
            currentlyResizing: false
          });
        }
      }
    }]);

    return _class;
  }(Base);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRob2RzLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwiXyIsInByb3BzIiwic3RhdGUiLCJyZXNvbHZlZFN0YXRlIiwiY29tcGFjdE9iamVjdCIsIm5ld1N0YXRlIiwiZGF0YUNoYW5nZWQiLCJjb2x1bW5zIiwicGl2b3RCeSIsImRhdGEiLCJyZXNvbHZlRGF0YSIsInBpdm90SURLZXkiLCJwaXZvdFZhbEtleSIsInN1YlJvd3NLZXkiLCJhZ2dyZWdhdGVkS2V5IiwibmVzdGluZ0xldmVsS2V5Iiwib3JpZ2luYWxLZXkiLCJpbmRleEtleSIsImdyb3VwZWRCeVBpdm90S2V5IiwiU3ViQ29tcG9uZW50IiwiaGFzSGVhZGVyR3JvdXBzIiwiZm9yRWFjaCIsImNvbHVtbiIsImNvbHVtbnNXaXRoRXhwYW5kZXIiLCJleHBhbmRlckNvbHVtbiIsImZpbmQiLCJjb2wiLCJleHBhbmRlciIsInNvbWUiLCJjb2wyIiwibWFrZURlY29yYXRlZENvbHVtbiIsInBhcmVudENvbHVtbiIsImRjb2wiLCJleHBhbmRlckRlZmF1bHRzIiwibWF4V2lkdGgiLCJtaW5XaWR0aCIsImFjY2Vzc29yIiwiaWQiLCJhY2Nlc3NvclN0cmluZyIsImdldCIsInJvdyIsImNvbnNvbGUiLCJ3YXJuIiwiRXJyb3IiLCJ1bmRlZmluZWQiLCJhbGxEZWNvcmF0ZWRDb2x1bW5zIiwiZGVjb3JhdGVBbmRBZGRUb0FsbCIsImRlY29yYXRlZENvbHVtbiIsInB1c2giLCJkZWNvcmF0ZWRDb2x1bW5zIiwibWFwIiwiZCIsInZpc2libGVDb2x1bW5zIiwic2xpY2UiLCJhbGxWaXNpYmxlQ29sdW1ucyIsInZpc2libGVTdWJDb2x1bW5zIiwiZmlsdGVyIiwiaW5kZXhPZiIsImdldEZpcnN0RGVmaW5lZCIsInNob3ciLCJsZW5ndGgiLCJwaXZvdEluZGV4IiwiZmluZEluZGV4IiwicGl2b3QiLCJwaXZvdENvbHVtbnMiLCJmb3VuZCIsInBpdm90SUQiLCJQaXZvdFBhcmVudENvbHVtbiIsInJlZHVjZSIsInByZXYiLCJjdXJyZW50IiwiUGl2b3RHcm91cEhlYWRlciIsIkhlYWRlciIsInBpdm90Q29sdW1uR3JvdXAiLCJwaXZvdERlZmF1bHRzIiwicGl2b3RlZCIsInNwbGljZSIsInVuc2hpZnQiLCJoZWFkZXJHcm91cHMiLCJjdXJyZW50U3BhbiIsImFkZEhlYWRlciIsImNvbmNhdCIsImFjY2Vzc1JvdyIsImkiLCJsZXZlbCIsInJlc29sdmVkRGF0YSIsImFnZ3JlZ2F0aW5nQ29sdW1ucyIsImFnZ3JlZ2F0ZSIsImFnZ3JlZ2F0aW9uVmFsdWVzIiwidmFsdWVzIiwicm93cyIsImdyb3VwUmVjdXJzaXZlbHkiLCJrZXlzIiwiZ3JvdXBlZFJvd3MiLCJPYmplY3QiLCJlbnRyaWVzIiwiZ3JvdXBCeSIsImtleSIsInZhbHVlIiwic3ViUm93cyIsInJvd0dyb3VwIiwibWFudWFsIiwic29ydGVkIiwiZmlsdGVyZWQiLCJkZWZhdWx0RmlsdGVyTWV0aG9kIiwic29ydE1ldGhvZHNCeUNvbHVtbklEIiwic29ydE1ldGhvZCIsInNvcnRlZERhdGEiLCJzb3J0RGF0YSIsImZpbHRlckRhdGEiLCJvbkZldGNoRGF0YSIsImdldFJlc29sdmVkU3RhdGUiLCJmaWx0ZXJlZERhdGEiLCJmaWx0ZXJlZFNvRmFyIiwibmV4dEZpbHRlciIsIngiLCJmaWx0ZXJhYmxlIiwiZmlsdGVyTWV0aG9kIiwiZmlsdGVyQWxsIiwib3JkZXJCeU1ldGhvZCIsIm9yZGVyQnkiLCJzb3J0IiwiYSIsImIiLCJkZXNjIiwiZGVmYXVsdFNvcnRNZXRob2QiLCJtaW5Sb3dzIiwiZ2V0U3RhdGVPclByb3AiLCJwYWdlIiwib25QYWdlQ2hhbmdlIiwiY29sbGFwc2VPblBhZ2VDaGFuZ2UiLCJleHBhbmRlZCIsInNldFN0YXRlV2l0aERhdGEiLCJuZXdQYWdlU2l6ZSIsIm9uUGFnZVNpemVDaGFuZ2UiLCJwYWdlU2l6ZSIsImN1cnJlbnRSb3ciLCJuZXdQYWdlIiwiTWF0aCIsImZsb29yIiwiYWRkaXRpdmUiLCJza2lwTmV4dFNvcnQiLCJkZWZhdWx0U29ydERlc2MiLCJmaXJzdFNvcnREaXJlY3Rpb24iLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJzZWNvbmRTb3J0RGlyZWN0aW9uIiwib25Tb3J0ZWRDaGFuZ2UiLCJuZXdTb3J0ZWQiLCJjbG9uZSIsImlzU29ydGluZ0Rlc2MiLCJpc0FycmF5IiwiZXhpc3RpbmdJbmRleCIsImV4aXN0aW5nIiwib25GaWx0ZXJlZENoYW5nZSIsIm5ld0ZpbHRlcmluZyIsImV2ZW50IiwiaXNUb3VjaCIsInN0b3BQcm9wYWdhdGlvbiIsInBhcmVudFdpZHRoIiwidGFyZ2V0IiwicGFyZW50RWxlbWVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIndpZHRoIiwicGFnZVgiLCJjaGFuZ2VkVG91Y2hlcyIsInRyYXBFdmVudHMiLCJjdXJyZW50bHlSZXNpemluZyIsInN0YXJ0WCIsImRvY3VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlc2l6ZUNvbHVtbk1vdmluZyIsInJlc2l6ZUNvbHVtbkVuZCIsIm9uUmVzaXplZENoYW5nZSIsInJlc2l6ZWQiLCJuZXdSZXNpemVkIiwidHlwZSIsIm5ld1dpZHRoIiwibWF4IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIkJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPQSxLQUFQLE1BQWtCLE9BQWxCO0FBQ0EsT0FBT0MsQ0FBUCxNQUFjLFNBQWQ7O0FBRUEsZ0JBQWU7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsdUNBRU9DLEtBRlAsRUFFY0MsS0FGZCxFQUVxQjtBQUM5QixZQUFNQyw2QkFDREgsRUFBRUksYUFBRixDQUFnQixLQUFLRixLQUFyQixDQURDLEVBRURGLEVBQUVJLGFBQUYsQ0FBZ0IsS0FBS0gsS0FBckIsQ0FGQyxFQUdERCxFQUFFSSxhQUFGLENBQWdCRixLQUFoQixDQUhDLEVBSURGLEVBQUVJLGFBQUYsQ0FBZ0JILEtBQWhCLENBSkMsQ0FBTjtB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b0IsSUFBTixLQUFlLGFBQTVEOztBQUVBLFlBQUluQixPQUFKLEVBQWE7QUFDWFksbUJBQVNVLG1CQUFULENBQTZCLFdBQTdCLEVBQTBDLEtBQUtSLGtCQUEvQztBQUNBRixtQkFBU1UsbUJBQVQsQ0FBNkIsYUFBN0IsRUFBNEMsS0FBS1AsZUFBakQ7QUFDQUgsbUJBQVNVLG1CQUFULENBQTZCLFVBQTdCLEVBQXlDLEtBQUtQLGVBQTlDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBSCxpQkFBU1UsbUJBQVQsQ0FBNkIsV0FBN0IsRUFBMEMsS0FBS1Isa0JBQS9DO0FBQ0FGLGlCQUFTVSxtQkFBVCxDQUE2QixTQUE3QixFQUF3QyxLQUFLUCxlQUE3QztBQUNBSCxpQkFBU1UsbUJBQVQsQ0FBNkIsWUFBN0IsRUFBMkMsS0FBS1AsZUFBaEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBSSxDQUFDZixPQUFMLEVBQWM7QUFDWixlQUFLMUIsZ0JBQUwsQ0FBc0I7QUFDcEJTLDBCQUFjLElBRE07QUFFcEIyQiwrQkFBbUI7QUFGQyxXQUF0QjtBQUlEO0FBQ0Y7QUFscUJVOztBQUFBO0FBQUEsSUFDQ2EsSUFERDtBQUFBLENBQWYiLCJmaWxlIjoibWV0aG9kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBfIGZyb20gJy4vdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IEJhc2UgPT5cbiAgY2xhc3MgZXh0ZW5kcyBCYXNlIHtcbiAgICBnZXRSZXNvbHZlZFN0YXRlIChwcm9wcywgc3RhdGUpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkU3RhdGUgPSB7XG4gICAgICAgIC4uLl8uY29tcGFjdE9iamVjdCh0aGlzLnN0YXRlKSxcbiAgICAgICAgLi4uXy5jb21wYWN0T2JqZWN0KHRoaXMucHJvcHMpLFxuICAgICAgICAuLi5fLmNvbXBhY3RPYmplY3Qoc3RhdGUpLFxuICAgICAgICAuLi5fLmNvbXBhY3RPYmplY3QocHJvcHMpLFxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmVkU3RhdGVcbiAgICB9XG5cbiAgICBnZXREYXRhTW9kZWwgKG5ld1N0YXRlLCBkYXRhQ2hhbmdlZCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb2x1bW5zLFxuICAgICAgICBwaXZvdEJ5ID0gW10sXG4gICAgICAgIGRhdGEsXG4gICAgICAgIHJlc29sdmVEYXRhLFxuICAgICAgICBwaXZvdElES2V5LFxuICAgICAgICBwaXZvdFZhbEtleSxcbiAgICAgICAgc3ViUm93c0tleSxcbiAgICAgICAgYWdncmVnYXRlZEtleSxcbiAgICAgICAgbmVzdGluZ0xldmVsS2V5LFxuICAgICAgICBvcmlnaW5hbEtleSxcbiAgICAgICAgaW5kZXhLZXksXG4gICAgICAgIGdyb3VwZWRCeVBpdm90S2V5LFxuICAgICAgICBTdWJDb21wb25lbnQsXG4gICAgICB9ID0gbmV3U3RhdGVcblxuICAgICAgLy8gRGV0ZXJtaW5lIEhlYWRlciBHcm91cHNcbiAgICAgIGxldCBoYXNIZWFkZXJHcm91cHMgPSBmYWxzZVxuICAgICAgY29sdW1ucy5mb3JFYWNoKGNvbHVtbiA9PiB7XG4gICAgICAgIGlmIChjb2x1bW4uY29sdW1ucykge1xuICAgICAgICAgIGhhc0hlYWRlckdyb3VwcyA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgbGV0IGNvbHVtbnNXaXRoRXhwYW5kZXIgPSBbLi4uY29sdW1uc11cblxuICAgICAgbGV0IGV4cGFuZGVyQ29sdW1uID0gY29sdW1ucy5maW5kKFxuICAgICAgICBjb2wgPT4gY29sLmV4cGFuZGVyIHx8IChjb2wuY29sdW1ucyAmJiBjb2wuY29sdW1ucy5zb21lKGNvbDIgPT4gY29sMi5leHBhbmRlcikpXG4gICAgICApXG4gICAgICAvLyBUaGUgYWN0dWFsIGV4cGFuZGVyIG1pZ2h0IGJlIGluIHRoZSBjb2x1bW5zIGZpZWxkIG9mIGEgZ3JvdXAgY29sdW1uXG4gICAgICBpZiAoZXhwYW5kZXJDb2x1bW4gJiYgIWV4cGFuZGVyQ29sdW1uLmV4cGFuZGVyKSB7XG4gICAgICAgIGV4cGFuZGVyQ29sdW1uID0gZXhwYW5kZXJDb2x1bW4uY29sdW1ucy5maW5kKGNvbCA9PiBjb2wuZXhwYW5kZXIpXG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlIGhhdmUgU3ViQ29tcG9uZW50J3Mgd2UgbmVlZCB0byBtYWtlIHN1cmUgd2UgaGF2ZSBhbiBleHBhbmRlciBjb2x1bW5cbiAgICAgIGlmIChTdWJDb21wb25lbnQgJiYgIWV4cGFuZGVyQ29sdW1uKSB7XG4gICAgICAgIGV4cGFuZGVyQ29sdW1uID0geyBleHBhbmRlcjogdHJ1ZSB9XG4gICAgICAgIGNvbHVtbnNXaXRoRXhwYW5kZXIgPSBbZXhwYW5kZXJDb2x1bW4sIC4uLmNvbHVtbnNXaXRoRXhwYW5kZXJdXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1ha2VEZWNvcmF0ZWRDb2x1bW4gPSAoY29sdW1uLCBwYXJlbnRDb2x1bW4pID0+IHtcbiAgICAgICAgbGV0IGRjb2xcbiAgICAgICAgaWYgKGNvbHVtbi5leHBhbmRlcikge1xuICAgICAgICAgIGRjb2wgPSB7XG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLmNvbHVtbixcbiAgICAgICAgICAgIC4uLnRoaXMucHJvcHMuZXhwYW5kZXJEZWZhdWx0cyxcbiAgICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGNvbCA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMucHJvcHMuY29sdW1uLFxuICAgICAgICAgICAgLi4uY29sdW1uLFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZSBtaW5XaWR0aCBpcyBub3QgZ3JlYXRlciB0aGFuIG1heFdpZHRoIGlmIHNldFxuICAgICAgICBpZiAoZGNvbC5tYXhXaWR0aCA8IGRjb2wubWluV2lkdGgpIHtcbiAgICAgICAgICBkY29sLm1pbldpZHRoID0gZGNvbC5tYXhXaWR0aFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmVudENvbHVtbikge1xuICAgICAgICAgIGRjb2wucGFyZW50Q29sdW1uID0gcGFyZW50Q29sdW1uXG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaXJzdCBjaGVjayBmb3Igc3RyaW5nIGFjY2Vzc29yXG4gICAgICAgIGlmICh0eXBlb2YgZGNvbC5hY2Nlc3NvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBkY29sLmlkID0gZGNvbC5pZCB8fCBkY29sLmFjY2Vzc29yXG4gICAgICAgICAgY29uc3QgYWNjZXNzb3JTdHJpbmcgPSBkY29sLmFjY2Vzc29yXG4gICAgICAgICAgZGNvbC5hY2Nlc3NvciA9IHJvdyA9PiBfLmdldChyb3csIGFjY2Vzc29yU3RyaW5nKVxuICAgICAgICAgIHJldHVybiBkY29sXG4gICAgICAgIH1cblxuICAgICAgICAvLyBGYWxsIGJhY2sgdG8gZnVuY3Rpb25hbCBhY2Nlc3NvciAoYnV0IHJlcXVpcmUgYW4gSUQpXG4gICAgICAgIGlmIChkY29sLmFjY2Vzc29yICYmICFkY29sLmlkKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGRjb2wpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0EgY29sdW1uIGlkIGlzIHJlcXVpcmVkIGlmIHVzaW5nIGEgbm9uLXN0cmluZyBhY2Nlc3NvciBmb3IgY29sdW1uIGFib3ZlLidcbiAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICAvLyBGYWxsIGJhY2sgdG8gYW4gdW5kZWZpbmVkIGFjY2Vzc29yXG4gICAgICAgIGlmICghZGNvbC5hY2Nlc3Nvcikge1xuICAgICAgICAgIGRjb2wuYWNjZXNzb3IgPSAoKSA9PiB1bmRlZmluZWRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkY29sXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFsbERlY29yYXRlZENvbHVtbnMgPSBbXVxuXG4gICAgICAvLyBEZWNvcmF0ZSB0aGUgY29sdW1uc1xuICAgICAgY29uc3QgZGVjb3JhdGVBbmRBZGRUb0FsbCA9IChjb2x1bW4sIHBhcmVudENvbHVtbikgPT4ge1xuICAgICAgICBjb25zdCBkZWNvcmF0ZWRDb2x1bW4gPSBtYWtlRGVjb3JhdGVkQ29sdW1uKGNvbHVtbiwgcGFyZW50Q29sdW1uKVxuICAgICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLnB1c2goZGVjb3JhdGVkQ29sdW1uKVxuICAgICAgICByZXR1cm4gZGVjb3JhdGVkQ29sdW1uXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlY29yYXRlZENvbHVtbnMgPSBjb2x1bW5zV2l0aEV4cGFuZGVyLm1hcChjb2x1bW4gPT4ge1xuICAgICAgICBpZiAoY29sdW1uLmNvbHVtbnMpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uY29sdW1uLFxuICAgICAgICAgICAgY29sdW1uczogY29sdW1uLmNvbHVtbnMubWFwKGQgPT4gZGVjb3JhdGVBbmRBZGRUb0FsbChkLCBjb2x1bW4pKSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlY29yYXRlQW5kQWRkVG9BbGwoY29sdW1uKVxuICAgICAgfSlcblxuICAgICAgLy8gQnVpbGQgdGhlIHZpc2libGUgY29sdW1ucywgaGVhZGVycyBhbmQgZmxhdCBjb2x1bW4gbGlzdFxuICAgICAgbGV0IHZpc2libGVDb2x1bW5zID0gZGVjb3JhdGVkQ29sdW1ucy5zbGljZSgpXG4gICAgICBsZXQgYWxsVmlzaWJsZUNvbHVtbnMgPSBbXVxuXG4gICAgICB2aXNpYmxlQ29sdW1ucyA9IHZpc2libGVDb2x1bW5zLm1hcChjb2x1bW4gPT4ge1xuICAgICAgICBpZiAoY29sdW1uLmNvbHVtbnMpIHtcbiAgICAgICAgICBjb25zdCB2aXNpYmxlU3ViQ29sdW1ucyA9IGNvbHVtbi5jb2x1bW5zLmZpbHRlcihcbiAgICAgICAgICAgIGQgPT4gKHBpdm90QnkuaW5kZXhPZihkLmlkKSA+IC0xID8gZmFsc2UgOiBfLmdldEZpcnN0RGVmaW5lZChkLnNob3csIHRydWUpKVxuICAgICAgICAgIClcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uY29sdW1uLFxuICAgICAgICAgICAgY29sdW1uczogdmlzaWJsZVN1YkNvbHVtbnMsXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2x1bW5cbiAgICAgIH0pXG5cbiAgICAgIHZpc2libGVDb2x1bW5zID0gdmlzaWJsZUNvbHVtbnMuZmlsdGVyKFxuICAgICAgICBjb2x1bW4gPT5cbiAgICAgICAgICBjb2x1bW4uY29sdW1uc1xuICAgICAgICAgICAgPyBjb2x1bW4uY29sdW1ucy5sZW5ndGhcbiAgICAgICAgICAgIDogcGl2b3RCeS5pbmRleE9mKGNvbHVtbi5pZCkgPiAtMVxuICAgICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICAgIDogXy5nZXRGaXJzdERlZmluZWQoY29sdW1uLnNob3csIHRydWUpXG4gICAgICApXG5cbiAgICAgIC8vIEZpbmQgYW55IGN1c3RvbSBwaXZvdCBsb2NhdGlvblxuICAgICAgY29uc3QgcGl2b3RJbmRleCA9IHZpc2libGVDb2x1bW5zLmZpbmRJbmRleChjb2wgPT4gY29sLnBpdm90KVxuXG4gICAgICAvLyBIYW5kbGUgUGl2b3QgQ29sdW1uc1xuICAgICAgaWYgKHBpdm90QnkubGVuZ3RoKSB7XG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSBwaXZvdCBjb2x1bW5zIGluIHRoZSBjb3JyZWN0IHBpdm90IG9yZGVyXG4gICAgICAgIGNvbnN0IHBpdm90Q29sdW1ucyA9IFtdXG4gICAgICAgIHBpdm90QnkuZm9yRWFjaChwaXZvdElEID0+IHtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IGFsbERlY29yYXRlZENvbHVtbnMuZmluZChkID0+IGQuaWQgPT09IHBpdm90SUQpXG4gICAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgICBwaXZvdENvbHVtbnMucHVzaChmb3VuZClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3QgUGl2b3RQYXJlbnRDb2x1bW4gPSBwaXZvdENvbHVtbnMucmVkdWNlKFxuICAgICAgICAgIChwcmV2LCBjdXJyZW50KSA9PiBwcmV2ICYmIHByZXYgPT09IGN1cnJlbnQucGFyZW50Q29sdW1uICYmIGN1cnJlbnQucGFyZW50Q29sdW1uLFxuICAgICAgICAgIHBpdm90Q29sdW1uc1swXS5wYXJlbnRDb2x1bW5cbiAgICAgICAgKVxuXG4gICAgICAgIGxldCBQaXZvdEdyb3VwSGVhZGVyID0gaGFzSGVhZGVyR3JvdXBzICYmIFBpdm90UGFyZW50Q29sdW1uLkhlYWRlclxuICAgICAgICBQaXZvdEdyb3VwSGVhZGVyID0gUGl2b3RHcm91cEhlYWRlciB8fCAoKCkgPT4gPHN0cm9uZz5QaXZvdGVkPC9zdHJvbmc+KVxuXG4gICAgICAgIGxldCBwaXZvdENvbHVtbkdyb3VwID0ge1xuICAgICAgICAgIEhlYWRlcjogUGl2b3RHcm91cEhlYWRlcixcbiAgICAgICAgICBjb2x1bW5zOiBwaXZvdENvbHVtbnMubWFwKGNvbCA9PiAoe1xuICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5waXZvdERlZmF1bHRzLFxuICAgICAgICAgICAgLi4uY29sLFxuICAgICAgICAgICAgcGl2b3RlZDogdHJ1ZSxcbiAgICAgICAgICB9KSksXG4gICAgICAgIH1cblxuICAgICAgICAvLyBQbGFjZSB0aGUgcGl2b3RDb2x1bW5zIGJhY2sgaW50byB0aGUgdmlzaWJsZUNvbHVtbnNcbiAgICAgICAgaWYgKHBpdm90SW5kZXggPj0gMCkge1xuICAgICAgICAgIHBpdm90Q29sdW1uR3JvdXAgPSB7XG4gICAgICAgICAgICAuLi52aXNpYmxlQ29sdW1uc1twaXZvdEluZGV4XSxcbiAgICAgICAgICAgIC4uLnBpdm90Q29sdW1uR3JvdXAsXG4gICAgICAgICAgfVxuICAgICAgICAgIHZpc2libGVDb2x1bW5zLnNwbGljZShwaXZvdEluZGV4LCAxLCBwaXZvdENvbHVtbkdyb3VwKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZpc2libGVDb2x1bW5zLnVuc2hpZnQocGl2b3RDb2x1bW5Hcm91cClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBCdWlsZCBIZWFkZXIgR3JvdXBzXG4gICAgICBjb25zdCBoZWFkZXJHcm91cHMgPSBbXVxuICAgICAgbGV0IGN1cnJlbnRTcGFuID0gW11cblxuICAgICAgLy8gQSBjb252ZW5pZW5jZSBmdW5jdGlvbiB0byBhZGQgYSBoZWFkZXIgYW5kIHJlc2V0IHRoZSBjdXJyZW50U3BhblxuICAgICAgY29uc3QgYWRkSGVhZGVyID0gKGNvbHVtbnMsIGNvbHVtbikgPT4ge1xuICAgICAgICBoZWFkZXJHcm91cHMucHVzaCh7XG4gICAgICAgICAgLi4udGhpcy5wcm9wcy5jb2x1bW4sXG4gICAgICAgICAgLi4uY29sdW1uLFxuICAgICAgICAgIGNvbHVtbnMsXG4gICAgICAgIH0pXG4gICAgICAgIGN1cnJlbnRTcGFuID0gW11cbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgZmxhc3QgbGlzdCBvZiBhbGxWaXNpYmxlQ29sdW1ucyBhbmQgSGVhZGVyR3JvdXBzXG4gICAgICB2aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGNvbHVtbiA9PiB7XG4gICAgICAgIGlmIChjb2x1bW4uY29sdW1ucykge1xuICAgICAgICAgIGFsbFZpc2libGVDb2x1bW5zID0gYWxsVmlzaWJsZUNvbHVtbnMuY29uY2F0KGNvbHVtbi5jb2x1bW5zKVxuICAgICAgICAgIGlmIChjdXJyZW50U3Bhbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhZGRIZWFkZXIoY3VycmVudFNwYW4pXG4gICAgICAgICAgfVxuICAgICAgICAgIGFkZEhlYWRlcihjb2x1bW4uY29sdW1ucywgY29sdW1uKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGFsbFZpc2libGVDb2x1bW5zLnB1c2goY29sdW1uKVxuICAgICAgICBjdXJyZW50U3Bhbi5wdXNoKGNvbHVtbilcbiAgICAgIH0pXG4gICAgICBpZiAoaGFzSGVhZGVyR3JvdXBzICYmIGN1cnJlbnRTcGFuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYWRkSGVhZGVyKGN1cnJlbnRTcGFuKVxuICAgICAgfVxuXG4gICAgICAvLyBBY2Nlc3MgdGhlIGRhdGFcbiAgICAgIGNvbnN0IGFjY2Vzc1JvdyA9IChkLCBpLCBsZXZlbCA9IDApID0+IHtcbiAgICAgICAgY29uc3Qgcm93ID0ge1xuICAgICAgICAgIFtvcmlnaW5hbEtleV06IGQsXG4gICAgICAgICAgW2luZGV4S2V5XTogaSxcbiAgICAgICAgICBbc3ViUm93c0tleV06IGRbc3ViUm93c0tleV0sXG4gICAgICAgICAgW25lc3RpbmdMZXZlbEtleV06IGxldmVsLFxuICAgICAgICB9XG4gICAgICAgIGFsbERlY29yYXRlZENvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgICAgIGlmIChjb2x1bW4uZXhwYW5kZXIpIHJldHVyblxuICAgICAgICAgIHJvd1tjb2x1bW4uaWRdID0gY29sdW1uLmFjY2Vzc29yKGQpXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChyb3dbc3ViUm93c0tleV0pIHtcbiAgICAgICAgICByb3dbc3ViUm93c0tleV0gPSByb3dbc3ViUm93c0tleV0ubWFwKChkLCBpKSA9PiBhY2Nlc3NSb3coZCwgaSwgbGV2ZWwgKyAxKSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93XG4gICAgICB9XG5cbiAgICAgIC8vIC8vIElmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCBqdXN0IHVzZSB0aGUgY2FjaGVkIGRhdGFcbiAgICAgIGxldCByZXNvbHZlZERhdGEgPSB0aGlzLnJlc29sdmVkRGF0YVxuICAgICAgLy8gSWYgdGhlIGRhdGEgaGFzIGNoYW5nZWQsIHJ1biB0aGUgZGF0YSByZXNvbHZlciBhbmQgY2FjaGUgdGhlIHJlc3VsdFxuICAgICAgaWYgKCF0aGlzLnJlc29sdmVkRGF0YSB8fCBkYXRhQ2hhbmdlZCkge1xuICAgICAgICByZXNvbHZlZERhdGEgPSByZXNvbHZlRGF0YShkYXRhKVxuICAgICAgICB0aGlzLnJlc29sdmVkRGF0YSA9IHJlc29sdmVkRGF0YVxuICAgICAgfVxuICAgICAgLy8gVXNlIHRoZSByZXNvbHZlZCBkYXRhXG4gICAgICByZXNvbHZlZERhdGEgPSByZXNvbHZlZERhdGEubWFwKChkLCBpKSA9PiBhY2Nlc3NSb3coZCwgaSkpXG5cbiAgICAgIC8vIFRPRE86IE1ha2UgaXQgcG9zc2libGUgdG8gZmFicmljYXRlIG5lc3RlZCByb3dzIHdpdGhvdXQgcGl2b3RpbmdcbiAgICAgIGNvbnN0IGFnZ3JlZ2F0aW5nQ29sdW1ucyA9IGFsbFZpc2libGVDb2x1bW5zLmZpbHRlcihkID0+ICFkLmV4cGFuZGVyICYmIGQuYWdncmVnYXRlKVxuXG4gICAgICAvLyBJZiBwaXZvdGluZywgcmVjdXJzaXZlbHkgZ3JvdXAgdGhlIGRhdGFcbiAgICAgIGNvbnN0IGFnZ3JlZ2F0ZSA9IHJvd3MgPT4ge1xuICAgICAgICBjb25zdCBhZ2dyZWdhdGlvblZhbHVlcyA9IHt9XG4gICAgICAgIGFnZ3JlZ2F0aW5nQ29sdW1ucy5mb3JFYWNoKGNvbHVtbiA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWVzID0gcm93cy5tYXAoZCA9PiBkW2NvbHVtbi5pZF0pXG4gICAgICAgICAgYWdncmVnYXRpb25WYWx1ZXNbY29sdW1uLmlkXSA9IGNvbHVtbi5hZ2dyZWdhdGUodmFsdWVzLCByb3dzKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gYWdncmVnYXRpb25WYWx1ZXNcbiAgICAgIH1cbiAgICAgIGlmIChwaXZvdEJ5Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBncm91cFJlY3Vyc2l2ZWx5ID0gKHJvd3MsIGtleXMsIGkgPSAwKSA9PiB7XG4gICAgICAgICAgLy8gVGhpcyBpcyB0aGUgbGFzdCBsZXZlbCwganVzdCByZXR1cm4gdGhlIHJvd3NcbiAgICAgICAgICBpZiAoaSA9PT0ga2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByb3dzXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEdyb3VwIHRoZSByb3dzIHRvZ2V0aGVyIGZvciB0aGlzIGxldmVsXG4gICAgICAgICAgbGV0IGdyb3VwZWRSb3dzID0gT2JqZWN0LmVudHJpZXMoXy5ncm91cEJ5KHJvd3MsIGtleXNbaV0pKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIFtwaXZvdElES2V5XToga2V5c1tpXSxcbiAgICAgICAgICAgIFtwaXZvdFZhbEtleV06IGtleSxcbiAgICAgICAgICAgIFtrZXlzW2ldXToga2V5LFxuICAgICAgICAgICAgW3N1YlJvd3NLZXldOiB2YWx1ZSxcbiAgICAgICAgICAgIFtuZXN0aW5nTGV2ZWxLZXldOiBpLFxuICAgICAgICAgICAgW2dyb3VwZWRCeVBpdm90S2V5XTogdHJ1ZSxcbiAgICAgICAgICB9KSlcbiAgICAgICAgICAvLyBSZWN1cnNlIGludG8gdGhlIHN1YlJvd3NcbiAgICAgICAgICBncm91cGVkUm93cyA9IGdyb3VwZWRSb3dzLm1hcChyb3dHcm91cCA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJSb3dzID0gZ3JvdXBSZWN1cnNpdmVseShyb3dHcm91cFtzdWJSb3dzS2V5XSwga2V5cywgaSArIDEpXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAuLi5yb3dHcm91cCxcbiAgICAgICAgICAgICAgW3N1YlJvd3NLZXldOiBzdWJSb3dzLFxuICAgICAgICAgICAgICBbYWdncmVnYXRlZEtleV06IHRydWUsXG4gICAgICAgICAgICAgIC4uLmFnZ3JlZ2F0ZShzdWJSb3dzKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBncm91cGVkUm93c1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmVkRGF0YSA9IGdyb3VwUmVjdXJzaXZlbHkocmVzb2x2ZWREYXRhLCBwaXZvdEJ5KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5uZXdTdGF0ZSxcbiAgICAgICAgcmVzb2x2ZWREYXRhLFxuICAgICAgICBhbGxWaXNpYmxlQ29sdW1ucyxcbiAgICAgICAgaGVhZGVyR3JvdXBzLFxuICAgICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLFxuICAgICAgICBoYXNIZWFkZXJHcm91cHMsXG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U29ydGVkRGF0YSAocmVzb2x2ZWRTdGF0ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBtYW51YWwsXG4gICAgICAgIHNvcnRlZCxcbiAgICAgICAgZmlsdGVyZWQsXG4gICAgICAgIGRlZmF1bHRGaWx0ZXJNZXRob2QsXG4gICAgICAgIHJlc29sdmVkRGF0YSxcbiAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnMsXG4gICAgICAgIGFsbERlY29yYXRlZENvbHVtbnMsXG4gICAgICB9ID0gcmVzb2x2ZWRTdGF0ZVxuXG4gICAgICBjb25zdCBzb3J0TWV0aG9kc0J5Q29sdW1uSUQgPSB7fVxuXG4gICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLnNvcnRNZXRob2QpLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgc29ydE1ldGhvZHNCeUNvbHVtbklEW2NvbC5pZF0gPSBjb2wuc29ydE1ldGhvZFxuICAgICAgfSlcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgZGF0YSBmcm9tIGVpdGhlciBtYW51YWwgZGF0YSBvciBzb3J0ZWQgZGF0YVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc29ydGVkRGF0YTogbWFudWFsXG4gICAgICAgICAgPyByZXNvbHZlZERhdGFcbiAgICAgICAgICA6IHRoaXMuc29ydERhdGEoXG4gICAgICAgICAgICB0aGlzLmZpbHRlckRhdGEocmVzb2x2ZWREYXRhLCBmaWx0ZXJlZCwgZGVmYXVsdEZpbHRlck1ldGhvZCwgYWxsVmlzaWJsZUNvbHVtbnMpLFxuICAgICAgICAgICAgc29ydGVkLFxuICAgICAgICAgICAgc29ydE1ldGhvZHNCeUNvbHVtbklEXG4gICAgICAgICAgKSxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaXJlRmV0Y2hEYXRhICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25GZXRjaERhdGEodGhpcy5nZXRSZXNvbHZlZFN0YXRlKCksIHRoaXMpXG4gICAgfVxuXG4gICAgZ2V0UHJvcE9yU3RhdGUgKGtleSkge1xuICAgICAgcmV0dXJuIF8uZ2V0Rmlyc3REZWZpbmVkKHRoaXMucHJvcHNba2V5XSwgdGhpcy5zdGF0ZVtrZXldKVxuICAgIH1cblxuICAgIGdldFN0YXRlT3JQcm9wIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmdldEZpcnN0RGVmaW5lZCh0aGlzLnN0YXRlW2tleV0sIHRoaXMucHJvcHNba2V5XSlcbiAgICB9XG5cbiAgICBmaWx0ZXJEYXRhIChkYXRhLCBmaWx0ZXJlZCwgZGVmYXVsdEZpbHRlck1ldGhvZCwgYWxsVmlzaWJsZUNvbHVtbnMpIHtcbiAgICAgIGxldCBmaWx0ZXJlZERhdGEgPSBkYXRhXG5cbiAgICAgIGlmIChmaWx0ZXJlZC5sZW5ndGgpIHtcbiAgICAgICAgZmlsdGVyZWREYXRhID0gZmlsdGVyZWQucmVkdWNlKChmaWx0ZXJlZFNvRmFyLCBuZXh0RmlsdGVyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29sdW1uID0gYWxsVmlzaWJsZUNvbHVtbnMuZmluZCh4ID0+IHguaWQgPT09IG5leHRGaWx0ZXIuaWQpXG5cbiAgICAgICAgICAvLyBEb24ndCBmaWx0ZXIgaGlkZGVuIGNvbHVtbnMgb3IgY29sdW1ucyB0aGF0IGhhdmUgaGFkIHRoZWlyIGZpbHRlcnMgZGlzYWJsZWRcbiAgICAgICAgICBpZiAoIWNvbHVtbiB8fCBjb2x1bW4uZmlsdGVyYWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZFNvRmFyXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgZmlsdGVyTWV0aG9kID0gY29sdW1uLmZpbHRlck1ldGhvZCB8fCBkZWZhdWx0RmlsdGVyTWV0aG9kXG5cbiAgICAgICAgICAvLyBJZiAnZmlsdGVyQWxsJyBpcyBzZXQgdG8gdHJ1ZSwgcGFzcyB0aGUgZW50aXJlIGRhdGFzZXQgdG8gdGhlIGZpbHRlciBtZXRob2RcbiAgICAgICAgICBpZiAoY29sdW1uLmZpbHRlckFsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbHRlck1ldGhvZChuZXh0RmlsdGVyLCBmaWx0ZXJlZFNvRmFyLCBjb2x1bW4pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmaWx0ZXJlZFNvRmFyLmZpbHRlcihyb3cgPT4gZmlsdGVyTWV0aG9kKG5leHRGaWx0ZXIsIHJvdywgY29sdW1uKSlcbiAgICAgICAgfSwgZmlsdGVyZWREYXRhKVxuXG4gICAgICAgIC8vIEFwcGx5IHRoZSBmaWx0ZXIgdG8gdGhlIHN1YnJvd3MgaWYgd2UgYXJlIHBpdm90aW5nLCBhbmQgdGhlblxuICAgICAgICAvLyBmaWx0ZXIgYW55IHJvd3Mgd2l0aG91dCBzdWJjb2x1bW5zIGJlY2F1c2UgaXQgd291bGQgYmUgc3RyYW5nZSB0byBzaG93XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IGZpbHRlcmVkRGF0YVxuICAgICAgICAgIC5tYXAocm93ID0+IHtcbiAgICAgICAgICAgIGlmICghcm93W3RoaXMucHJvcHMuc3ViUm93c0tleV0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJvd1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgLi4ucm93LFxuICAgICAgICAgICAgICBbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XTogdGhpcy5maWx0ZXJEYXRhKFxuICAgICAgICAgICAgICAgIHJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldLFxuICAgICAgICAgICAgICAgIGZpbHRlcmVkLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRGaWx0ZXJNZXRob2QsXG4gICAgICAgICAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnNcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHtcbiAgICAgICAgICAgIGlmICghcm93W3RoaXMucHJvcHMuc3ViUm93c0tleV0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XS5sZW5ndGggPiAwXG4gICAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpbHRlcmVkRGF0YVxuICAgIH1cblxuICAgIHNvcnREYXRhIChkYXRhLCBzb3J0ZWQsIHNvcnRNZXRob2RzQnlDb2x1bW5JRCA9IHt9KSB7XG4gICAgICBpZiAoIXNvcnRlZC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc29ydGVkRGF0YSA9ICh0aGlzLnByb3BzLm9yZGVyQnlNZXRob2QgfHwgXy5vcmRlckJ5KShcbiAgICAgICAgZGF0YSxcbiAgICAgICAgc29ydGVkLm1hcChzb3J0ID0+IHtcbiAgICAgICAgICAvLyBTdXBwb3J0IGN1c3RvbSBzb3J0aW5nIG1ldGhvZHMgZm9yIGVhY2ggY29sdW1uXG4gICAgICAgICAgaWYgKHNvcnRNZXRob2RzQnlDb2x1bW5JRFtzb3J0LmlkXSkge1xuICAgICAgICAgICAgcmV0dXJuIChhLCBiKSA9PiBzb3J0TWV0aG9kc0J5Q29sdW1uSURbc29ydC5pZF0oYVtzb3J0LmlkXSwgYltzb3J0LmlkXSwgc29ydC5kZXNjLCBhLCBiKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gKGEsIGIpID0+IHRoaXMucHJvcHMuZGVmYXVsdFNvcnRNZXRob2QoYVtzb3J0LmlkXSwgYltzb3J0LmlkXSwgc29ydC5kZXNjLCBhLCBiKVxuICAgICAgICB9KSxcbiAgICAgICAgc29ydGVkLm1hcChkID0+ICFkLmRlc2MpLFxuICAgICAgICB0aGlzLnByb3BzLmluZGV4S2V5XG4gICAgICApXG5cbiAgICAgIHNvcnRlZERhdGEuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICBpZiAoIXJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgcm93W3RoaXMucHJvcHMuc3ViUm93c0tleV0gPSB0aGlzLnNvcnREYXRhKFxuICAgICAgICAgIHJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldLFxuICAgICAgICAgIHNvcnRlZCxcbiAgICAgICAgICBzb3J0TWV0aG9kc0J5Q29sdW1uSURcbiAgICAgICAgKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHNvcnRlZERhdGFcbiAgICB9XG5cbiAgICBnZXRNaW5Sb3dzICgpIHtcbiAgICAgIHJldHVybiBfLmdldEZpcnN0RGVmaW5lZCh0aGlzLnByb3BzLm1pblJvd3MsIHRoaXMuZ2V0U3RhdGVPclByb3AoJ3BhZ2VTaXplJykpXG4gICAgfVxuXG4gICAgLy8gVXNlciBhY3Rpb25zXG4gICAgb25QYWdlQ2hhbmdlIChwYWdlKSB7XG4gICAgICBjb25zdCB7IG9uUGFnZUNoYW5nZSwgY29sbGFwc2VPblBhZ2VDaGFuZ2UgfSA9IHRoaXMucHJvcHNcblxuICAgICAgY29uc3QgbmV3U3RhdGUgPSB7IHBhZ2UgfVxuICAgICAgaWYgKGNvbGxhcHNlT25QYWdlQ2hhbmdlKSB7XG4gICAgICAgIG5ld1N0YXRlLmV4cGFuZGVkID0ge31cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGVXaXRoRGF0YShuZXdTdGF0ZSwgKCkgPT4gb25QYWdlQ2hhbmdlICYmIG9uUGFnZUNoYW5nZShwYWdlKSlcbiAgICB9XG5cbiAgICBvblBhZ2VTaXplQ2hhbmdlIChuZXdQYWdlU2l6ZSkge1xuICAgICAgY29uc3QgeyBvblBhZ2VTaXplQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG4gICAgICBjb25zdCB7IHBhZ2VTaXplLCBwYWdlIH0gPSB0aGlzLmdldFJlc29sdmVkU3RhdGUoKVxuXG4gICAgICAvLyBOb3JtYWxpemUgdGhlIHBhZ2UgdG8gZGlzcGxheVxuICAgICAgY29uc3QgY3VycmVudFJvdyA9IHBhZ2VTaXplICogcGFnZVxuICAgICAgY29uc3QgbmV3UGFnZSA9IE1hdGguZmxvb3IoY3VycmVudFJvdyAvIG5ld1BhZ2VTaXplKVxuXG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICBwYWdlU2l6ZTogbmV3UGFnZVNpemUsXG4gICAgICAgICAgcGFnZTogbmV3UGFnZSxcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gb25QYWdlU2l6ZUNoYW5nZSAmJiBvblBhZ2VTaXplQ2hhbmdlKG5ld1BhZ2VTaXplLCBuZXdQYWdlKVxuICAgICAgKVxuICAgIH1cblxuICAgIHNvcnRDb2x1bW4gKGNvbHVtbiwgYWRkaXRpdmUpIHtcbiAgICAgIGNvbnN0IHsgc29ydGVkLCBza2lwTmV4dFNvcnQsIGRlZmF1bHRTb3J0RGVzYyB9ID0gdGhpcy5nZXRSZXNvbHZlZFN0YXRlKClcblxuICAgICAgY29uc3QgZmlyc3RTb3J0RGlyZWN0aW9uID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbHVtbiwgJ2RlZmF1bHRTb3J0RGVzYycpXG4gICAgICAgID8gY29sdW1uLmRlZmF1bHRTb3J0RGVzY1xuICAgICAgICA6IGRlZmF1bHRTb3J0RGVzY1xuICAgICAgY29uc3Qgc2Vjb25kU29ydERpcmVjdGlvbiA9ICFmaXJzdFNvcnREaXJlY3Rpb25cblxuICAgICAgLy8gd2UgY2FuJ3Qgc3RvcCBldmVudCBwcm9wYWdhdGlvbiBmcm9tIHRoZSBjb2x1bW4gcmVzaXplIG1vdmUgaGFuZGxlcnNcbiAgICAgIC8vIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBiZWNhdXNlIG9mIHJlYWN0J3Mgc3ludGhldGljIGV2ZW50c1xuICAgICAgLy8gc28gd2UgaGF2ZSB0byBwcmV2ZW50IHRoZSBzb3J0IGZ1bmN0aW9uIGZyb20gYWN0dWFsbHkgc29ydGluZ1xuICAgICAgLy8gaWYgd2UgY2xpY2sgb24gdGhlIGNvbHVtbiByZXNpemUgZWxlbWVudCB3aXRoaW4gYSBoZWFkZXIuXG4gICAgICBpZiAoc2tpcE5leHRTb3J0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGVXaXRoRGF0YSh7XG4gICAgICAgICAgc2tpcE5leHRTb3J0OiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgb25Tb3J0ZWRDaGFuZ2UgfSA9IHRoaXMucHJvcHNcblxuICAgICAgbGV0IG5ld1NvcnRlZCA9IF8uY2xvbmUoc29ydGVkIHx8IFtdKS5tYXAoZCA9PiB7XG4gICAgICAgIGQuZGVzYyA9IF8uaXNTb3J0aW5nRGVzYyhkKVxuICAgICAgICByZXR1cm4gZFxuICAgICAgfSlcbiAgICAgIGlmICghXy5pc0FycmF5KGNvbHVtbikpIHtcbiAgICAgICAgLy8gU2luZ2xlLVNvcnRcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IG5ld1NvcnRlZC5maW5kSW5kZXgoZCA9PiBkLmlkID09PSBjb2x1bW4uaWQpXG4gICAgICAgIGlmIChleGlzdGluZ0luZGV4ID4gLTEpIHtcbiAgICAgICAgICBjb25zdCBleGlzdGluZyA9IG5ld1NvcnRlZFtleGlzdGluZ0luZGV4XVxuICAgICAgICAgIGlmIChleGlzdGluZy5kZXNjID09PSBzZWNvbmRTb3J0RGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBpZiAoYWRkaXRpdmUpIHtcbiAgICAgICAgICAgICAgbmV3U29ydGVkLnNwbGljZShleGlzdGluZ0luZGV4LCAxKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZXhpc3RpbmcuZGVzYyA9IGZpcnN0U29ydERpcmVjdGlvblxuICAgICAgICAgICAgICBuZXdTb3J0ZWQgPSBbZXhpc3RpbmddXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4aXN0aW5nLmRlc2MgPSBzZWNvbmRTb3J0RGlyZWN0aW9uXG4gICAgICAgICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgICAgICAgIG5ld1NvcnRlZCA9IFtleGlzdGluZ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYWRkaXRpdmUpIHtcbiAgICAgICAgICBuZXdTb3J0ZWQucHVzaCh7XG4gICAgICAgICAgICBpZDogY29sdW1uLmlkLFxuICAgICAgICAgICAgZGVzYzogZmlyc3RTb3J0RGlyZWN0aW9uLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3U29ydGVkID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogY29sdW1uLmlkLFxuICAgICAgICAgICAgICBkZXNjOiBmaXJzdFNvcnREaXJlY3Rpb24sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTXVsdGktU29ydFxuICAgICAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gbmV3U29ydGVkLmZpbmRJbmRleChkID0+IGQuaWQgPT09IGNvbHVtblswXS5pZClcbiAgICAgICAgLy8gRXhpc3RpbmcgU29ydGVkIENvbHVtblxuICAgICAgICBpZiAoZXhpc3RpbmdJbmRleCA+IC0xKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBuZXdTb3J0ZWRbZXhpc3RpbmdJbmRleF1cbiAgICAgICAgICBpZiAoZXhpc3RpbmcuZGVzYyA9PT0gc2Vjb25kU29ydERpcmVjdGlvbikge1xuICAgICAgICAgICAgaWYgKGFkZGl0aXZlKSB7XG4gICAgICAgICAgICAgIG5ld1NvcnRlZC5zcGxpY2UoZXhpc3RpbmdJbmRleCwgY29sdW1uLmxlbmd0aClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbHVtbi5mb3JFYWNoKChkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgbmV3U29ydGVkW2V4aXN0aW5nSW5kZXggKyBpXS5kZXNjID0gZmlyc3RTb3J0RGlyZWN0aW9uXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbHVtbi5mb3JFYWNoKChkLCBpKSA9PiB7XG4gICAgICAgICAgICAgIG5ld1NvcnRlZFtleGlzdGluZ0luZGV4ICsgaV0uZGVzYyA9IHNlY29uZFNvcnREaXJlY3Rpb25cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghYWRkaXRpdmUpIHtcbiAgICAgICAgICAgIG5ld1NvcnRlZCA9IG5ld1NvcnRlZC5zbGljZShleGlzdGluZ0luZGV4LCBjb2x1bW4ubGVuZ3RoKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOZXcgU29ydCBDb2x1bW5cbiAgICAgICAgfSBlbHNlIGlmIChhZGRpdGl2ZSkge1xuICAgICAgICAgIG5ld1NvcnRlZCA9IG5ld1NvcnRlZC5jb25jYXQoXG4gICAgICAgICAgICBjb2x1bW4ubWFwKGQgPT4gKHtcbiAgICAgICAgICAgICAgaWQ6IGQuaWQsXG4gICAgICAgICAgICAgIGRlc2M6IGZpcnN0U29ydERpcmVjdGlvbixcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAgIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdTb3J0ZWQgPSBjb2x1bW4ubWFwKGQgPT4gKHtcbiAgICAgICAgICAgIGlkOiBkLmlkLFxuICAgICAgICAgICAgZGVzYzogZmlyc3RTb3J0RGlyZWN0aW9uLFxuICAgICAgICAgIH0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGVXaXRoRGF0YShcbiAgICAgICAge1xuICAgICAgICAgIHBhZ2U6ICghc29ydGVkLmxlbmd0aCAmJiBuZXdTb3J0ZWQubGVuZ3RoKSB8fCAhYWRkaXRpdmUgPyAwIDogdGhpcy5zdGF0ZS5wYWdlLFxuICAgICAgICAgIHNvcnRlZDogbmV3U29ydGVkLFxuICAgICAgICB9LFxuICAgICAgICAoKSA9PiBvblNvcnRlZENoYW5nZSAmJiBvblNvcnRlZENoYW5nZShuZXdTb3J0ZWQsIGNvbHVtbiwgYWRkaXRpdmUpXG4gICAgICApXG4gICAgfVxuXG4gICAgZmlsdGVyQ29sdW1uIChjb2x1bW4sIHZhbHVlKSB7XG4gICAgICBjb25zdCB7IGZpbHRlcmVkIH0gPSB0aGlzLmdldFJlc29sdmVkU3RhdGUoKVxuICAgICAgY29uc3QgeyBvbkZpbHRlcmVkQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG5cbiAgICAgIC8vIFJlbW92ZSBvbGQgZmlsdGVyIGZpcnN0IGlmIGl0IGV4aXN0c1xuICAgICAgY29uc3QgbmV3RmlsdGVyaW5nID0gKGZpbHRlcmVkIHx8IFtdKS5maWx0ZXIoeCA9PiB4LmlkICE9PSBjb2x1bW4uaWQpXG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgbmV3RmlsdGVyaW5nLnB1c2goe1xuICAgICAgICAgIGlkOiBjb2x1bW4uaWQsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGVXaXRoRGF0YShcbiAgICAgICAge1xuICAgICAgICAgIGZpbHRlcmVkOiBuZXdGaWx0ZXJpbmcsXG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IG9uRmlsdGVyZWRDaGFuZ2UgJiYgb25GaWx0ZXJlZENoYW5nZShuZXdGaWx0ZXJpbmcsIGNvbHVtbiwgdmFsdWUpXG4gICAgICApXG4gICAgfVxuXG4gICAgcmVzaXplQ29sdW1uU3RhcnQgKGV2ZW50LCBjb2x1bW4sIGlzVG91Y2gpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBjb25zdCBwYXJlbnRXaWR0aCA9IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG5cbiAgICAgIGxldCBwYWdlWFxuICAgICAgaWYgKGlzVG91Y2gpIHtcbiAgICAgICAgcGFnZVggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZVggPSBldmVudC5wYWdlWFxuICAgICAgfVxuXG4gICAgICB0aGlzLnRyYXBFdmVudHMgPSB0cnVlXG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICBjdXJyZW50bHlSZXNpemluZzoge1xuICAgICAgICAgICAgaWQ6IGNvbHVtbi5pZCxcbiAgICAgICAgICAgIHN0YXJ0WDogcGFnZVgsXG4gICAgICAgICAgICBwYXJlbnRXaWR0aCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKGlzVG91Y2gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMucmVzaXplQ29sdW1uTW92aW5nKVxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplQ29sdW1uTW92aW5nKVxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMucmVzaXplQ29sdW1uRW5kKVxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMucmVzaXplQ29sdW1uRW5kKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1cblxuICAgIHJlc2l6ZUNvbHVtbk1vdmluZyAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBjb25zdCB7IG9uUmVzaXplZENoYW5nZSB9ID0gdGhpcy5wcm9wc1xuICAgICAgY29uc3QgeyByZXNpemVkLCBjdXJyZW50bHlSZXNpemluZyB9ID0gdGhpcy5nZXRSZXNvbHZlZFN0YXRlKClcblxuICAgICAgLy8gRGVsZXRlIG9sZCB2YWx1ZVxuICAgICAgY29uc3QgbmV3UmVzaXplZCA9IHJlc2l6ZWQuZmlsdGVyKHggPT4geC5pZCAhPT0gY3VycmVudGx5UmVzaXppbmcuaWQpXG5cbiAgICAgIGxldCBwYWdlWFxuXG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgcGFnZVggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWFxuICAgICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAnbW91c2Vtb3ZlJykge1xuICAgICAgICBwYWdlWCA9IGV2ZW50LnBhZ2VYXG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgbWluIHNpemUgdG8gMTAgdG8gYWNjb3VudCBmb3IgbWFyZ2luIGFuZCBib3JkZXIgb3IgZWxzZSB0aGVcbiAgICAgIC8vIGdyb3VwIGhlYWRlcnMgZG9uJ3QgbGluZSB1cCBjb3JyZWN0bHlcbiAgICAgIGNvbnN0IG5ld1dpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgIGN1cnJlbnRseVJlc2l6aW5nLnBhcmVudFdpZHRoICsgcGFnZVggLSBjdXJyZW50bHlSZXNpemluZy5zdGFydFgsXG4gICAgICAgIDExXG4gICAgICApXG5cbiAgICAgIG5ld1Jlc2l6ZWQucHVzaCh7XG4gICAgICAgIGlkOiBjdXJyZW50bHlSZXNpemluZy5pZCxcbiAgICAgICAgdmFsdWU6IG5ld1dpZHRoLFxuICAgICAgfSlcblxuICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKFxuICAgICAgICB7XG4gICAgICAgICAgcmVzaXplZDogbmV3UmVzaXplZCxcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gb25SZXNpemVkQ2hhbmdlICYmIG9uUmVzaXplZENoYW5nZShuZXdSZXNpemVkLCBldmVudClcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXNpemVDb2x1bW5FbmQgKGV2ZW50KSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgY29uc3QgaXNUb3VjaCA9IGV2ZW50LnR5cGUgPT09ICd0b3VjaGVuZCcgfHwgZXZlbnQudHlwZSA9PT0gJ3RvdWNoY2FuY2VsJ1xuXG4gICAgICBpZiAoaXNUb3VjaCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgIH1cblxuICAgICAgLy8gSWYgaXRzIGEgdG91Y2ggZXZlbnQgY2xlYXIgdGhlIG1vdXNlIG9uZSdzIGFzIHdlbGwgYmVjYXVzZSBzb21ldGltZXNcbiAgICAgIC8vIHRoZSBtb3VzZURvd24gZXZlbnQgZ2V0cyBjYWxsZWQgYXMgd2VsbCwgYnV0IHRoZSBtb3VzZVVwIGV2ZW50IGRvZXNuJ3RcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplQ29sdW1uTW92aW5nKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMucmVzaXplQ29sdW1uRW5kKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMucmVzaXplQ29sdW1uRW5kKVxuXG4gICAgICAvLyBUaGUgdG91Y2ggZXZlbnRzIGRvbid0IHByb3BhZ2F0ZSB1cCB0byB0aGUgc29ydGluZydzIG9uTW91c2VEb3duIGV2ZW50IHNvXG4gICAgICAvLyBubyBuZWVkIHRvIHByZXZlbnQgaXQgZnJvbSBoYXBwZW5pbmcgb3IgZWxzZSB0aGUgZmlyc3QgY2xpY2sgYWZ0ZXIgYSB0b3VjaFxuICAgICAgLy8gZXZlbnQgcmVzaXplIHdpbGwgbm90IHNvcnQgdGhlIGNvbHVtbi5cbiAgICAgIGlmICghaXNUb3VjaCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoe1xuICAgICAgICAgIHNraXBOZXh0U29ydDogdHJ1ZSxcbiAgICAgICAgICBjdXJyZW50bHlSZXNpemluZzogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG4iXX0=