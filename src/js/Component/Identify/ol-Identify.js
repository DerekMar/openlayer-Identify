import "./ol-Identify.css";
import Control from 'ol/control/control';
import Observable from 'ol/observable';

import FeatureHighLight from './utils/FeatureHighLight/ol-FeatureHighLight-Utils';
import FeatureLayerHelper from './utils/FeatureLayer/ol-FeatureLayer-Utils';
import MapDrawHelper from './utils/MapSelection/ol-MapSelection-Utils';
import MapCoordinateHelper from './utils/MapCoordinate/ol-MapCoordinate-Utils';
import IdentifyLayerTypeSelect from './component/TypeSelect/ol-Identify-TypeSelect';
import IdentifyFeatureLayerTree from './component/LayerTree/ol-Identify-FeatureLayerTree';
import IdentifyFeatureAttrTable from './component/AttrTable/ol-Identify-FeatureAttrTable';
import IdentifyFeatureToolbar from './component/ToolBar/ol-Identify-Toolbar';
import IdentifyFeatureTitlePanel from './component/TitlePanel/ol-Identify-TitlePanel';

/**
 * OpenLayers Feature Identify Control.
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
 * **`position`** `String` - the button positon. left right
 */
export default class identify extends Control{
    constructor(opt_options) {
        /**
         * external Args
         * @type {*|{Object}}
         */
        let options = opt_options || {};
        //This will be Container, the entry
        let element = document.createElement('div');
        super({element: element, render: options.render, target: options.target});
       //Add the element Css Class
        this.closeClassName = 'ol-unselectable ol-control identify';
        this.openClassName = 'shown';
        if (this._isTouchDevice()) {
            this.closeClassName += ' touch';
        }
        //declare the container positon
        this.position = !! options.position? options.position : "top";

        element.className = this.closeClassName + " " + this.position;

        //Map Evented Listeners Conventent to register and unregister
        this.mapListeners = [];

        //declare other variance
        this.button = null;     //entry button
        this.infoWindow = null; //result infowindow
        this.highlight = null;  // control the feature highlight
        this._mapDrawHelper = null; //map select region control

        this._toolbarContanier = null;// toolbar element
        this._layerTypeSelect = null;// layer type 's select element
        this._layerFeatureTree = null;// layer feature component
        this._featureSelected =  null;// feature which feature tree has selected
        this._featureAttrTable = null;// feature Attribute table component

        this.featureSelectedTree = null;// the tree for feature which has selected
        this.featureSelectedTreeContainer = null;// the tree container for feature which has selected
        this.featureAttributeTable = null;// the feature Attribute table element
        this.featureAttributeContainer = null;// thre feature Attribute container element

        this.featureTreeHiddenTool = null;  //featureTreeHiddenTool,which control the featureTree hidden
        this.featureAttrTableHiddenTool = null; //featureAttrTableHiddenTool, which control the featureAttrTabl hidden
    }

    /**
     * @desc show the Identify component
     * @public
     * @return {identify}
     */
    showIdenditfy(){
        //create the entry Button
        this._initEntryBtnElement(this.element);
        //create the result infoWindow
        this._initResultInfoWindow(this.element);
        return this;
    }
    /**
     * @private
     * @desc Create the Identify Button in Container
     */
    _initEntryBtnElement(element){
        this.button = document.createElement('button');
        this.button.setAttribute('title', "ol_Identify_");
        this.button.onclick = (e)=>{
            e = e || window.event;
            this.showOrCloseIdentify();
            e.preventDefault();
        };
        element.appendChild(this.button);
    }
    /**
     * @private
     * @desc Create the InfoWindow in Container
     */
    _initResultInfoWindow(element){
        this.infoWindow = document.createElement('div');
        //declare the container positon
        this.infoWindow.className = 'infoWindow';
        element.appendChild(this.infoWindow);
        this._enableTouchScroll(this.infoWindow);

        this._renderInfoWindowBase(this.infoWindow);
    }
    /**
     * Set the map instance the control is associated with.
     * @param {ol.Map} map The map instance.
     */
    setMap(map) {
        // Clean up listeners associated with the previous map
        this._destroyMapListener();
        // Wire up listeners etc. and store reference to new map
        super.setMap(map);

        return this;
    }
    /**
     * @public
     * @desc Show or Close the infoWindow on the Screen, auto check!!
     */
    showOrCloseIdentify(){
        if (!this.element.classList.contains(this.openClassName)) {
            this._showSpecificContainer(this.element, this._startSelectFeatures);
        }else{
            this._hideSpecificContainer(this.element, this._cancleSelectFeatures);
        }
        return this;
    }
    /**
     * @public
     * @desc Show the infoWindow on the Screen
     */
    showIdentify() {
        this._showSpecificContainer(this.element);
        return this;
    }
    /**
     * @public
     * @desc Hide the infoWindow on the Screen
     */
    closeIdentify(){
        this._hideSpecificContainer(this.element);
        return this;
    }

