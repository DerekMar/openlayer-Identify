import "./ol-Identify.css";
import Control from 'ol/control/control';
import Observable from 'ol/observable';
import FeatureHighLight from './utils/FeatureHighLight/ol-FeatureHighLight-Utils';
import FeatureLayerHelper from './utils/FeatureLayerHelper/ol-FeatureLayer-Utils';
import MapDrawHelper from './utils/MapSelection/ol-MapSelection-Utils';
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
        this.minimizeClassName = "minimizeBtn";
        this.maximizeClassName = "maxmizeBtn";
        //declare the container positon
        this.position = !! options.position? options.position : "top";

        element.className = this.closeClassName + " " + this.position;

        //Evented Listeners Conventent to register and unregister
        this.mapListeners = [];

        //declare other variance
        this.button = null;     //entry button
        this.infoWindow = null; //result infowindow
        this.highlight = null;  // control the feature highlight
        this._mapDrawHelper = null; //map select region control

        this._toolbarContanier = null;// toolbar element
        this._layerTypeSelect = null;// layer type 's select element
        this._layerFeatureTree = null;// layer feature component
        this._featureAttrTable = null;// feature Attribute table component

        this.featureSelectedTree = null;// the tree for feature which has selected
        this.featureSelectedTreeContainer = null;// the tree container for feature which has selected
        this.featureAttributeTable = null;// the feature Attribute table element
        this.featureAttributeContainer = null;// thre feature Attribute container element

        //create the entry Button
        this._initEntryBtnElement(element);
        //create the result infoWindow
        this._initResultInfoWindow(element);
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
        this.mapListeners.push(this.map_.on("singleclick", (evt)=>this. _mapSingleClickHandle(evt)));
        //bind draw polygon select feature
        this._mapDrawHelper = new MapDrawHelper(this.map_);
        this._mapDrawHelper.startDrawRectangle((element)=>{
            console.log(element);
        });
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
        //close the DrawRectangle Event
        this._mapDrawHelper.closeDrawRectangle();
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

        this._destroyMapListener();
    }
    /**
     * SingleClick EventHandle
     * @param evt
     * @private
     */
    _mapSingleClickHandle(evt){
        let condition = this._layerTypeSelect.getLayerTypeSelectValue();
        //According to Enum optionEnum , get the collection;
        if(condition === this._layerTypeSelect.optionEnum.ALLLAYER){
            let features = this.map_.getFeaturesAtPixel(evt.pixel);
            if(!! features){
                let collection = this._getLayerByFeature(features);
                this.renderInfoWindow(collection);
            }
        }else if(condition === this._layerTypeSelect.optionEnum.TOPMOST){
            let feature = this.map_.forEachFeatureAtPixel(evt.pixel, (_feature, _layer)=>{
                return _feature
            });
            let collection = this._getLayerByFeature([feature]);
            this.renderInfoWindow(collection);
        }else if(condition === this._layerTypeSelect.optionEnum.VISIBLE){
            let features = this.map_.getFeaturesAtPixel(evt.pixel);
            if(!! features){
                let collection = this._getLayerByFeature(features, true);
                this.renderInfoWindow(collection);
            }
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

        let featureTree = this.featureSelectedTree
            = this.featureSelectedTree
            ? this.featureSelectedTree
            : this._renderContainer(featureTreeContainer, { className: "featureTreeContainer shown"});

        this._renderSizeMizeButton(featureTreeContainer, featureTree);

        let dataTreeNode = IdentifyFeatureLayerTree.createTreeNodeData(flCollection);
        this._layerFeatureTree = new IdentifyFeatureLayerTree(featureTree, dataTreeNode);
        this._layerFeatureTree.initComponent()
            .bindEvent("treeclick", (evt, layer) => this._featureTreeNodeClickHandle(layer));

        return this;
    }

    /**
     * @desc tree node click handle
     * @param {TreeNode} item
     * @private
     */
    _featureTreeNodeClickHandle(item){
        //highligh feature on map
        this.highlight.highlightSpecificFeature(item.layerSource);
        //create feature attribute table
        let attrTableContainer = this.featureAttributeContainer
            = this.featureAttributeContainer
            ? this.featureAttributeContainer
            : this._renderContainer(this.infoWindow);

        let attrTable = this.featureAttributeTable
            = this.featureAttributeTable
            ? this.featureAttributeTable
            : this._renderContainer(attrTableContainer, {className: "featureAttrTable shown"});

        this._renderSizeMizeButton(attrTableContainer, attrTable);

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
     *  render the maxmize or minimize button on contanier ,target on targetElement
     * @param { HtmlElement} container
     * @param { HtmlElement} targetElement
     * @private
     */
    _renderSizeMizeButton(container, targetElement){
        /* remenber inverted order*/
        let childs = container.childNodes;
        for(let i = childs.length - 1; i >= 0; i--) {
            let element = childs[i];
            if(element.classList.contains(this.minimizeClassName)
                || element.classList.contains(this.maximizeClassName)){
                return;
            }
        }

        let minimizeBtn = document.createElement("span");
        minimizeBtn.className = this.minimizeClassName;
        minimizeBtn.onclick = (evt)=> this._minimizeOrMaxmineContaner(targetElement, minimizeBtn);

        container.insertBefore(minimizeBtn, targetElement);
    }

    /**
     *
     * @param element
     * @private
     */
    _minimizeOrMaxmineContaner(container, btnElement){
        if(btnElement.classList.contains(this.minimizeClassName)){
            this._hideSpecificContainer(container);
            btnElement.classList.remove(this.minimizeClassName);
            btnElement.classList.add(this.maximizeClassName);
        }else if(btnElement.classList.contains(this.maximizeClassName)){
            this._showSpecificContainer(container);
            btnElement.classList.remove(this.maximizeClassName);
            btnElement.classList.add(this.minimizeClassName);
        }
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
    _getLayerByFeature(features, isVisible){
        let flCollection = [];
        for (let i = 0, length = features.length; i < length; i++){
            let layerHelper = new FeatureLayerHelper(this.map_);
            let layer = !isVisible
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
        //create layer type selected options
        let optionsContainer = this._layerTypeSelect = new IdentifyLayerTypeSelect(mainContainer);
        optionsContainer.initComponent();
        //create toolbar
        let toolbarContanier = this._toolbarContanier = new IdentifyFeatureToolbar(mainContainer, {});
        toolbarContanier.initComponent();
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