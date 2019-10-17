'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Base) {
  return function (_Base) {
    _inherits(_class, _Base);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'getResolvedState',
      value: function getResolvedState(props, state) {
        var resolvedState = _extends({}, _utils2.default.compactObject(this.state), _utils2.default.compactObject(this.props), _utils2.default.compactObject(state), _utils2.default.compactObject(props));
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
              return _utils2.default.get(row, accessorString);
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
              return pivotBy.indexOf(d.id) > -1 ? false : _utils2.default.getFirstDefined(d.show, true);
            });
            return _extends({}, column, {
              columns: visibleSubColumns
            });
          }
          return column;
        });

        visibleColumns = visibleColumns.filter(function (column) {
          return column.columns ? column.columns.length : pivotBy.indexOf(column.id) > -1 ? false : _utils2.default.getFirstDefined(column.show, true);
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
            return _react2.default.createElement(
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
            var groupedRows = Object.entries(_utils2.default.groupBy(rows, keys[i])).map(function (_ref) {
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
        return _utils2.default.getFirstDefined(this.props[key], this.state[key]);
      }
    }, {
      key: 'getStateOrProp',
      value: function getStateOrProp(key) {
        return _utils2.default.getFirstDefined(this.state[key], this.props[key]);
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

        var sortedData = (this.props.orderByMethod || _utils2.default.orderBy)(data, sorted.map(function (sort) {
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
        return _utils2.default.getFirstDefined(this.props.minRows, this.getStateOrProp('pageSize'));
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


        var newSorted = _utils2.default.clone(sorted || []).map(function (d) {
          d.desc = _utils2.default.isSortingDesc(d);
          return d;
        });
        if (!_utils2.default.isArray(column)) {
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRob2RzLmpzIl0sIm5hbWVzIjpbInByb3BzIiwic3RhdGUiLCJyZXNvbHZlZFN0YXRlIiwiXyIsImNvbXBhY3RPYmplY3QiLCJuZXdTdGF0ZSIsImRhdGFDaGFuZ2VkIiwiY29sdW1ucyIsInBpdm90QnkiLCJkYXRhIiwicmVzb2x2ZURhdGEiLCJwaXZvdElES2V5IiwicGl2b3RWYWxLZXkiLCJzdWJSb3dzS2V5IiwiYWdncmVnYXRlZEtleSIsIm5lc3RpbmdMZXZlbEtleSIsIm9yaWdpbmFsS2V5IiwiaW5kZXhLZXkiLCJncm91cGVkQnlQaXZvdEtleSIsIlN1YkNvbXBvbmVudCIsImhhc0hlYWRlckdyb3VwcyIsImZvckVhY2giLCJjb2x1bW4iLCJjb2x1bW5zV2l0aEV4cGFuZGVyIiwiZXhwYW5kZXJDb2x1bW4iLCJmaW5kIiwiY29sIiwiZXhwYW5kZXIiLCJzb21lIiwiY29sMiIsIm1ha2VEZWNvcmF0ZWRDb2x1bW4iLCJwYXJlbnRDb2x1bW4iLCJkY29sIiwiZXhwYW5kZXJEZWZhdWx0cyIsIm1heFdpZHRoIiwibWluV2lkdGgiLCJhY2Nlc3NvciIsImlkIiwiYWNjZXNzb3JTdHJpbmciLCJnZXQiLCJyb3ciLCJjb25zb2xlIiwid2FybiIsIkVycm9yIiwidW5kZWZpbmVkIiwiYWxsRGVjb3JhdGVkQ29sdW1ucyIsImRlY29yYXRlQW5kQWRkVG9BbGwiLCJkZWNvcmF0ZWRDb2x1bW4iLCJwdXNoIiwiZGVjb3JhdGVkQ29sdW1ucyIsIm1hcCIsImQiLCJ2aXNpYmxlQ29sdW1ucyIsInNsaWNlIiwiYWxsVmlzaWJsZUNvbHVtbnMiLCJ2aXNpYmxlU3ViQ29sdW1ucyIsImZpbHRlciIsImluZGV4T2YiLCJnZXRGaXJzdERlZmluZWQiLCJzaG93IiwibGVuZ3RoIiwicGl2b3RJbmRleCIsImZpbmRJbmRleCIsInBpdm90IiwicGl2b3RDb2x1bW5zIiwiZm91bmQiLCJwaXZvdElEIiwiUGl2b3RQYXJlbnRDb2x1bW4iLCJyZWR1Y2UiLCJwcmV2IiwiY3VycmVudCIsIlBpdm90R3JvdXBIZWFkZXIiLCJIZWFkZXIiLCJwaXZvdENvbHVtbkdyb3VwIiwicGl2b3REZWZhdWx0cyIsInBpdm90ZWQiLCJzcGxpY2UiLCJ1bnNoaWZ0IiwiaGVhZGVyR3JvdXBzIiwiY3VycmVudFNwYW4iLCJhZGRIZWFkZXIiLCJjb25jYXQiLCJhY2Nlc3NSb3ciLCJpIiwibGV2ZWwiLCJyZXNvbHZlZERhdGEiLCJhZ2dyZWdhdGluZ0NvbHVtbnMiLCJhZ2dyZWdhdGUiLCJhZ2dyZWdhdGlvblZhbHVlcyIsInZhbHVlcyIsInJvd3MiLCJncm91cFJlY3Vyc2l2ZWx5Iiwia2V5cyIsImdyb3VwZWRSb3dzIiwiT2JqZWN0IiwiZW50cmllcyIsImdyb3VwQnkiLCJrZXkiLCJ2YWx1ZSIsInN1YlJvd3MiLCJyb3dHcm91cCIsIm1hbnVhbCIsInNvcnRlZCIsImZpbHRlcmVkIiwiZGVmYXVsdEZpbHRlck1ldGhvZCIsInNvcnRNZXRob2RzQnlDb2x1bW5JRCIsInNvcnRNZXRob2QiLCJzb3J0ZWREYXRhIiwic29ydERhdGEiLCJmaWx0ZXJEYXRhIiwib25GZXRjaERhdGEiLCJnZXRSZXNvbHZlZFN0YXRlIiwiZmlsdGVyZWREYXRhIiwiZmlsdGVyZWRTb0ZhciIsIm5leHRGaWx0ZXIiLCJ4IiwiZmlsdGVyYWJsZSIsImZpbHRlck1ldGhvZCIsImZpbHRlckFsbCIsIm9yZGVyQnlNZXRob2QiLCJvcmRlckJ5Iiwic29ydCIsImEiLCJiIiwiZGVzYyIsImRlZmF1bHRTb3J0TWV0aG9kIiwibWluUm93cyIsImdldFN0YXRlT3JQcm9wIiwicGFnZSIsIm9uUGFnZUNoYW5nZSIsImNvbGxhcHNlT25QYWdlQ2hhbmdlIiwiZXhwYW5kZWQiLCJzZXRTdGF0ZVdpdGhEYXRhIiwibmV3UGFnZVNpemUiLCJvblBhZ2VTaXplQ2hhbmdlIiwicGFnZVNpemUiLCJjdXJyZW50Um93IiwibmV3UGFnZSIsIk1hdGgiLCJmbG9vciIsImFkZGl0aXZlIiwic2tpcE5leHRTb3J0IiwiZGVmYXVsdFNvcnREZXNjIiwiZmlyc3RTb3J0RGlyZWN0aW9uIiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwic2Vjb25kU29ydERpcmVjdGlvbiIsIm9uU29ydGVkQ2hhbmdlIiwibmV3U29ydGVkIiwiY2xvbmUiLCJpc1NvcnRpbmdEZXNjIiwiaXNBcnJheSIsImV4aXN0aW5nSW5kZXgiLCJleGlzdGluZyIsIm9uRmlsdGVyZWRDaGFuZ2UiLCJuZXdGaWx0ZXJpbmciLCJldmVudCIsImlzVG91Y2giLCJzdG9wUHJvcGFnYXRpb24iLCJwYXJlbnRXaWR0aCIsInRhcmdldCIsInBhcmVudEVsZW1lbnQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ3aWR0aCIsInBhZ2VYIiwiY2hhbmdlZFRvdWNoZXMiLCJ0cmFwRXZlbnRzIiwiY3VycmVudGx5UmVzaXppbmciLCJzdGFydFgiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZXNpemVDb2x1bW5Nb3ZpbmciLCJyZXNpemVDb2x1bW5FbmQiLCJvblJlc2l6ZWRDaGFuZ2UiLCJyZXNpemVkIiwibmV3UmVzaXplZCIsInR5cGUiLCJuZXdXaWR0aCIsIm1heCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJCYXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O2tCQUVlO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLHVDQUVPQSxLQUZQLEVBRWNDLEtBRmQsRUFFcUI7QUFDOUIsWUFBTUMsNkJBQ0RDLGdCQUFFQyxhQUFGLENBQWdCLEtBQUtILEtBQXJCLENBREMsRUFFREUsZ0JBQUVDLGFBQUYsQ0FBZ0IsS0FBS0osS0FBckIsQ0FGQyxFQUdERyxnQkFBRUMsYUFBRixDQUFnQkgsS0FBaEIsQ0FIQyxFQUlERSxnQkFBRUMsYUFBRixDQUFnQkosS0FBaEIsQ0FKQyxDQUFOO0FBTUEsZUFBT0UsYUFBUDtBQUNEO0FBVlU7QUFBQTtBQUFBLG1DQVlH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bkIsT0FBSixFQUFhO0FBQ1hZLG1CQUFTVSxtQkFBVCxDQUE2QixXQUE3QixFQUEwQyxLQUFLUixrQkFBL0M7QUFDQUYsbUJBQVNVLG1CQUFULENBQTZCLGFBQTdCLEVBQTRDLEtBQUtQLGVBQWpEO0FBQ0FILG1CQUFTVSxtQkFBVCxDQUE2QixVQUE3QixFQUF5QyxLQUFLUCxlQUE5QztBQUNEOztBQUVEO0FBQ0E7QUFDQUgsaUJBQVNVLG1CQUFULENBQTZCLFdBQTdCLEVBQTBDLEtBQUtSLGtCQUEvQztBQUNBRixpQkFBU1UsbUJBQVQsQ0FBNkIsU0FBN0IsRUFBd0MsS0FBS1AsZUFBN0M7QUFDQUgsaUJBQVNVLG1CQUFULENBQTZCLFlBQTdCLEVBQTJDLEtBQUtQLGVBQWhEOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQUksQ0FBQ2YsT0FBTCxFQUFjO0FBQ1osZUFBSzFCLGdCQUFMLENBQXNCO0FBQ3BCUywwQkFBYyxJQURNO0FBRXBCMkIsK0JBQW1CO0FBRkMsV0FBdEI7QUFJRDtBQUNGO0FBbHFCVTs7QUFBQTtBQUFBLElBQ0NhLElBREQ7QUFBQSxDIiwiZmlsZSI6Im1ldGhvZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgXyBmcm9tICcuL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBCYXNlID0+XG4gIGNsYXNzIGV4dGVuZHMgQmFzZSB7XG4gICAgZ2V0UmVzb2x2ZWRTdGF0ZSAocHJvcHMsIHN0YXRlKSB7XG4gICAgICBjb25zdCByZXNvbHZlZFN0YXRlID0ge1xuICAgICAgICAuLi5fLmNvbXBhY3RPYmplY3QodGhpcy5zdGF0ZSksXG4gICAgICAgIC4uLl8uY29tcGFjdE9iamVjdCh0aGlzLnByb3BzKSxcbiAgICAgICAgLi4uXy5jb21wYWN0T2JqZWN0KHN0YXRlKSxcbiAgICAgICAgLi4uXy5jb21wYWN0T2JqZWN0KHByb3BzKSxcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlZFN0YXRlXG4gICAgfVxuXG4gICAgZ2V0RGF0YU1vZGVsIChuZXdTdGF0ZSwgZGF0YUNoYW5nZWQpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgcGl2b3RCeSA9IFtdLFxuICAgICAgICBkYXRhLFxuICAgICAgICByZXNvbHZlRGF0YSxcbiAgICAgICAgcGl2b3RJREtleSxcbiAgICAgICAgcGl2b3RWYWxLZXksXG4gICAgICAgIHN1YlJvd3NLZXksXG4gICAgICAgIGFnZ3JlZ2F0ZWRLZXksXG4gICAgICAgIG5lc3RpbmdMZXZlbEtleSxcbiAgICAgICAgb3JpZ2luYWxLZXksXG4gICAgICAgIGluZGV4S2V5LFxuICAgICAgICBncm91cGVkQnlQaXZvdEtleSxcbiAgICAgICAgU3ViQ29tcG9uZW50LFxuICAgICAgfSA9IG5ld1N0YXRlXG5cbiAgICAgIC8vIERldGVybWluZSBIZWFkZXIgR3JvdXBzXG4gICAgICBsZXQgaGFzSGVhZGVyR3JvdXBzID0gZmFsc2VcbiAgICAgIGNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgICBpZiAoY29sdW1uLmNvbHVtbnMpIHtcbiAgICAgICAgICBoYXNIZWFkZXJHcm91cHMgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxldCBjb2x1bW5zV2l0aEV4cGFuZGVyID0gWy4uLmNvbHVtbnNdXG5cbiAgICAgIGxldCBleHBhbmRlckNvbHVtbiA9IGNvbHVtbnMuZmluZChcbiAgICAgICAgY29sID0+IGNvbC5leHBhbmRlciB8fCAoY29sLmNvbHVtbnMgJiYgY29sLmNvbHVtbnMuc29tZShjb2wyID0+IGNvbDIuZXhwYW5kZXIpKVxuICAgICAgKVxuICAgICAgLy8gVGhlIGFjdHVhbCBleHBhbmRlciBtaWdodCBiZSBpbiB0aGUgY29sdW1ucyBmaWVsZCBvZiBhIGdyb3VwIGNvbHVtblxuICAgICAgaWYgKGV4cGFuZGVyQ29sdW1uICYmICFleHBhbmRlckNvbHVtbi5leHBhbmRlcikge1xuICAgICAgICBleHBhbmRlckNvbHVtbiA9IGV4cGFuZGVyQ29sdW1uLmNvbHVtbnMuZmluZChjb2wgPT4gY29sLmV4cGFuZGVyKVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSBoYXZlIFN1YkNvbXBvbmVudCdzIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHdlIGhhdmUgYW4gZXhwYW5kZXIgY29sdW1uXG4gICAgICBpZiAoU3ViQ29tcG9uZW50ICYmICFleHBhbmRlckNvbHVtbikge1xuICAgICAgICBleHBhbmRlckNvbHVtbiA9IHsgZXhwYW5kZXI6IHRydWUgfVxuICAgICAgICBjb2x1bW5zV2l0aEV4cGFuZGVyID0gW2V4cGFuZGVyQ29sdW1uLCAuLi5jb2x1bW5zV2l0aEV4cGFuZGVyXVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtYWtlRGVjb3JhdGVkQ29sdW1uID0gKGNvbHVtbiwgcGFyZW50Q29sdW1uKSA9PiB7XG4gICAgICAgIGxldCBkY29sXG4gICAgICAgIGlmIChjb2x1bW4uZXhwYW5kZXIpIHtcbiAgICAgICAgICBkY29sID0ge1xuICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5jb2x1bW4sXG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLmV4cGFuZGVyRGVmYXVsdHMsXG4gICAgICAgICAgICAuLi5jb2x1bW4sXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRjb2wgPSB7XG4gICAgICAgICAgICAuLi50aGlzLnByb3BzLmNvbHVtbixcbiAgICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnN1cmUgbWluV2lkdGggaXMgbm90IGdyZWF0ZXIgdGhhbiBtYXhXaWR0aCBpZiBzZXRcbiAgICAgICAgaWYgKGRjb2wubWF4V2lkdGggPCBkY29sLm1pbldpZHRoKSB7XG4gICAgICAgICAgZGNvbC5taW5XaWR0aCA9IGRjb2wubWF4V2lkdGhcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJlbnRDb2x1bW4pIHtcbiAgICAgICAgICBkY29sLnBhcmVudENvbHVtbiA9IHBhcmVudENvbHVtblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyc3QgY2hlY2sgZm9yIHN0cmluZyBhY2Nlc3NvclxuICAgICAgICBpZiAodHlwZW9mIGRjb2wuYWNjZXNzb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZGNvbC5pZCA9IGRjb2wuaWQgfHwgZGNvbC5hY2Nlc3NvclxuICAgICAgICAgIGNvbnN0IGFjY2Vzc29yU3RyaW5nID0gZGNvbC5hY2Nlc3NvclxuICAgICAgICAgIGRjb2wuYWNjZXNzb3IgPSByb3cgPT4gXy5nZXQocm93LCBhY2Nlc3NvclN0cmluZylcbiAgICAgICAgICByZXR1cm4gZGNvbFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmFsbCBiYWNrIHRvIGZ1bmN0aW9uYWwgYWNjZXNzb3IgKGJ1dCByZXF1aXJlIGFuIElEKVxuICAgICAgICBpZiAoZGNvbC5hY2Nlc3NvciAmJiAhZGNvbC5pZCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihkY29sKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdBIGNvbHVtbiBpZCBpcyByZXF1aXJlZCBpZiB1c2luZyBhIG5vbi1zdHJpbmcgYWNjZXNzb3IgZm9yIGNvbHVtbiBhYm92ZS4nXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmFsbCBiYWNrIHRvIGFuIHVuZGVmaW5lZCBhY2Nlc3NvclxuICAgICAgICBpZiAoIWRjb2wuYWNjZXNzb3IpIHtcbiAgICAgICAgICBkY29sLmFjY2Vzc29yID0gKCkgPT4gdW5kZWZpbmVkXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGNvbFxuICAgICAgfVxuXG4gICAgICBjb25zdCBhbGxEZWNvcmF0ZWRDb2x1bW5zID0gW11cblxuICAgICAgLy8gRGVjb3JhdGUgdGhlIGNvbHVtbnNcbiAgICAgIGNvbnN0IGRlY29yYXRlQW5kQWRkVG9BbGwgPSAoY29sdW1uLCBwYXJlbnRDb2x1bW4pID0+IHtcbiAgICAgICAgY29uc3QgZGVjb3JhdGVkQ29sdW1uID0gbWFrZURlY29yYXRlZENvbHVtbihjb2x1bW4sIHBhcmVudENvbHVtbilcbiAgICAgICAgYWxsRGVjb3JhdGVkQ29sdW1ucy5wdXNoKGRlY29yYXRlZENvbHVtbilcbiAgICAgICAgcmV0dXJuIGRlY29yYXRlZENvbHVtblxuICAgICAgfVxuXG4gICAgICBjb25zdCBkZWNvcmF0ZWRDb2x1bW5zID0gY29sdW1uc1dpdGhFeHBhbmRlci5tYXAoY29sdW1uID0+IHtcbiAgICAgICAgaWYgKGNvbHVtbi5jb2x1bW5zKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICAgIGNvbHVtbnM6IGNvbHVtbi5jb2x1bW5zLm1hcChkID0+IGRlY29yYXRlQW5kQWRkVG9BbGwoZCwgY29sdW1uKSksXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWNvcmF0ZUFuZEFkZFRvQWxsKGNvbHVtbilcbiAgICAgIH0pXG5cbiAgICAgIC8vIEJ1aWxkIHRoZSB2aXNpYmxlIGNvbHVtbnMsIGhlYWRlcnMgYW5kIGZsYXQgY29sdW1uIGxpc3RcbiAgICAgIGxldCB2aXNpYmxlQ29sdW1ucyA9IGRlY29yYXRlZENvbHVtbnMuc2xpY2UoKVxuICAgICAgbGV0IGFsbFZpc2libGVDb2x1bW5zID0gW11cblxuICAgICAgdmlzaWJsZUNvbHVtbnMgPSB2aXNpYmxlQ29sdW1ucy5tYXAoY29sdW1uID0+IHtcbiAgICAgICAgaWYgKGNvbHVtbi5jb2x1bW5zKSB7XG4gICAgICAgICAgY29uc3QgdmlzaWJsZVN1YkNvbHVtbnMgPSBjb2x1bW4uY29sdW1ucy5maWx0ZXIoXG4gICAgICAgICAgICBkID0+IChwaXZvdEJ5LmluZGV4T2YoZC5pZCkgPiAtMSA/IGZhbHNlIDogXy5nZXRGaXJzdERlZmluZWQoZC5zaG93LCB0cnVlKSlcbiAgICAgICAgICApXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICAgIGNvbHVtbnM6IHZpc2libGVTdWJDb2x1bW5zLFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sdW1uXG4gICAgICB9KVxuXG4gICAgICB2aXNpYmxlQ29sdW1ucyA9IHZpc2libGVDb2x1bW5zLmZpbHRlcihcbiAgICAgICAgY29sdW1uID0+XG4gICAgICAgICAgY29sdW1uLmNvbHVtbnNcbiAgICAgICAgICAgID8gY29sdW1uLmNvbHVtbnMubGVuZ3RoXG4gICAgICAgICAgICA6IHBpdm90QnkuaW5kZXhPZihjb2x1bW4uaWQpID4gLTFcbiAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgICA6IF8uZ2V0Rmlyc3REZWZpbmVkKGNvbHVtbi5zaG93LCB0cnVlKVxuICAgICAgKVxuXG4gICAgICAvLyBGaW5kIGFueSBjdXN0b20gcGl2b3QgbG9jYXRpb25cbiAgICAgIGNvbnN0IHBpdm90SW5kZXggPSB2aXNpYmxlQ29sdW1ucy5maW5kSW5kZXgoY29sID0+IGNvbC5waXZvdClcblxuICAgICAgLy8gSGFuZGxlIFBpdm90IENvbHVtbnNcbiAgICAgIGlmIChwaXZvdEJ5Lmxlbmd0aCkge1xuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgcGl2b3QgY29sdW1ucyBpbiB0aGUgY29ycmVjdCBwaXZvdCBvcmRlclxuICAgICAgICBjb25zdCBwaXZvdENvbHVtbnMgPSBbXVxuICAgICAgICBwaXZvdEJ5LmZvckVhY2gocGl2b3RJRCA9PiB7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBhbGxEZWNvcmF0ZWRDb2x1bW5zLmZpbmQoZCA9PiBkLmlkID09PSBwaXZvdElEKVxuICAgICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgICAgcGl2b3RDb2x1bW5zLnB1c2goZm91bmQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IFBpdm90UGFyZW50Q29sdW1uID0gcGl2b3RDb2x1bW5zLnJlZHVjZShcbiAgICAgICAgICAocHJldiwgY3VycmVudCkgPT4gcHJldiAmJiBwcmV2ID09PSBjdXJyZW50LnBhcmVudENvbHVtbiAmJiBjdXJyZW50LnBhcmVudENvbHVtbixcbiAgICAgICAgICBwaXZvdENvbHVtbnNbMF0ucGFyZW50Q29sdW1uXG4gICAgICAgIClcblxuICAgICAgICBsZXQgUGl2b3RHcm91cEhlYWRlciA9IGhhc0hlYWRlckdyb3VwcyAmJiBQaXZvdFBhcmVudENvbHVtbi5IZWFkZXJcbiAgICAgICAgUGl2b3RHcm91cEhlYWRlciA9IFBpdm90R3JvdXBIZWFkZXIgfHwgKCgpID0+IDxzdHJvbmc+UGl2b3RlZDwvc3Ryb25nPilcblxuICAgICAgICBsZXQgcGl2b3RDb2x1bW5Hcm91cCA9IHtcbiAgICAgICAgICBIZWFkZXI6IFBpdm90R3JvdXBIZWFkZXIsXG4gICAgICAgICAgY29sdW1uczogcGl2b3RDb2x1bW5zLm1hcChjb2wgPT4gKHtcbiAgICAgICAgICAgIC4uLnRoaXMucHJvcHMucGl2b3REZWZhdWx0cyxcbiAgICAgICAgICAgIC4uLmNvbCxcbiAgICAgICAgICAgIHBpdm90ZWQ6IHRydWUsXG4gICAgICAgICAgfSkpLFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGxhY2UgdGhlIHBpdm90Q29sdW1ucyBiYWNrIGludG8gdGhlIHZpc2libGVDb2x1bW5zXG4gICAgICAgIGlmIChwaXZvdEluZGV4ID49IDApIHtcbiAgICAgICAgICBwaXZvdENvbHVtbkdyb3VwID0ge1xuICAgICAgICAgICAgLi4udmlzaWJsZUNvbHVtbnNbcGl2b3RJbmRleF0sXG4gICAgICAgICAgICAuLi5waXZvdENvbHVtbkdyb3VwLFxuICAgICAgICAgIH1cbiAgICAgICAgICB2aXNpYmxlQ29sdW1ucy5zcGxpY2UocGl2b3RJbmRleCwgMSwgcGl2b3RDb2x1bW5Hcm91cClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2aXNpYmxlQ29sdW1ucy51bnNoaWZ0KHBpdm90Q29sdW1uR3JvdXApXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgSGVhZGVyIEdyb3Vwc1xuICAgICAgY29uc3QgaGVhZGVyR3JvdXBzID0gW11cbiAgICAgIGxldCBjdXJyZW50U3BhbiA9IFtdXG5cbiAgICAgIC8vIEEgY29udmVuaWVuY2UgZnVuY3Rpb24gdG8gYWRkIGEgaGVhZGVyIGFuZCByZXNldCB0aGUgY3VycmVudFNwYW5cbiAgICAgIGNvbnN0IGFkZEhlYWRlciA9IChjb2x1bW5zLCBjb2x1bW4pID0+IHtcbiAgICAgICAgaGVhZGVyR3JvdXBzLnB1c2goe1xuICAgICAgICAgIC4uLnRoaXMucHJvcHMuY29sdW1uLFxuICAgICAgICAgIC4uLmNvbHVtbixcbiAgICAgICAgICBjb2x1bW5zLFxuICAgICAgICB9KVxuICAgICAgICBjdXJyZW50U3BhbiA9IFtdXG4gICAgICB9XG5cbiAgICAgIC8vIEJ1aWxkIGZsYXN0IGxpc3Qgb2YgYWxsVmlzaWJsZUNvbHVtbnMgYW5kIEhlYWRlckdyb3Vwc1xuICAgICAgdmlzaWJsZUNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgICBpZiAoY29sdW1uLmNvbHVtbnMpIHtcbiAgICAgICAgICBhbGxWaXNpYmxlQ29sdW1ucyA9IGFsbFZpc2libGVDb2x1bW5zLmNvbmNhdChjb2x1bW4uY29sdW1ucylcbiAgICAgICAgICBpZiAoY3VycmVudFNwYW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWRkSGVhZGVyKGN1cnJlbnRTcGFuKVxuICAgICAgICAgIH1cbiAgICAgICAgICBhZGRIZWFkZXIoY29sdW1uLmNvbHVtbnMsIGNvbHVtbilcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBhbGxWaXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbilcbiAgICAgICAgY3VycmVudFNwYW4ucHVzaChjb2x1bW4pXG4gICAgICB9KVxuICAgICAgaWYgKGhhc0hlYWRlckdyb3VwcyAmJiBjdXJyZW50U3Bhbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFkZEhlYWRlcihjdXJyZW50U3BhbilcbiAgICAgIH1cblxuICAgICAgLy8gQWNjZXNzIHRoZSBkYXRhXG4gICAgICBjb25zdCBhY2Nlc3NSb3cgPSAoZCwgaSwgbGV2ZWwgPSAwKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHtcbiAgICAgICAgICBbb3JpZ2luYWxLZXldOiBkLFxuICAgICAgICAgIFtpbmRleEtleV06IGksXG4gICAgICAgICAgW3N1YlJvd3NLZXldOiBkW3N1YlJvd3NLZXldLFxuICAgICAgICAgIFtuZXN0aW5nTGV2ZWxLZXldOiBsZXZlbCxcbiAgICAgICAgfVxuICAgICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHtcbiAgICAgICAgICBpZiAoY29sdW1uLmV4cGFuZGVyKSByZXR1cm5cbiAgICAgICAgICByb3dbY29sdW1uLmlkXSA9IGNvbHVtbi5hY2Nlc3NvcihkKVxuICAgICAgICB9KVxuICAgICAgICBpZiAocm93W3N1YlJvd3NLZXldKSB7XG4gICAgICAgICAgcm93W3N1YlJvd3NLZXldID0gcm93W3N1YlJvd3NLZXldLm1hcCgoZCwgaSkgPT4gYWNjZXNzUm93KGQsIGksIGxldmVsICsgMSkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvd1xuICAgICAgfVxuXG4gICAgICAvLyAvLyBJZiB0aGUgZGF0YSBoYXNuJ3QgY2hhbmdlZCwganVzdCB1c2UgdGhlIGNhY2hlZCBkYXRhXG4gICAgICBsZXQgcmVzb2x2ZWREYXRhID0gdGhpcy5yZXNvbHZlZERhdGFcbiAgICAgIC8vIElmIHRoZSBkYXRhIGhhcyBjaGFuZ2VkLCBydW4gdGhlIGRhdGEgcmVzb2x2ZXIgYW5kIGNhY2hlIHRoZSByZXN1bHRcbiAgICAgIGlmICghdGhpcy5yZXNvbHZlZERhdGEgfHwgZGF0YUNoYW5nZWQpIHtcbiAgICAgICAgcmVzb2x2ZWREYXRhID0gcmVzb2x2ZURhdGEoZGF0YSlcbiAgICAgICAgdGhpcy5yZXNvbHZlZERhdGEgPSByZXNvbHZlZERhdGFcbiAgICAgIH1cbiAgICAgIC8vIFVzZSB0aGUgcmVzb2x2ZWQgZGF0YVxuICAgICAgcmVzb2x2ZWREYXRhID0gcmVzb2x2ZWREYXRhLm1hcCgoZCwgaSkgPT4gYWNjZXNzUm93KGQsIGkpKVxuXG4gICAgICAvLyBUT0RPOiBNYWtlIGl0IHBvc3NpYmxlIHRvIGZhYnJpY2F0ZSBuZXN0ZWQgcm93cyB3aXRob3V0IHBpdm90aW5nXG4gICAgICBjb25zdCBhZ2dyZWdhdGluZ0NvbHVtbnMgPSBhbGxWaXNpYmxlQ29sdW1ucy5maWx0ZXIoZCA9PiAhZC5leHBhbmRlciAmJiBkLmFnZ3JlZ2F0ZSlcblxuICAgICAgLy8gSWYgcGl2b3RpbmcsIHJlY3Vyc2l2ZWx5IGdyb3VwIHRoZSBkYXRhXG4gICAgICBjb25zdCBhZ2dyZWdhdGUgPSByb3dzID0+IHtcbiAgICAgICAgY29uc3QgYWdncmVnYXRpb25WYWx1ZXMgPSB7fVxuICAgICAgICBhZ2dyZWdhdGluZ0NvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IHJvd3MubWFwKGQgPT4gZFtjb2x1bW4uaWRdKVxuICAgICAgICAgIGFnZ3JlZ2F0aW9uVmFsdWVzW2NvbHVtbi5pZF0gPSBjb2x1bW4uYWdncmVnYXRlKHZhbHVlcywgcm93cylcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGFnZ3JlZ2F0aW9uVmFsdWVzXG4gICAgICB9XG4gICAgICBpZiAocGl2b3RCeS5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgZ3JvdXBSZWN1cnNpdmVseSA9IChyb3dzLCBrZXlzLCBpID0gMCkgPT4ge1xuICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGxhc3QgbGV2ZWwsIGp1c3QgcmV0dXJuIHRoZSByb3dzXG4gICAgICAgICAgaWYgKGkgPT09IGtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gcm93c1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBHcm91cCB0aGUgcm93cyB0b2dldGhlciBmb3IgdGhpcyBsZXZlbFxuICAgICAgICAgIGxldCBncm91cGVkUm93cyA9IE9iamVjdC5lbnRyaWVzKF8uZ3JvdXBCeShyb3dzLCBrZXlzW2ldKSkubWFwKChba2V5LCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBbcGl2b3RJREtleV06IGtleXNbaV0sXG4gICAgICAgICAgICBbcGl2b3RWYWxLZXldOiBrZXksXG4gICAgICAgICAgICBba2V5c1tpXV06IGtleSxcbiAgICAgICAgICAgIFtzdWJSb3dzS2V5XTogdmFsdWUsXG4gICAgICAgICAgICBbbmVzdGluZ0xldmVsS2V5XTogaSxcbiAgICAgICAgICAgIFtncm91cGVkQnlQaXZvdEtleV06IHRydWUsXG4gICAgICAgICAgfSkpXG4gICAgICAgICAgLy8gUmVjdXJzZSBpbnRvIHRoZSBzdWJSb3dzXG4gICAgICAgICAgZ3JvdXBlZFJvd3MgPSBncm91cGVkUm93cy5tYXAocm93R3JvdXAgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3ViUm93cyA9IGdyb3VwUmVjdXJzaXZlbHkocm93R3JvdXBbc3ViUm93c0tleV0sIGtleXMsIGkgKyAxKVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgLi4ucm93R3JvdXAsXG4gICAgICAgICAgICAgIFtzdWJSb3dzS2V5XTogc3ViUm93cyxcbiAgICAgICAgICAgICAgW2FnZ3JlZ2F0ZWRLZXldOiB0cnVlLFxuICAgICAgICAgICAgICAuLi5hZ2dyZWdhdGUoc3ViUm93cyksXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gZ3JvdXBlZFJvd3NcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlZERhdGEgPSBncm91cFJlY3Vyc2l2ZWx5KHJlc29sdmVkRGF0YSwgcGl2b3RCeSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ubmV3U3RhdGUsXG4gICAgICAgIHJlc29sdmVkRGF0YSxcbiAgICAgICAgYWxsVmlzaWJsZUNvbHVtbnMsXG4gICAgICAgIGhlYWRlckdyb3VwcyxcbiAgICAgICAgYWxsRGVjb3JhdGVkQ29sdW1ucyxcbiAgICAgICAgaGFzSGVhZGVyR3JvdXBzLFxuICAgICAgfVxuICAgIH1cblxuICAgIGdldFNvcnRlZERhdGEgKHJlc29sdmVkU3RhdGUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbWFudWFsLFxuICAgICAgICBzb3J0ZWQsXG4gICAgICAgIGZpbHRlcmVkLFxuICAgICAgICBkZWZhdWx0RmlsdGVyTWV0aG9kLFxuICAgICAgICByZXNvbHZlZERhdGEsXG4gICAgICAgIGFsbFZpc2libGVDb2x1bW5zLFxuICAgICAgICBhbGxEZWNvcmF0ZWRDb2x1bW5zLFxuICAgICAgfSA9IHJlc29sdmVkU3RhdGVcblxuICAgICAgY29uc3Qgc29ydE1ldGhvZHNCeUNvbHVtbklEID0ge31cblxuICAgICAgYWxsRGVjb3JhdGVkQ29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5zb3J0TWV0aG9kKS5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgIHNvcnRNZXRob2RzQnlDb2x1bW5JRFtjb2wuaWRdID0gY29sLnNvcnRNZXRob2RcbiAgICAgIH0pXG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIGRhdGEgZnJvbSBlaXRoZXIgbWFudWFsIGRhdGEgb3Igc29ydGVkIGRhdGFcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvcnRlZERhdGE6IG1hbnVhbFxuICAgICAgICAgID8gcmVzb2x2ZWREYXRhXG4gICAgICAgICAgOiB0aGlzLnNvcnREYXRhKFxuICAgICAgICAgICAgdGhpcy5maWx0ZXJEYXRhKHJlc29sdmVkRGF0YSwgZmlsdGVyZWQsIGRlZmF1bHRGaWx0ZXJNZXRob2QsIGFsbFZpc2libGVDb2x1bW5zKSxcbiAgICAgICAgICAgIHNvcnRlZCxcbiAgICAgICAgICAgIHNvcnRNZXRob2RzQnlDb2x1bW5JRFxuICAgICAgICAgICksXG4gICAgICB9XG4gICAgfVxuXG4gICAgZmlyZUZldGNoRGF0YSAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uRmV0Y2hEYXRhKHRoaXMuZ2V0UmVzb2x2ZWRTdGF0ZSgpLCB0aGlzKVxuICAgIH1cblxuICAgIGdldFByb3BPclN0YXRlIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmdldEZpcnN0RGVmaW5lZCh0aGlzLnByb3BzW2tleV0sIHRoaXMuc3RhdGVba2V5XSlcbiAgICB9XG5cbiAgICBnZXRTdGF0ZU9yUHJvcCAoa2V5KSB7XG4gICAgICByZXR1cm4gXy5nZXRGaXJzdERlZmluZWQodGhpcy5zdGF0ZVtrZXldLCB0aGlzLnByb3BzW2tleV0pXG4gICAgfVxuXG4gICAgZmlsdGVyRGF0YSAoZGF0YSwgZmlsdGVyZWQsIGRlZmF1bHRGaWx0ZXJNZXRob2QsIGFsbFZpc2libGVDb2x1bW5zKSB7XG4gICAgICBsZXQgZmlsdGVyZWREYXRhID0gZGF0YVxuXG4gICAgICBpZiAoZmlsdGVyZWQubGVuZ3RoKSB7XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IGZpbHRlcmVkLnJlZHVjZSgoZmlsdGVyZWRTb0ZhciwgbmV4dEZpbHRlcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IGFsbFZpc2libGVDb2x1bW5zLmZpbmQoeCA9PiB4LmlkID09PSBuZXh0RmlsdGVyLmlkKVxuXG4gICAgICAgICAgLy8gRG9uJ3QgZmlsdGVyIGhpZGRlbiBjb2x1bW5zIG9yIGNvbHVtbnMgdGhhdCBoYXZlIGhhZCB0aGVpciBmaWx0ZXJzIGRpc2FibGVkXG4gICAgICAgICAgaWYgKCFjb2x1bW4gfHwgY29sdW1uLmZpbHRlcmFibGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRTb0ZhclxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGZpbHRlck1ldGhvZCA9IGNvbHVtbi5maWx0ZXJNZXRob2QgfHwgZGVmYXVsdEZpbHRlck1ldGhvZFxuXG4gICAgICAgICAgLy8gSWYgJ2ZpbHRlckFsbCcgaXMgc2V0IHRvIHRydWUsIHBhc3MgdGhlIGVudGlyZSBkYXRhc2V0IHRvIHRoZSBmaWx0ZXIgbWV0aG9kXG4gICAgICAgICAgaWYgKGNvbHVtbi5maWx0ZXJBbGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJNZXRob2QobmV4dEZpbHRlciwgZmlsdGVyZWRTb0ZhciwgY29sdW1uKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmlsdGVyZWRTb0Zhci5maWx0ZXIocm93ID0+IGZpbHRlck1ldGhvZChuZXh0RmlsdGVyLCByb3csIGNvbHVtbikpXG4gICAgICAgIH0sIGZpbHRlcmVkRGF0YSlcblxuICAgICAgICAvLyBBcHBseSB0aGUgZmlsdGVyIHRvIHRoZSBzdWJyb3dzIGlmIHdlIGFyZSBwaXZvdGluZywgYW5kIHRoZW5cbiAgICAgICAgLy8gZmlsdGVyIGFueSByb3dzIHdpdGhvdXQgc3ViY29sdW1ucyBiZWNhdXNlIGl0IHdvdWxkIGJlIHN0cmFuZ2UgdG8gc2hvd1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBmaWx0ZXJlZERhdGFcbiAgICAgICAgICAubWFwKHJvdyA9PiB7XG4gICAgICAgICAgICBpZiAoIXJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldKSB7XG4gICAgICAgICAgICAgIHJldHVybiByb3dcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIC4uLnJvdyxcbiAgICAgICAgICAgICAgW3RoaXMucHJvcHMuc3ViUm93c0tleV06IHRoaXMuZmlsdGVyRGF0YShcbiAgICAgICAgICAgICAgICByb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0RmlsdGVyTWV0aG9kLFxuICAgICAgICAgICAgICAgIGFsbFZpc2libGVDb2x1bW5zXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB7XG4gICAgICAgICAgICBpZiAoIXJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcm93W3RoaXMucHJvcHMuc3ViUm93c0tleV0ubGVuZ3RoID4gMFxuICAgICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaWx0ZXJlZERhdGFcbiAgICB9XG5cbiAgICBzb3J0RGF0YSAoZGF0YSwgc29ydGVkLCBzb3J0TWV0aG9kc0J5Q29sdW1uSUQgPSB7fSkge1xuICAgICAgaWYgKCFzb3J0ZWQubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNvcnRlZERhdGEgPSAodGhpcy5wcm9wcy5vcmRlckJ5TWV0aG9kIHx8IF8ub3JkZXJCeSkoXG4gICAgICAgIGRhdGEsXG4gICAgICAgIHNvcnRlZC5tYXAoc29ydCA9PiB7XG4gICAgICAgICAgLy8gU3VwcG9ydCBjdXN0b20gc29ydGluZyBtZXRob2RzIGZvciBlYWNoIGNvbHVtblxuICAgICAgICAgIGlmIChzb3J0TWV0aG9kc0J5Q29sdW1uSURbc29ydC5pZF0pIHtcbiAgICAgICAgICAgIHJldHVybiAoYSwgYikgPT4gc29ydE1ldGhvZHNCeUNvbHVtbklEW3NvcnQuaWRdKGFbc29ydC5pZF0sIGJbc29ydC5pZF0sIHNvcnQuZGVzYywgYSwgYilcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIChhLCBiKSA9PiB0aGlzLnByb3BzLmRlZmF1bHRTb3J0TWV0aG9kKGFbc29ydC5pZF0sIGJbc29ydC5pZF0sIHNvcnQuZGVzYywgYSwgYilcbiAgICAgICAgfSksXG4gICAgICAgIHNvcnRlZC5tYXAoZCA9PiAhZC5kZXNjKSxcbiAgICAgICAgdGhpcy5wcm9wcy5pbmRleEtleVxuICAgICAgKVxuXG4gICAgICBzb3J0ZWREYXRhLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgaWYgKCFyb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHJvd1t0aGlzLnByb3BzLnN1YlJvd3NLZXldID0gdGhpcy5zb3J0RGF0YShcbiAgICAgICAgICByb3dbdGhpcy5wcm9wcy5zdWJSb3dzS2V5XSxcbiAgICAgICAgICBzb3J0ZWQsXG4gICAgICAgICAgc29ydE1ldGhvZHNCeUNvbHVtbklEXG4gICAgICAgIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBzb3J0ZWREYXRhXG4gICAgfVxuXG4gICAgZ2V0TWluUm93cyAoKSB7XG4gICAgICByZXR1cm4gXy5nZXRGaXJzdERlZmluZWQodGhpcy5wcm9wcy5taW5Sb3dzLCB0aGlzLmdldFN0YXRlT3JQcm9wKCdwYWdlU2l6ZScpKVxuICAgIH1cblxuICAgIC8vIFVzZXIgYWN0aW9uc1xuICAgIG9uUGFnZUNoYW5nZSAocGFnZSkge1xuICAgICAgY29uc3QgeyBvblBhZ2VDaGFuZ2UsIGNvbGxhcHNlT25QYWdlQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG5cbiAgICAgIGNvbnN0IG5ld1N0YXRlID0geyBwYWdlIH1cbiAgICAgIGlmIChjb2xsYXBzZU9uUGFnZUNoYW5nZSkge1xuICAgICAgICBuZXdTdGF0ZS5leHBhbmRlZCA9IHt9XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEobmV3U3RhdGUsICgpID0+IG9uUGFnZUNoYW5nZSAmJiBvblBhZ2VDaGFuZ2UocGFnZSkpXG4gICAgfVxuXG4gICAgb25QYWdlU2l6ZUNoYW5nZSAobmV3UGFnZVNpemUpIHtcbiAgICAgIGNvbnN0IHsgb25QYWdlU2l6ZUNoYW5nZSB9ID0gdGhpcy5wcm9wc1xuICAgICAgY29uc3QgeyBwYWdlU2l6ZSwgcGFnZSB9ID0gdGhpcy5nZXRSZXNvbHZlZFN0YXRlKClcblxuICAgICAgLy8gTm9ybWFsaXplIHRoZSBwYWdlIHRvIGRpc3BsYXlcbiAgICAgIGNvbnN0IGN1cnJlbnRSb3cgPSBwYWdlU2l6ZSAqIHBhZ2VcbiAgICAgIGNvbnN0IG5ld1BhZ2UgPSBNYXRoLmZsb29yKGN1cnJlbnRSb3cgLyBuZXdQYWdlU2l6ZSlcblxuICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKFxuICAgICAgICB7XG4gICAgICAgICAgcGFnZVNpemU6IG5ld1BhZ2VTaXplLFxuICAgICAgICAgIHBhZ2U6IG5ld1BhZ2UsXG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IG9uUGFnZVNpemVDaGFuZ2UgJiYgb25QYWdlU2l6ZUNoYW5nZShuZXdQYWdlU2l6ZSwgbmV3UGFnZSlcbiAgICAgIClcbiAgICB9XG5cbiAgICBzb3J0Q29sdW1uIChjb2x1bW4sIGFkZGl0aXZlKSB7XG4gICAgICBjb25zdCB7IHNvcnRlZCwgc2tpcE5leHRTb3J0LCBkZWZhdWx0U29ydERlc2MgfSA9IHRoaXMuZ2V0UmVzb2x2ZWRTdGF0ZSgpXG5cbiAgICAgIGNvbnN0IGZpcnN0U29ydERpcmVjdGlvbiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb2x1bW4sICdkZWZhdWx0U29ydERlc2MnKVxuICAgICAgICA/IGNvbHVtbi5kZWZhdWx0U29ydERlc2NcbiAgICAgICAgOiBkZWZhdWx0U29ydERlc2NcbiAgICAgIGNvbnN0IHNlY29uZFNvcnREaXJlY3Rpb24gPSAhZmlyc3RTb3J0RGlyZWN0aW9uXG5cbiAgICAgIC8vIHdlIGNhbid0IHN0b3AgZXZlbnQgcHJvcGFnYXRpb24gZnJvbSB0aGUgY29sdW1uIHJlc2l6ZSBtb3ZlIGhhbmRsZXJzXG4gICAgICAvLyBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgYmVjYXVzZSBvZiByZWFjdCdzIHN5bnRoZXRpYyBldmVudHNcbiAgICAgIC8vIHNvIHdlIGhhdmUgdG8gcHJldmVudCB0aGUgc29ydCBmdW5jdGlvbiBmcm9tIGFjdHVhbGx5IHNvcnRpbmdcbiAgICAgIC8vIGlmIHdlIGNsaWNrIG9uIHRoZSBjb2x1bW4gcmVzaXplIGVsZW1lbnQgd2l0aGluIGEgaGVhZGVyLlxuICAgICAgaWYgKHNraXBOZXh0U29ydCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoe1xuICAgICAgICAgIHNraXBOZXh0U29ydDogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCB7IG9uU29ydGVkQ2hhbmdlIH0gPSB0aGlzLnByb3BzXG5cbiAgICAgIGxldCBuZXdTb3J0ZWQgPSBfLmNsb25lKHNvcnRlZCB8fCBbXSkubWFwKGQgPT4ge1xuICAgICAgICBkLmRlc2MgPSBfLmlzU29ydGluZ0Rlc2MoZClcbiAgICAgICAgcmV0dXJuIGRcbiAgICAgIH0pXG4gICAgICBpZiAoIV8uaXNBcnJheShjb2x1bW4pKSB7XG4gICAgICAgIC8vIFNpbmdsZS1Tb3J0XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSW5kZXggPSBuZXdTb3J0ZWQuZmluZEluZGV4KGQgPT4gZC5pZCA9PT0gY29sdW1uLmlkKVxuICAgICAgICBpZiAoZXhpc3RpbmdJbmRleCA+IC0xKSB7XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBuZXdTb3J0ZWRbZXhpc3RpbmdJbmRleF1cbiAgICAgICAgICBpZiAoZXhpc3RpbmcuZGVzYyA9PT0gc2Vjb25kU29ydERpcmVjdGlvbikge1xuICAgICAgICAgICAgaWYgKGFkZGl0aXZlKSB7XG4gICAgICAgICAgICAgIG5ld1NvcnRlZC5zcGxpY2UoZXhpc3RpbmdJbmRleCwgMSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV4aXN0aW5nLmRlc2MgPSBmaXJzdFNvcnREaXJlY3Rpb25cbiAgICAgICAgICAgICAgbmV3U29ydGVkID0gW2V4aXN0aW5nXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGlzdGluZy5kZXNjID0gc2Vjb25kU29ydERpcmVjdGlvblxuICAgICAgICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICAgICAgICBuZXdTb3J0ZWQgPSBbZXhpc3RpbmddXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGFkZGl0aXZlKSB7XG4gICAgICAgICAgbmV3U29ydGVkLnB1c2goe1xuICAgICAgICAgICAgaWQ6IGNvbHVtbi5pZCxcbiAgICAgICAgICAgIGRlc2M6IGZpcnN0U29ydERpcmVjdGlvbixcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1NvcnRlZCA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6IGNvbHVtbi5pZCxcbiAgICAgICAgICAgICAgZGVzYzogZmlyc3RTb3J0RGlyZWN0aW9uLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11bHRpLVNvcnRcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IG5ld1NvcnRlZC5maW5kSW5kZXgoZCA9PiBkLmlkID09PSBjb2x1bW5bMF0uaWQpXG4gICAgICAgIC8vIEV4aXN0aW5nIFNvcnRlZCBDb2x1bW5cbiAgICAgICAgaWYgKGV4aXN0aW5nSW5kZXggPiAtMSkge1xuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gbmV3U29ydGVkW2V4aXN0aW5nSW5kZXhdXG4gICAgICAgICAgaWYgKGV4aXN0aW5nLmRlc2MgPT09IHNlY29uZFNvcnREaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIGlmIChhZGRpdGl2ZSkge1xuICAgICAgICAgICAgICBuZXdTb3J0ZWQuc3BsaWNlKGV4aXN0aW5nSW5kZXgsIGNvbHVtbi5sZW5ndGgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb2x1bW4uZm9yRWFjaCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIG5ld1NvcnRlZFtleGlzdGluZ0luZGV4ICsgaV0uZGVzYyA9IGZpcnN0U29ydERpcmVjdGlvblxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb2x1bW4uZm9yRWFjaCgoZCwgaSkgPT4ge1xuICAgICAgICAgICAgICBuZXdTb3J0ZWRbZXhpc3RpbmdJbmRleCArIGldLmRlc2MgPSBzZWNvbmRTb3J0RGlyZWN0aW9uXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgICAgICBuZXdTb3J0ZWQgPSBuZXdTb3J0ZWQuc2xpY2UoZXhpc3RpbmdJbmRleCwgY29sdW1uLmxlbmd0aClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTmV3IFNvcnQgQ29sdW1uXG4gICAgICAgIH0gZWxzZSBpZiAoYWRkaXRpdmUpIHtcbiAgICAgICAgICBuZXdTb3J0ZWQgPSBuZXdTb3J0ZWQuY29uY2F0KFxuICAgICAgICAgICAgY29sdW1uLm1hcChkID0+ICh7XG4gICAgICAgICAgICAgIGlkOiBkLmlkLFxuICAgICAgICAgICAgICBkZXNjOiBmaXJzdFNvcnREaXJlY3Rpb24sXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3U29ydGVkID0gY29sdW1uLm1hcChkID0+ICh7XG4gICAgICAgICAgICBpZDogZC5pZCxcbiAgICAgICAgICAgIGRlc2M6IGZpcnN0U29ydERpcmVjdGlvbixcbiAgICAgICAgICB9KSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICBwYWdlOiAoIXNvcnRlZC5sZW5ndGggJiYgbmV3U29ydGVkLmxlbmd0aCkgfHwgIWFkZGl0aXZlID8gMCA6IHRoaXMuc3RhdGUucGFnZSxcbiAgICAgICAgICBzb3J0ZWQ6IG5ld1NvcnRlZCxcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4gb25Tb3J0ZWRDaGFuZ2UgJiYgb25Tb3J0ZWRDaGFuZ2UobmV3U29ydGVkLCBjb2x1bW4sIGFkZGl0aXZlKVxuICAgICAgKVxuICAgIH1cblxuICAgIGZpbHRlckNvbHVtbiAoY29sdW1uLCB2YWx1ZSkge1xuICAgICAgY29uc3QgeyBmaWx0ZXJlZCB9ID0gdGhpcy5nZXRSZXNvbHZlZFN0YXRlKClcbiAgICAgIGNvbnN0IHsgb25GaWx0ZXJlZENoYW5nZSB9ID0gdGhpcy5wcm9wc1xuXG4gICAgICAvLyBSZW1vdmUgb2xkIGZpbHRlciBmaXJzdCBpZiBpdCBleGlzdHNcbiAgICAgIGNvbnN0IG5ld0ZpbHRlcmluZyA9IChmaWx0ZXJlZCB8fCBbXSkuZmlsdGVyKHggPT4geC5pZCAhPT0gY29sdW1uLmlkKVxuXG4gICAgICBpZiAodmFsdWUgIT09ICcnKSB7XG4gICAgICAgIG5ld0ZpbHRlcmluZy5wdXNoKHtcbiAgICAgICAgICBpZDogY29sdW1uLmlkLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlV2l0aERhdGEoXG4gICAgICAgIHtcbiAgICAgICAgICBmaWx0ZXJlZDogbmV3RmlsdGVyaW5nLFxuICAgICAgICB9LFxuICAgICAgICAoKSA9PiBvbkZpbHRlcmVkQ2hhbmdlICYmIG9uRmlsdGVyZWRDaGFuZ2UobmV3RmlsdGVyaW5nLCBjb2x1bW4sIHZhbHVlKVxuICAgICAgKVxuICAgIH1cblxuICAgIHJlc2l6ZUNvbHVtblN0YXJ0IChldmVudCwgY29sdW1uLCBpc1RvdWNoKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgY29uc3QgcGFyZW50V2lkdGggPSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuXG4gICAgICBsZXQgcGFnZVhcbiAgICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICAgIHBhZ2VYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZXZlbnQucGFnZVhcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmFwRXZlbnRzID0gdHJ1ZVxuICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKFxuICAgICAgICB7XG4gICAgICAgICAgY3VycmVudGx5UmVzaXppbmc6IHtcbiAgICAgICAgICAgIGlkOiBjb2x1bW4uaWQsXG4gICAgICAgICAgICBzdGFydFg6IHBhZ2VYLFxuICAgICAgICAgICAgcGFyZW50V2lkdGgsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMucmVzaXplQ29sdW1uRW5kKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICByZXNpemVDb2x1bW5Nb3ZpbmcgKGV2ZW50KSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgY29uc3QgeyBvblJlc2l6ZWRDaGFuZ2UgfSA9IHRoaXMucHJvcHNcbiAgICAgIGNvbnN0IHsgcmVzaXplZCwgY3VycmVudGx5UmVzaXppbmcgfSA9IHRoaXMuZ2V0UmVzb2x2ZWRTdGF0ZSgpXG5cbiAgICAgIC8vIERlbGV0ZSBvbGQgdmFsdWVcbiAgICAgIGNvbnN0IG5ld1Jlc2l6ZWQgPSByZXNpemVkLmZpbHRlcih4ID0+IHguaWQgIT09IGN1cnJlbnRseVJlc2l6aW5nLmlkKVxuXG4gICAgICBsZXQgcGFnZVhcblxuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgIHBhZ2VYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVhcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlbW92ZScpIHtcbiAgICAgICAgcGFnZVggPSBldmVudC5wYWdlWFxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIG1pbiBzaXplIHRvIDEwIHRvIGFjY291bnQgZm9yIG1hcmdpbiBhbmQgYm9yZGVyIG9yIGVsc2UgdGhlXG4gICAgICAvLyBncm91cCBoZWFkZXJzIGRvbid0IGxpbmUgdXAgY29ycmVjdGx5XG4gICAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWF4KFxuICAgICAgICBjdXJyZW50bHlSZXNpemluZy5wYXJlbnRXaWR0aCArIHBhZ2VYIC0gY3VycmVudGx5UmVzaXppbmcuc3RhcnRYLFxuICAgICAgICAxMVxuICAgICAgKVxuXG4gICAgICBuZXdSZXNpemVkLnB1c2goe1xuICAgICAgICBpZDogY3VycmVudGx5UmVzaXppbmcuaWQsXG4gICAgICAgIHZhbHVlOiBuZXdXaWR0aCxcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0U3RhdGVXaXRoRGF0YShcbiAgICAgICAge1xuICAgICAgICAgIHJlc2l6ZWQ6IG5ld1Jlc2l6ZWQsXG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IG9uUmVzaXplZENoYW5nZSAmJiBvblJlc2l6ZWRDaGFuZ2UobmV3UmVzaXplZCwgZXZlbnQpXG4gICAgICApXG4gICAgfVxuXG4gICAgcmVzaXplQ29sdW1uRW5kIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIGNvbnN0IGlzVG91Y2ggPSBldmVudC50eXBlID09PSAndG91Y2hlbmQnIHx8IGV2ZW50LnR5cGUgPT09ICd0b3VjaGNhbmNlbCdcblxuICAgICAgaWYgKGlzVG91Y2gpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5yZXNpemVDb2x1bW5Nb3ZpbmcpXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5yZXNpemVDb2x1bW5FbmQpXG4gICAgICB9XG5cbiAgICAgIC8vIElmIGl0cyBhIHRvdWNoIGV2ZW50IGNsZWFyIHRoZSBtb3VzZSBvbmUncyBhcyB3ZWxsIGJlY2F1c2Ugc29tZXRpbWVzXG4gICAgICAvLyB0aGUgbW91c2VEb3duIGV2ZW50IGdldHMgY2FsbGVkIGFzIHdlbGwsIGJ1dCB0aGUgbW91c2VVcCBldmVudCBkb2Vzbid0XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbk1vdmluZylcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLnJlc2l6ZUNvbHVtbkVuZClcblxuICAgICAgLy8gVGhlIHRvdWNoIGV2ZW50cyBkb24ndCBwcm9wYWdhdGUgdXAgdG8gdGhlIHNvcnRpbmcncyBvbk1vdXNlRG93biBldmVudCBzb1xuICAgICAgLy8gbm8gbmVlZCB0byBwcmV2ZW50IGl0IGZyb20gaGFwcGVuaW5nIG9yIGVsc2UgdGhlIGZpcnN0IGNsaWNrIGFmdGVyIGEgdG91Y2hcbiAgICAgIC8vIGV2ZW50IHJlc2l6ZSB3aWxsIG5vdCBzb3J0IHRoZSBjb2x1bW4uXG4gICAgICBpZiAoIWlzVG91Y2gpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZVdpdGhEYXRhKHtcbiAgICAgICAgICBza2lwTmV4dFNvcnQ6IHRydWUsXG4gICAgICAgICAgY3VycmVudGx5UmVzaXppbmc6IGZhbHNlLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuIl19