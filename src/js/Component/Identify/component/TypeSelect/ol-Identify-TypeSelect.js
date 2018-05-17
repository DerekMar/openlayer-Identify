import "./ol-Identify-TypeSelect.css";
import IdentifyBaseComponent from '../ol-Identify-BaseComponent';

const LayerIconImage = require("./img/tree-ldashed.png");
const LayerGroupIconImage = require("./img/icon-layer.png");
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
        this._layerTypeSelectControl = null;
        this._layerTypeOptionContaniner = null;
        this.valueFieldName = "dataValue";

        this._curSelected = null;
        this._selectLiElement = null;

        this.maxHeight = 200;

        this.defaultImage = {
            "layer": LayerIconImage,
            "layergroup": LayerGroupIconImage
        }
    }

    /**
     * @public
     * @desc create the Layer type condition selected element
     * @returns {HtmlElement} select Element
     */
    initComponent(){
        let selectContainer = this._layerTypeSelectControl =  document.createElement("div");
        selectContainer.className = "selectContainer";

        let curSelectContent = this._createCurrentOption();

        let selectContentContainer = this._layerTypeSelect = document.createElement("div");
        selectContentContainer.className = "selectElement";

        let selectContent  = this._layerTypeOptionContaniner = this._createSelect();

        let option_topmost = this._createOption(this.optionEnum.TOPMOST, this.optionTextEnum.TOPMOST);
        let options_visible = this._createOption(this.optionEnum.VISIBLE, this.optionTextEnum.VISIBLE);
        let options_all = this._createOption(this.optionEnum.ALLLAYER, this.optionTextEnum.ALLLAYER);

        selectContent.appendChild(option_topmost);
        selectContent.appendChild(options_visible);
        selectContent.appendChild(options_all);
        selectContainer.appendChild(curSelectContent);

        selectContentContainer.appendChild(selectContent);
        document.body.appendChild(selectContentContainer);

        this.selectOption(options_all);

        this.element.appendChild(selectContainer);
        return selectContainer;
    }

    /**
     * 选择某个选项
     * @param optionElement
     * @return {IdentifyLayerTypeSelect}
     */
    selectOption(optionElement){
        let copyElement = document.createElement("label");
        copyElement.setAttribute(this.valueFieldName, optionElement.getAttribute(this.valueFieldName));
        copyElement.innerText = optionElement.childNodes[0].innerText;

        this._selectLiElement = copyElement;
        this._curSelected = copyElement;

        let citeElement = this._layerTypeSelectControl.childNodes[0];
        let oldOptionElement = citeElement.childNodes[0];

        citeElement.removeChild(oldOptionElement);
        citeElement.appendChild(copyElement);

        return this;
    }

    /**
     * 增加选项
     * @param value
     * @param text
     * @param iconName
     */
    addOption(value, text, iconName){
        let option = this._createOption(value, text, iconName);
        this._layerTypeOptionContaniner.appendChild(option);
    }

    /**
     * 增加树节点的选项
     * @param treeNodes
     * @param title 是否需要分割线，分割线的标题，有标题则有分割线
     * treeNodes {
     *
     * }
     */
    addTreeNodeOption(treeNodes, title){
        if(treeNodes && treeNodes.length > 0){
            let option = this._addTreeNodeOption(treeNodes);
            let separateline = this._createSeparateline(title);
            this._layerTypeOptionContaniner.appendChild(separateline);
            this._layerTypeOptionContaniner.appendChild(option);
        }
    }

    /**
     * 增加树节点的option选项
     * @param treeNodes
     * @param element
     * @private
     */
    _addTreeNodeOption(treeNodes){
        let treeContainer = document.createElement("ul");
        treeContainer.className = "TreeContainerElement";

        for (let i = 0, length = treeNodes.length; i < length; i++){
            let treeNode = treeNodes[i];

            let treeNodeElement = this._createOption(treeNode.value? treeNode.value : treeNode.title, treeNode.title, treeNode.icon, true);

            if(treeNode.childLayer){
                let childULElement = this._addTreeNodeOption(treeNode.childLayer);
                treeNodeElement.appendChild(childULElement);
            }
            treeContainer.appendChild(treeNodeElement);
        }
        return treeContainer;
    }

    /**
     * 展示和隐藏面板
     * @param evt
     */
    showorhideOptionPanel(evt){
        if(!this._layerTypeSelect.classList.contains("selectElementshown")){
            this.showOptionPanel(evt);
        }else{
            this.hideOptionPanel(evt);
        }
    }
    /**
     * 展示选择面板
     * @param evt
     */
    showOptionPanel(evt){
        if(!this._layerTypeSelect.classList.contains("selectElementshown")){
            this._layerTypeSelect.classList.add("selectElementshown");
        }

        let div_top = this._getOffsetTopByBody(this._layerTypeSelectControl), div_left = this._getOffsetLeftByBody(this._layerTypeSelectControl);
        //自动适配位置
        if( div_top + this._layerTypeSelectControl.offsetHeight + this.maxHeight > document.body.offsetHeight)
        {
            this._layerTypeSelect.style.left = div_left + 'px';
            this._layerTypeSelect.style.top = div_top - this._layerTypeSelect.offsetHeight + 'px';
        }else{
            this._layerTypeSelect.style.left = div_left + 'px';
            this._layerTypeSelect.style.top = div_top + this._layerTypeSelectControl.offsetHeight + 'px';
        }
    }

    /**
     * 隐藏选择面板
     * @param evt
     */
    hideOptionPanel(evt){
        if(this._layerTypeSelect.classList.contains("selectElementshown")){
            this._layerTypeSelect.classList.remove("selectElementshown");
        }
    }

    /**
     * 获取要素到body顶部的像素
     * @param el
     * @return {number}
     * @private
     */
    _getOffsetTopByBody(el){
        let offsetTop = 0;
        while (el && el.tagName !== 'BODY') {
            offsetTop += el.offsetTop;
            el = el.offsetParent;
        }
        return offsetTop
    }

    /**
     * 获取要素到bodu最左边的像素值
     * @param el
     * @return {number}
     * @private
     */
    _getOffsetLeftByBody(el){
        let offsetLeft = 0;
        while (el && el.tagName !== 'BODY') {
            offsetLeft += el.offsetLeft;
            el = el.offsetParent;
        }
        return offsetLeft;
    }
    /**
     * 创建当前选择的内容
     * @private
     */
    _createCurrentOption(){
        let container = document.createElement("cite");
        let lable = this._curSelected =  document.createElement("lable");
        lable.innerText = "下拉选择";

        container.appendChild(lable);
        container.onclick = (e)=> this.showorhideOptionPanel(e);

        return container;
    }
    /**
     * 创建仿照Select要素
     * @return {HTMLUListElement}
     * @private
     */
    _createSelect(){
        let selectElement = document.createElement("ul");

        selectElement.onmouseleave = (e)=> this.hideOptionPanel(e);

        return selectElement;
    }

    /**
     * 创建仿照option要素
     * @param value
     * @param text
     * @return {HTMLLIElement}
     * @private
     */
    _createOption(value, text, iconName, isTreeNode){
        let optionElement = document.createElement("li");
        optionElement.className = !isTreeNode ? "optionElement" : "treeNodeElement";
        optionElement.setAttribute(this.valueFieldName, value);
        optionElement.onclick = (e)=> {
            this.selectOption(optionElement);
            this.hideOptionPanel(e);
            e.stopPropagation();
        };

        let aElement = document.createElement("a");

        if(this.defaultImage[iconName]){
            let iconElement = document.createElement("img");
            iconElement.src = this.defaultImage[iconName];
            //如果是树节点，则增加折叠事件
            isTreeNode && (iconElement.onclick = function(e){
                let targetElement = e.target;
                while (targetElement.tagName != "LI"){
                    targetElement = targetElement.parentNode;
                }
                for(let i = 0, length = targetElement.childElementCount; i < length; i++){
                    let childElement = targetElement.childNodes[i];
                    if(childElement.tagName == "UL"){
                        if(childElement.classList.contains("hidden")){
                            childElement.classList.remove("hidden");
                        }else{
                            childElement.classList.add("hidden");
                        }
                        break;
                    }
                }
                e.stopPropagation();
            });
            aElement.appendChild(iconElement);
        }

        let textContent = document.createElement("lable");
        textContent.innerText = text;
        // textContent.setAttribute(this.valueFieldName, value);

        aElement.appendChild(textContent);
        optionElement.appendChild(aElement);

        return optionElement;
    }

    /**
     * 创建分割线
     * @param text 分割线标题
     * @return {HTMLSpanElement}
     * @private
     */
    _createSeparateline(text){
        let separateline = document.createElement("div");
        separateline.className = "Separateline";

        if(text){
            let bBefore = document.createElement("b");
            let bAfter = document.createElement("b");
            let textContanier = document.createElement("span");
            textContanier.innerText = text;
            separateline.appendChild(bBefore);
            separateline.appendChild(textContanier);
            separateline.appendChild(bAfter);
        }
        return separateline;
    }

    /**
     * @public
     * @desc get the LayerType Select Element has selectd Value
     * @returns {string} selected options Value
     */
    getLayerTypeSelectValue(){
        return this._curSelected.getAttribute(this.valueFieldName) ? this._curSelected.getAttribute(this.valueFieldName) : null;
    }
}