    /**
     * @private
     * @desc change the cursor to identify,and need to select a feature on map
     */
    _startSelectFeatures() {
        //change the cursor to identify
        let mapElement = this.map_.getTargetElement();
        mapElement.style.cursor = "help";
        //highlight feature
        this.highlight = new FeatureHighLight(this.map_);
        this.highlight.startup();
        //add Map click listener for select the region for features
        // open the result infoWindows
        this._mapDrawHelper = new MapDrawHelper(this.map_);
        this.mapListeners.push(this.map_.on("singleclick", (evt)=>this._mapSingleClickHandle(evt)));
    }
    /**
     * @private
     * @desc reset the cursor to custom,clear the other relative things
     */
    _cancleSelectFeatures(){
        //reset the cursor to identify
        let mapElement = this.map_.getTargetElement();
        mapElement.style.cursor = "default";
        //close the highlight layer
        this.highlight.close();
        //remove the featureSelectedTree
        this.featureSelectedTreeContainer
            =  this._destroySpecificContainer(this.featureSelectedTreeContainer);
        this.featureSelectedTree
            =  this._destroySpecificContainer(this.featureSelectedTree);
        //remove the featureAttributeTable
        this.featureAttributeContainer
            =  this._destroySpecificContainer(this.featureAttributeContainer);
        this.featureAttributeTable
            =  this._destroySpecificContainer(this.featureAttributeTable);
        //setUnActive toolbar
        this._toolbarContanier.resetTool();

        this._mapDrawHelper.isOpen() && this._mapDrawHelper.closeDrawRectangle();

        this._destroyMapListener();
    }
    /**
     * SingleClick EventHandle
     * @param evt
     * @private
     */
    _mapSingleClickHandle(evt){
        let features, options = {}, condition = this._layerTypeSelect.getLayerTypeSelectValue();
        //According to Enum optionEnum , get the collection;
        if(condition === this._layerTypeSelect.optionEnum.ALLLAYER){
            features = this.map_.getFeaturesAtPixel(evt.pixel);
        }else if(condition === this._layerTypeSelect.optionEnum.TOPMOST){
            let _features = this.map_.forEachFeatureAtPixel(evt.pixel, (_feature, _layer)=>{
                return _feature
            });
            _features && (features = [_features]);
        }else if(condition === this._layerTypeSelect.optionEnum.VISIBLE){
            features = this.map_.getFeaturesAtPixel(evt.pixel);
            options.visible = true;
        }
        if(!! features){
            let collection = this._getLayerByFeature(features, options);
            this.renderInfoWindow(collection);

        }
    }
    /**
     * @public
     * @desc Arfter select the feature region, Render InfoWindow for those selected features
     */
    renderInfoWindow(flCollection) {
        let featureTreeContainer = this.featureSelectedTreeContainer
            = this.featureSelectedTreeContainer
            ? this.featureSelectedTreeContainer
            : this._renderContainer(this.infoWindow);

        let isFeatureTreeHidden = this.featureTreeHiddenTool.getActive();
        let featureTreeClassName = isFeatureTreeHidden ? "featureTreeContainer" : "featureTreeContainer shown";

        let featureTree = this.featureSelectedTree
            = this.featureSelectedTree
            ? this.featureSelectedTree
            : this._renderContainer(featureTreeContainer, { className: featureTreeClassName });

        let dataTreeNode = IdentifyFeatureLayerTree.createTreeNodeData(flCollection);
        this._layerFeatureTree = new IdentifyFeatureLayerTree(featureTree, dataTreeNode);
        this._layerFeatureTree.initComponent()
            .bindEvent("treeclick", (evt, layer) => this._featureTreeNodeClickHandle(layer));
        // In default, select the fitst one on  dataTreeNode
        // let firstNodeData = IdentifyFeatureLayerTree.getTreeNodeFirstData(dataTreeNode);
        //
        // if(firstNodeData !== null){
        //     this._layerFeatureTree.selectTreeNodeByData(firstNodeData);
        //     this._featureTreeNodeClickHandle(firstNodeData);
        // }
        return this;
    }

