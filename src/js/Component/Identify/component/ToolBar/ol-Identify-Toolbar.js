import IdentifyBaseComponent from "../ol-Identify-BaseComponent";
import IdentifyTool from './ol_Identify-Tool';

export default  class IdentifyToolbar extends IdentifyBaseComponent{
    constructor(element, options){
        super(element);
        let _options = options || {};
        this.toolbarClassName = "toolbarContanier";
        this.toolbarContanier = null;
        this.tools = _options.tools ? _options.tools : [];
    }
    initComponent(){
        let toolbarContanier = this.toolbarContanier = document.createElement("div");
        toolbarContanier.className = this.toolbarClassName;

        this.element.appendChild(toolbarContanier);

        this._addDefaultTools();
    }

    /**
     * 增加默认的工具
     * @private
     */
    _addDefaultTools(){
        for (let i = 0; i < this.tools.length; i++){
            this._addToolToToolbar(this.tools[i]);
        }
    }

    /**
     * 添加工具到工具栏
     * @param tool
     */
    addTool(tool){
        this._addToolToToolbar(tool);
    }

    /**
     * 把tool增加到工具栏
     * @param tool
     * @private
     */
    _addToolToToolbar(tool){
        (new IdentifyTool(this.toolbarContanier, { })).initComponent();
    }
}