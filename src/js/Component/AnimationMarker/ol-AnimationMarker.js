import "./ol-AnimationMarker.css";
import Overlay from 'ol/overlay';
import DragPan from "ol/interaction/dragpan";
const defaultImage = require("./img/highlight-marker.png");

export default class AnimationMarker extends Overlay{
    constructor(opt_options) {

        let options = opt_options || {};
        /* don't making the map panning*/
        if (options.autoPan === undefined) {
            options.autoPan = false;
        }

        let element = document.createElement('div');

        options.element = element;
        super(options);

        this.container = element;
        this.container.className = 'ol-AnimationMarker';

        this.content = document.createElement('img');
        this.content.src = options.image ? options.image : defaultImage;

        this.container.appendChild(this.content);

        this.timeInterval = null;

    }
    /**
     * Show the AnimationMarker.
     * @param {ol.Coordinate} coord Where to anchor the AnimationMarker.
     * @returns {Popup} The Popup instance
     */
    show(point) {
        this.container.style.display = 'block';

        let coord = point.getGeometry().getCoordinates();

        this._clearAnimation();
        this._animationShow(coord);
        return this;
    }

    /**
     * 动画展示
     * @param coord
     * @private
     */
    _animationShow(coord){
        let mapSize = this._getMapSize();
        let curPixel = this._getScreenXYByCoordinate(coord);
        /**
         * 这里只需要修改 totalTime 的值可以改变动画的渲染时间，其他不要改动
         * @type {number}
         */
        let totalTime = 600, //动画的总时间 单位是毫秒
            heightPower = 4, //高度衰减的倍率
            dValue = mapSize[1] / 10, //marker的最大高度，像素为单位
            dTime = 10; //动画每一帧的时间

        let totalSecondTime = totalTime/ 1000;
        let acceleration = 2 * dValue / Math.pow(totalSecondTime * Math.sqrt(heightPower) /( 1 + Math.sqrt(heightPower)), 2); // 单位像素 / 秒

        let iHeight = dValue,//能量衰减后的高度
            iTime = totalTime;//剩余时间

        //根据时间计算当前高度的方法
        let getHeight = (ivalue, time)=>/* time second*/{
            if(time <= 0) return 0;//如果时间已经少于0，则直接返回0
            let _height = ivalue - acceleration * time * time / 2;

            if( _height <= 0){
                iHeight = iHeight / heightPower;
                totalTime = totalTime - time * 1000;
            }
            return  _height;
        }

        let timeIntervalu = this.timeInterval = window.setInterval(()=>{
            iTime = iTime - dTime;

            let dHeight = getHeight(iHeight, (totalTime - iTime) / 1000);
            //current piexl
            let piexl = [curPixel[0], curPixel[1] - dHeight];
            let coor = this._getCoordinateFromScreenXY(piexl);
            this.setCoordinates(coor);

            let postion = this.getPosition();
            if(postion[0] != coor[0] || postion[1] != coor[1]){
                timeIntervalu && window.clearInterval(timeIntervalu);
            }
            if(iTime <= 0) {
                this.setCoordinates(coord);
                timeIntervalu && window.clearInterval(timeIntervalu);
            }
        }, dTime)
    }
    /**
     * 通过地理坐标获取屏幕坐标
     * @param coor
     * @private
     */
    _getScreenXYByCoordinate(coor){
        return this.getMap().getPixelFromCoordinate(coor);
    }
    /**
     * 通过屏幕坐标获取地理坐标
     * @param coor
     * @private
     */
    _getCoordinateFromScreenXY(piexl){
        return this.getMap().getCoordinateFromPixel(piexl);
    }
    /**
     * 获取地图的尺寸
     * @returns {ol.Size}
     */
    _getMapSize(){
        return this.getMap().getSize();
    }
    /**
     * set the AnimationMarker Coordinates.
     * @param {ol.Coordinate} coord Where to anchor the AnimationMarker.
     * @returns {Popup} The Popup instance
     */
    setCoordinates(coord){
        this.setPosition(coord);
    }
    /**
     * Hide the popup.
     * @returns {Popup} The Popup instance
     */
    hide() {
        this.container.style.display = 'none';
        this._clearAnimation();

        return this;
    }

    /**
     * 清除动画
     * @private
     */
    _clearAnimation(){
        if(this.timeInterval){
            window.clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }
    /**
     * Indicates if the popup is in open state
     * @returns {Boolean} Whether the popup instance is open
     */
    isOpened() {
        return this.container.style.display == 'block';
    }

    /**
     * 清除动画事件
     */
    clearAnimation(){
        this._clearAnimation();
    }
    /**
     * 禁止地图拖动
     * @private
     */
    _disableMapDrag(){
        this.getMap().getInteractions().forEach(function(element,index,array){
            if(element instanceof DragPan)
                element.setActive(false);
        });
    }

    /**
     * 允许地图拖动
     * @private
     */
    _enableMapDrag(){
        this.getMap().getInteractions().forEach(function(element,index,array){
            if(element instanceof DragPan){}
            element.setActive(true);
        });
    }
}


// OpenLayers
if (window.ol && window.ol.Overlay) {
    window.ol.Overlay.AnimationMarker = AnimationMarker;
}