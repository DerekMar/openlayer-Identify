import "./ol-MapSelection-Utils.css";
import Base from "../ol-Base-Utils";
import DragPan from "ol/interaction/dragpan";
/**
 * OpenLayers Map Selection Utils. convenent to Draw and Selection on map;
 * @constructor
 * @extends {ol.Base.Utils}
 * @param {lo.map} map
 */
export default class MapSelectionUtils extends Base{
    constructor(map, options){
        super(map);

        this.options = options || {};
        this.targetElement = map.getTargetElement();
        this.selectRegionElement = null;
        this.selectRegionClass = "mapSelectDiv";

        if(this.targetElement.onmousedown || this.targetElement.onmousemove || this.targetElement.onmouseup){
            console.error("onmousedown、onmousemove、onmouseup已经注册了其他事件，请使用其他Element，--MapSelectionUtils");
        }
        if(!this.targetElement)
            throw new Error("调用MapSelectionUtils的map地图控件不正确");
    }
    /**
     * 开启鼠标框选的功能
     * 
     * @param {any} DrawCallback 
     * @memberof MapSelectionUtils
     */
    startDrawRectangle(drawCpmpeleteCallback){
        //禁止地图拖动的事件
        this._disableMapDrag();

        this.targetElement.onmousedown = (e)=> {
            if(this.selectRegionElement){
                this.selectRegionElement.parentNode.removeChild(this.selectRegionElement);
                this.selectRegionElement = null;
            }

            let posx = e.clientX, posy = e.clientY;
            this._dynamicDrawRegion(posx, posy, drawCpmpeleteCallback);
        }
    }
    /**
     * 关闭鼠标框选的功能
     * 
     * @memberof MapSelectionUtils
     */
    closeDrawRectangle(){
        //设置允许地图拖动
        this._enableMapDrag();

        let mainContanier = this.targetElement;
        mainContanier.onmousedown = null;
        mainContanier.onmousemove = null;
        mainContanier.onmouseup = null;

        if(this.selectRegionElement){
            this.selectRegionElement.parentNode.removeChild(this.selectRegionElement);
            this.selectRegionElement = null;
        }
    }

    /**
     * 是否打开了功能
     * @return {boolean}
     */
    isOpen(){
        return this.targetElement.onmousedown !== null;
    }

    /**
     * 禁止地图拖动
     * @private
     */
    _disableMapDrag(){
        this.map.getInteractions().forEach(function(element,index,array){
            if(element instanceof DragPan)
                element.getActive() && element.setActive(false);
        });
    }

    /**
     * 允许地图拖动
     * @private
     */
    _enableMapDrag(){
        this.map.getInteractions().forEach(function(element,index,array){
            if(element instanceof DragPan){}
                !element.getActive() && element.setActive(true);
        });
    }

    /**
     *  渲染一个给定像素坐标的div
     * @param pageX
     * @param pageY
     * @return {HTMLDivElement}
     * @private
     */
    _renderDynamicDiv(clientX, clientY){
        let div = document.createElement("div");
        div.className = this.selectRegionClass;
        div.style.left = clientX + "px";
        div.style.top = clientY + "px";

        return div;
    }

    /**
     * 动态绘制区域
     * @param e
     * @private
     */
    _dynamicDrawRegion(posx,  posy, drawCpmpeleteCallback){
        let mainContanier = this.targetElement;

        this.selectRegionElement = this._renderDynamicDiv(posx, posy);
        mainContanier.appendChild(this.selectRegionElement);

        //注册容器点击时的鼠标移动事件
        mainContanier.onmousemove = (ev)=> {
            //计算div的尺寸
            this.selectRegionElement.style.left = Math.min(ev.clientX, posx) + "px";
            this.selectRegionElement.style.top = Math.min(ev.clientY, posy) + "px";
            this.selectRegionElement.style.width = Math.abs(posx - ev.clientX)+"px";
            this.selectRegionElement.style.height = Math.abs(posy - ev.clientY)+"px";
        }
        //注册容器鼠标上抬的事件
        mainContanier.onmouseup = ()=> {
            mainContanier.onmousemove = null;
            mainContanier.onmouseup = null;

            drawCpmpeleteCallback && drawCpmpeleteCallback(this.selectRegionElement);

            this.selectRegionElement.parentNode.removeChild(this.selectRegionElement);
            this.selectRegionElement = null;
        }
    }
}