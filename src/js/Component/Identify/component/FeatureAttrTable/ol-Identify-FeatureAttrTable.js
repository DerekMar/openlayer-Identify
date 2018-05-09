import "./ol-Identify-FeatureAttrTable.css";
import IdentifyBaseComponent from "../ol-Identify-BaseComponent";
// /**
//  * OpenLayers Feature Identify Control. FeatureLayerTree Component
//  * @constructor
//  * @param {Object} element, the component renderby:
//  */
export default  class IdentifyFeatureAttrTable extends IdentifyBaseComponent{
    constructor(element){
        super(element);
    }
    /**
     * @desc render the feature's Attribute on the element by table form
     * @public
     */
    initComponent(feature){
        this.element.innerHTML = "";

        let keys = feature.getKeys(), propertity = feature.getProperties();
        let tableContainer = document.createElement("table");
        tableContainer.className = "altrowstable";
        for(let i = 0, length = keys.length; i < length; i++){
            if(keys[i] == feature.getGeometryName()) continue;
            let tr = document.createElement("tr");
            let th_title = document.createElement("th");
            th_title.className = "title";
            let th_value = document.createElement("th");
            if( i % 2 == 0){
                th_title.classList.add("evenrowcolor");
                th_value.classList.add("evenrowcolor");
            }else{
                th_title.className = "title oddrowcolor";
                th_value.className = "oddrowcolor";
            }
            th_title.innerText = keys[i];
            th_value.innerText = propertity[keys[i]];

            tr.appendChild(th_title);
            tr.appendChild(th_value);
            tableContainer.appendChild(tr);
        }
        this.element.appendChild(tableContainer);

        return this;
    }
}