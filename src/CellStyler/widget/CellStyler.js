import {
    defineWidget,
    log,
    runCallback,
    findWidgetByName,
} from 'widget-base-helpers';

import domClass from 'dojo/dom-class';
import query from 'dojo/query';
import aspect from 'dojo/aspect';
import construct from 'dojo/dom-construct';

export default defineWidget('CellStyler', false, {

    _obj: null,
    _grid: null,

    constructor() {
        this.log = log.bind(this);
        this.runCallback = runCallback.bind(this);
    },

    postCreate() {
        log.call(this, 'postCreate', this._WIDGET_VERSION);
    },

    update(obj, callback) {
        if (obj) {
            this._contextObj = obj;
        }

        this._grid = findWidgetByName(this.gridName);
        aspect.after(this._grid, "refreshGrid", this._evalRules.bind(this));

        if(callback) {callback();}
    },
    _evalRules() {
        let rule, rowObj;
        for (rowObj of this._grid._dataSource._pageObjs) {
            const rowId = this._grid.getRowForMxObject(rowObj);
            const rowNode = this._grid._gridRowNodes[ rowId ];

            for (rule of this.rules) {
                if (this._evalJS(rule.js, rowObj)) {
                    const nodeToApply = rule.columnName ? query(".mx-name-" + rule.columnName, rowNode)[ 0 ] : rowNode;
                    domClass.add(nodeToApply, rule.className);
                }
            }
        }
    },
    _evalJS(js, rowObj) {
        const contextObj = this._contextObj;
        try {
            const myFunc = new Function("contextObj", "rowObj", js); // eslint-disable-line no-new-func
            const returnVal = myFunc(contextObj, rowObj); // eslint-disable-line no-new-func
            return true === returnVal;
        } catch (e) {
            construct.place("<div class=\"alert alert-danger\">Error while evaluating javascript input: " +
                e + "</div>", this.domNode, "only");
            return false;
        }
    },
});