    /**
     * @desc tree node click handle
     * @param {TreeNode} item
     * @private
     */
    _featureTreeNodeClickHandle(item){
        this._featureSelected = item;
        //highligh feature on map
        this.highlight.highlightSpecificFeature(item.layerSource);
        //create feature attribute table
        let attrTableContainer = this.featureAttributeContainer
            = this.featureAttributeContainer
            ? this.featureAttributeContainer
            : this._renderContainer(this.infoWindow);

        let isFeatureAttrTableHidden = this.featureAttrTableHiddenTool.getActive();
        let featureAttrTableClassName = isFeatureAttrTableHidden ? "featureAttrTable" :  "featureAttrTable shown";
        let attrTable = this.featureAttributeTable
            = this.featureAttributeTable
            ? this.featureAttributeTable
            : this._renderContainer(attrTableContainer, {className: featureAttrTableClassName});

        let featureAttrTable = this._featureAttrTable = new IdentifyFeatureAttrTable(attrTable);
        featureAttrTable.initComponent(item.layerSource);
    }

    /**
     * @private
     * @param {HtmlElement} element
     * @param {} flCollection
     * @desc create the FeatureTree in the specific element
     * @return {HtmlElement} FeatureTree Element
     */
    _renderContainer(element, options){
        let _options = options || {};
        let _Contanier = document.createElement("div");
        for(let key in _options)
            _Contanier[key] = _options[key];

        element.appendChild(_Contanier);

        return _Contanier;
    }

    /**
     * @desc make the specific element display shown
     * @param element
     * @private
     */
    _showSpecificContainer(element, callback){
        if (!element.classList.contains(this.openClassName)) {
            element.classList.add(this.openClassName);
            callback && callback.call(this, element);
        }
    }
    /**
     * @desc make the specific element display hiden
     * @param element
     * @private
     */
    _hideSpecificContainer(element, callback){
        if (element.classList.contains(this.openClassName)) {
            element.classList.remove(this.openClassName);
            callback && callback.call(this, element);
        }
    }
    /**
     * @private
     * @desc destroy the specific element
     */
    _destroySpecificContainer(element){
        !!element && element.parentNode
            && element.parentNode.removeChild(element);

        return null;
    }
    /**
     * @private
     * @desc get the layer which own by specific feature
     * @return
     */
    _getLayerByFeature(features, options){
        let flCollection = [], _options = options || {};
        let layerHelper = new FeatureLayerHelper(this.map_);

        for (let i = 0, length = features.length; i < length; i++){
            let layer = !_options.visible
                ? layerHelper.getLayerByFeature(features[i])
                : layerHelper.getVisibleLayerByFeature(features[i]);
            flCollection.push([layer, features[i]]);
        }
        return flCollection;
    }
    /**
     * @private
     * @desc Render InfoWindow for those selected features
     */
    _renderInfoWindowBase(element){
        let mainContainer = element;
        //create Title
        let titlepanelContainer = new IdentifyFeatureTitlePanel(mainContainer, { title: "Identify"});
        titlepanelContainer.initComponent();
        this._addLayerInfoOnTypeSelect(titlepanelContainer);
        //create layer type selected options
        let optionsContainer = this._layerTypeSelect = new IdentifyLayerTypeSelect(mainContainer);
        optionsContainer.initComponent();
        //create toolbar
        let toolbarContanier = this._toolbarContanier = new IdentifyFeatureToolbar(mainContainer);
        toolbarContanier.initComponent();
        this._regiserToolonToolbar(toolbarContanier);
    }

    /**
     * add layer info on the typeSelectComponent
     * @param optionsContainer
     * @private
     */
    _addLayerInfoOnTypeSelect(optionsContainer){
        let layerHelper = new FeatureLayerHelper(this.map_);
        let layerInfo = layerHelper.getVectorLayerInfo(this.map_.getLayers());

        for (let i = 0, length = layerInfo.length; i < length; i++){
            let features = layerInfo[i].getSource().getFeatures();
            //console.log(features);
        }
    }
    /**
     * regiser default Tool on Toolbar
     * @param toolbarContanier
     * @private
     */
    _regiserToolonToolbar(toolbarContanier){
        //bind draw polygon select feature
        let boxSelectTool = toolbarContanier.registerExtraTool({
            name: "boxSelect", handle: ()=> this._boxSelectHandler(boxSelectTool), image: "boxSelect"
        });
        let treeHiddenTool = this.featureTreeHiddenTool = toolbarContanier.registerExtraTool({
            name: "treeHidden", handle: ()=> this._containerHiddenHandle(treeHiddenTool, this.featureSelectedTree), image: "hideTree"
        });
        let tableHiddenTool = this.featureAttrTableHiddenTool = toolbarContanier.registerExtraTool({
            name: "tableHidden", handle: ()=> this._containerHiddenHandle(tableHiddenTool, this.featureAttributeTable), image: "hideTable"
        });
        let featureFitTool = toolbarContanier.registerExtraTool({
            name: "featureFit", handle: ()=> this._fitFeatureHandle(featureFitTool, this._featureSelected
                ? this._featureSelected.layerSource : null), image: "fitFeature"
        });
        let treeClearTool = toolbarContanier.registerExtraTool({
            name: "clearTree", handle: ()=> this._treeClearHandle(treeClearTool), image: "clearTree"
        });
    }

