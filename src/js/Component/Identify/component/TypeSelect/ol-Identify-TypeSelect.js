import "./ol-Identify-TypeSelect.css";
import IdentifyBaseComponent from '../ol-Identify-BaseComponent';
/**
 * OpenLayers Feature Identify Control. LayerTypeSelect Component
 * @constructor
 * @param {Object} element, the component renderby:
 */
export default  class IdentifyLayerTypeSelect extends IdentifyBaseComponent{
    constructor(element){
        super(element);
        // the option element type Enum
        this.optionEnum = { ALLLAYER: "all", TOPMOST: "topmost", VISIBLE: "visible"};
        this.optionTextEnum = { ALLLAYER: "所有的图层", TOPMOST: "最上面的图层", VISIBLE: "可见的图层"};
        //select element
        this._layerTypeSelect = null;
    }

    /**
     * @public
     * @desc create the Layer type condition selected element
     * @returns {HtmlElement} select Element
     */
    initComponent(){
        let optionsContainer = document.createElement("div");
        optionsContainer.className = "selectContainer";
        let selectContent = this._layerTypeSelect = document.createElement("select");
        selectContent.setAttribute("name", "identify-layer-type");

        let option_topmost, options_visible, options_all;
        option_topmost = document.createElement("option");
        option_topmost.value =  this.optionEnum.TOPMOST;
        option_topmost.innerText = this.optionTextEnum.TOPMOST;

        options_visible = document.createElement("option");
        options_visible.value = this.optionEnum.VISIBLE;
        options_visible.innerText = this.optionTextEnum.VISIBLE;

        options_all = document.createElement("option");
        options_all.value = this.optionEnum.ALLLAYER;
        options_all.innerText = this.optionTextEnum.ALLLAYER;
        options_all.selected = true;

        selectContent.appendChild(option_topmost);
        selectContent.appendChild(options_visible);
        selectContent.appendChild(options_all);
        optionsContainer.appendChild(selectContent);

        this.element.appendChild(optionsContainer);

        return optionsContainer;
    }
    /**
     * @public
     * @desc get the LayerType Select Element has selectd Value
     * @returns {string} selected options Value
     */
    getLayerTypeSelectValue(){
        let select = this._layerTypeSelect;
        let lastIndex = select.selectedIndex;
        let lastValue = select.options[lastIndex].value;

        return lastValue;
    }
}