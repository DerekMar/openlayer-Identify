import Map from "ol/map";

export default class BaseUtils{
    constructor(map){
        if(! map instanceof Map){
            throw new Error("调用对象失败，传入的Map参数无效");
        }
        this.map = map;
        this.mapElement = map.getTargetElement;
        this.mapListeners = [];
        this.openFlag = false;//功能是否渲染成功
    }
}