    /**
     * boxSelect tool handler
     * @private
     */
    _boxSelectHandler(tool){
        if(this._mapDrawHelper.isOpen()){
            this._mapDrawHelper.closeDrawRectangle();
            tool.setActive(false);
        }else{
            this._mapDrawHelper.startDrawRectangle((element)=>{
                let mapCoordinateHelper = new MapCoordinateHelper(this.map_);
                let extent = mapCoordinateHelper.getExtendByElement(element);

                if(extent !== null){
                    let targetLayer, layers = this.map_.getLayers();
                    let layerHelper = new FeatureLayerHelper(this.map_);
                    let options = {}, condition = this._layerTypeSelect.getLayerTypeSelectValue();
                    //According to Enum optionEnum , get the collection;
                    if(condition === this._layerTypeSelect.optionEnum.ALLLAYER){
                        targetLayer = layers.array_;
                    }else if(condition === this._layerTypeSelect.optionEnum.TOPMOST){
                        targetLayer = layers.array_;
                        options.topmost = true;
                    }else if(condition === this._layerTypeSelect.optionEnum.VISIBLE){
                        targetLayer = layers.array_;
                        options.visible = true;
                    }
                    let features = layerHelper.getFeatureByExtent(targetLayer, extent, options);

                    if(!! features && features.length > 0){
                        let collection = this._getLayerByFeature(features, true);
                        this.renderInfoWindow(collection);
                    }
                }
            });
            tool.setActive(true);
        }
    }

    /**
     * treeClear tool handler
     * @param tool
     * @private
     */
    _treeClearHandle(tool){
        if(this.featureSelectedTreeContainer){
            this._layerFeatureTree.destroyComponent();
            this.featureSelectedTreeContainer = null;
            this.featureSelectedTree = null;
            this._layerFeatureTree = null;
            this._featureSelected = null;
        }
        if(this.featureAttributeContainer){
            this._featureAttrTable.destroyComponent();
            this.featureAttributeContainer = null;
            this.featureAttributeTable = null;
            this._featureAttrTable = null;
        }
        //clear the highlightfeature
        this.highlight.clearhighlightFeature();
    }

    /**
     * hide the specific container
     * @param tool
     * @param container
     * @private
     */
    _containerHiddenHandle(tool, container){
        if(!container) return;

        if(tool.getActive()){
            this._showSpecificContainer(container);
            tool.setActive(false);
        }else{
            this._hideSpecificContainer(container);
            tool.setActive(true);
        }
    }

    /**
     * 缩放至图层工具的处理事件
     * @param tool
     * @private
     */
    _fitFeatureHandle(tool,  feature){
        if(!!feature){
            this.map_.getView().fit(feature.getGeometry().getExtent(), { maxZoom: 17, duration: 400 });
        }
    }
    /**
     * @private
     * @desc destroy the Event Added on Map
     */
    _destroyMapListener(){
        for (let i = 0; i < this.mapListeners.length; i++) {
            Observable.unByKey(this.mapListeners[i]);
        }
        this.mapListeners.length = 0;
    }
    /**
     * @private
     * @desc Apply workaround to enable scrolling of overflowing content within an element
     */
    _enableTouchScroll(elm) {
        if(this._isTouchDevice()){
            let scrollStartPos = 0;
            elm.addEventListener("touchstart", function(event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function(event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    }
    /**
     * @private
     * @desc Apply workaround to enable scrolling of overflowing content within an element
     */
    _isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch(e) {
            return false;
        }
    }
}


// Expose Identify as ol.control.Identify if using a full build of
// OpenLayers
if (window.ol && window.ol.control) {
    window.ol.control.Identify = Identify;
}