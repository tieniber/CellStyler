import {
    defineWidget,
    log,
    runCallback,
    findElement,
} from 'widget-base-helpers';

import domClass from 'dojo/dom-class';
import query from 'dojo/query';
import aspect from 'dojo/aspect';
import construct from 'dojo/dom-construct';
import registry from 'dijit/registry';

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

        this._gridNode = findElement(".mx-name-" + this.gridName, this.domNode.parentNode);
        this._grid = registry.byNode(this._gridNode);
        aspect.after(this._grid, "refreshGrid", this._evalRules.bind(this));

        if(callback) {callback();}
    },
    _evalRules() {
        let rule, rowObj;
        for (rowObj of this._grid._dataSource._pageObjs) {
            const rowId = this._grid.getRowForMxObject(rowObj);
            const rowNode = this._grid._gridRowNodes[ rowId ];
            const handleResults = this._handleResults;
            const callbackFunc = function(nodeToApply, className) {
                return function(result) {
                    handleResults(result, nodeToApply, className);
                };
            };

            for (rule of this.rules) {
                const nodeToApply = rule.columnName ? query(".mx-name-" + rule.columnName, rowNode)[ 0 ] : rowNode;
                if (rule.ruleNanoflow && rule.ruleNanoflow.nanoflow) {
                    this._evalNanoFlow(rule.ruleNanoflow, rowObj, callbackFunc(nodeToApply, rule.className));
                } else {
                    const result = this._evalJS(rule.js, rowObj);
                    this._handleResults(result, nodeToApply, rule.className);
                }
            }
        }
    },
    _evalNanoFlow(nanoflow, obj, callback) {
        const context = new mendix.lib.MxContext();
        context.setTrackObject(obj);
        window.mx.data.callNanoflow({
            nanoflow: nanoflow,
            context: context,
            origin: this.mxform,
            callback: callback,
            error: function(){console.error("Unable to execute rule nanoflow");},
        });
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
    _handleResults(result, nodeToApply, className) {
        if (result) {
            domClass.add(nodeToApply, className);
        } else {
            domClass.remove(nodeToApply, className);
        }
    },
});
