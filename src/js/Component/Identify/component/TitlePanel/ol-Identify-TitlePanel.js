import IdentifyBaseComponent from "../ol-Identify-BaseComponent";
import "./ol-Identify-TitlePanel.css";

export default  class IdentifyTitlePanel extends IdentifyBaseComponent{
    constructor(element, options){
        super(element);
        let _options = options || {};
        this.titleText = _options.title ? _options.title : "Identify";
    }
    initComponent(){
        let titleContainer = document.createElement("div");
        titleContainer.className = "titlePanel";

        let titleContent = document.createElement("h3");
        titleContent.innerText = "Identify";

        titleContainer.appendChild(titleContent);
        this.element.appendChild(titleContainer);
    }
}