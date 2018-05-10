import IdentifyBaseComponent from "../ol-Identify-BaseComponent";
const defaultImagePath = require("./img/box-select.png");

export default  class IdentifyTool extends IdentifyBaseComponent{
    constructor(element, options){
        super(element);
        let _options = options || {};

        this.toolClassName = "toolContanier";
        this.iconImage = _options.iconImage ? _options.iconImage : defaultImagePath;
    }
    initComponent(){
        let toolContanier, bgImage;

        toolContanier = document.createElement("a");
        toolContanier.className = this.toolClassName;
        toolContanier.style.backgroundImage = "url(" + this.iconImage + ")";

        this.element.appendChild(toolContanier);

    }
}