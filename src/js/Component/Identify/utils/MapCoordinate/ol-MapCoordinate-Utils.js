import Base from "../ol-Base-Utils";
import Polygon from "ol/geom/polygon";

export default class MapzCoordinateUtils extends Base{
    constructor(map){
        super(map);
    }

    /**
     * 通过一个屏幕要素，获取地图上的extent
     * @param element
     */
    getExtendByElement(element){
        let extent = null;

        let div_top = element.offsetTop, div_left = element.offsetLeft;
        let div_right = div_left + element.offsetWidth, div_bottom = div_top + element.offsetHeight;

        let mapElement = this.map.getTargetElement();
        let map_top = mapElement.offsetTop, map_left = mapElement.offsetLeft;

        let left = div_left - map_left, right = div_right - map_left;
        let top = div_top - map_top, bottom = div_bottom - map_top;

        if(Math.abs(left - right) > 4 || Math.abs(top - bottom) > 4){
            let topleft = this.map.getCoordinateFromPixel([left, top]);
            let bottomright = this.map.getCoordinateFromPixel([right, bottom]);
            let topright = this.map.getCoordinateFromPixel([right, top]);
            let bottomleft = this.map.getCoordinateFromPixel([left, bottom]);

            let polygon = new Polygon([[topleft, topright, bottomright, bottomleft, topleft]]);
            extent = polygon.getExtent();
        }

        return extent;
    }
}

