import IdentifyBaseComponent from "../ol-Identify-BaseComponent";
import IdentifyTool from './ol_Identify-Tool';
const boxSelectImagePath = require("./img/box-select.png");

export default  class IdentifyToolbar extends IdentifyBaseComponent{
    constructor(element){
        super(element);

        this.tools = [];
        this.toolbarContanier = null;
        this.toolbarClassName = "toolbarContanier";
        //TODO 完善更多的功能
        this.defaultOptions = {
            name: null,
            handle: null,
            image: null,
            imageUrl: null,
            imageFocus: null,
            className: ""
        };
        this.defaultImageEmun = {
            boxSelect: boxSelectImagePath,
            clearTree: boxSelectImagePath
        };
    }
    initComponent(){
        let toolbarContanier = this.toolbarContanier = document.createElement("div");
        toolbarContanier.className = this.toolbarClassName;

        this.element.appendChild(toolbarContanier);
    }

    /**
     * 把tool增加到工具栏
     * @param tool
     * @private
     */
    _addToolToToolbar(tool){
        let _tool = new IdentifyTool(this.toolbarContanier, tool);
        _tool.initComponent();

        return _tool;
    }

    /**
     * 增加额外的功能到工具栏
     * @param options
     */
    registerExtraTool(options){
        let _options = this._extend(this.defaultOptions, options || {});
        if(!_options.name && !_options.handle){
            throw new Error("registerExtraTool 的参数不正确，必须有name和handle参数!")
        }
        let handle = _options.handle ? _options.handle : null;
        let iconImage = _options.imageUrl ? _options.imageUrl : (
            _options.image ? this.defaultImageEmun[_options.image] : null);
        let className = _options.className ? _options.className : null;

        let _tool = this._addToolToToolbar({
            handle: handle,
            iconImage: iconImage,
            className: className
        });
        this.tools.push(_tool);

        return _tool;
    }

    /**
     * @desc reset all of the tools
     * @public
     */
    resetTool(){
        for (let i = 0, length = this.tools.length; i < length; i++){
            this.tools[i].setActive(false);
        }
    }
}