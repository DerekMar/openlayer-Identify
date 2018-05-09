import  '../img/highlight-marker.png';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import SymbolStyle from 'ol/style/style';
import CircleSymbol from 'ol/style/circle';
import StrokeSymbol from 'ol/style/stroke';
import FillSymbol from 'ol/style/fill';
import Base from './ol-Base-Utils';
import Observable from 'ol/observable';
import Icon from 'ol/style/icon';
import Point from 'ol/geom/point';
import Feature from 'ol/feature';

const markerUrl = require('../img/highlight-marker.png');

/**
 * OpenLayers Feature HighLighg Utils. convenent to highlight feature;
 * @constructor
 * @extends {ol.Base.Utils}
 * @param {lo.map} map
 */
class FeatureFeatureHighLightUtils extends Base{
    constructor(map){
        super(map);
        this.originalStyle = new SymbolStyle({
            image: new CircleSymbol({
                radius: 7,
                fill: new FillSymbol({color: 'blue'}),
                stroke: new StrokeSymbol({color: 'red', width: 2})
            }),
            stroke: new StrokeSymbol({
                width: 2,
                color: 'red'
            }),
            fill: new FillSymbol({
                color: 'blue'
            })
        });
        this.highlightlayer = new VectorLayer({
            source: new VectorSource(),
            map: map,
            style: this.originalStyle
        });
        this.highlightlayerforspecific = new VectorLayer({
            source: new VectorSource(),
            map: map,
            style: this.originalStyle
        });
        this.highlighfeature = null;
        this.highlightPointFeature = null;
        this.highlightPointFeatureInterval = null;
        this.highlightOtherFeature = null;
    }
    startup(){
        try{
            if(!this.openFlag){
                this._highlightShow();
                this.openFlag = true;
            }else{
                console.warn("FeatureHighLight功能已开启，请勿重复使用");
            }
        }catch (e) {
            throw new Error(e.messages);
        }
    }
    close(){
        if(this.openFlag){
            this._highlightClose();
            this.openFlag = false;
        }else{
            console.warn("FeatureHighLight功能未开启，无法关闭");
        }
    }

    /**
     * 高亮指定的要素
     * @param {ol-feature}
     * TODO 针对要素类型，做更多的高亮动画，类型，例如做overlay
     */
    highlightSpecificFeature(feature){
        let geometryType = feature.getGeometry().getType();

        switch (geometryType) {
            case "Point":
                this._highlightPointFeature(feature);
                break;
            default:
                this._highlightOtherFeature(feature)
                break;
        }
        return this;
    }

    /**
     * 高亮除点要素其他的要素，闪烁三次
     * @private
     */
    _highlightOtherFeature(feature){
        this._clearhighlightFeature();
        this._highlightOtherFeaturetWithAnimate(feature);
    }

    /**
     * 高亮除点要素其他的要素，闪烁三次
     * @param feature
     * @private
     */
    _highlightOtherFeaturetWithAnimate(feature){
        let copyFeature= this.highlightOtherFeature = new Feature({
            geometry: feature.getGeometry(),
            labelPoint: feature.getGeometry(),
        });
        this.highlightlayerforspecific.getSource().addFeature(copyFeature);
        //高亮的样式
        let highlightStyle = new SymbolStyle({
            image: new CircleSymbol({
                radius: 7,
                fill: new FillSymbol({color: 'yellow'}),
                stroke: new StrokeSymbol({color: 'red', width: 2})
            }),
            stroke: new StrokeSymbol({
                width: 6,
                color: 'yellow'
            }),
            fill: new FillSymbol({
                color: 'yellow'
            })
        });
        copyFeature.setStyle(highlightStyle);

        let totalTime = 5, curTime = 0;

        let timeInterval = window.setInterval(()=>{
            if(curTime < totalTime){
                let curStyle = copyFeature.getStyle();
                if(curStyle != highlightStyle)
                    copyFeature.setStyle(highlightStyle);
                else
                    copyFeature.setStyle(this.originalStyle);

                curTime ++;
            }
            else{
                window.clearInterval(timeInterval);
            }
        }, 300);
    }
    /**
     * 高亮点要素
     * @param point {ol-feature}
     * @private
     */
    _highlightPointFeature(point){
        this._clearhighlightFeature();
        this._highlightPointWithAnimate(point);
    }

    /**
     * 清除高亮的要素
     * @private
     */
    _clearhighlightFeature(){
        if (!!this.highlightPointFeature) {
            this.highlightlayerforspecific.getSource().removeFeature(this.highlightPointFeature);
            this.highlightPointFeatureInterval && window.clearInterval(this.highlightPointFeatureInterval);
            this.highlightPointFeature = null;
        }
        if (!!this.highlightOtherFeature) {
            this.highlightlayerforspecific.getSource().removeFeature(this.highlightOtherFeature);
            this.highlightOtherFeature = null;
        }
    }

    /**
     * 使用动画标记高亮要素
     * @param point
     * @private
     */
    _highlightPointWithAnimate(point){
        let centerPoint = point.getGeometry().getCoordinates();
        //this.map.getView().fit(point.getGeometry(), { duration: 500, maxZoom: 17 });

        let copyPoint = new Point(centerPoint);
        let copyFeature= this.highlightPointFeature = new Feature({
            geometry: copyPoint,
            labelPoint: copyPoint,
        });
        //create Animation Marker
        let iconStyle = new SymbolStyle({
            image: new Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 1],
                src: markerUrl
            }))
        });
        copyFeature.setStyle(iconStyle);
        this.highlightlayerforspecific.getSource().addFeature(copyFeature);

        let mapSize = this._getMapSize();
        let curPixel = this._getScreenXYByCoordinate(centerPoint);
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
        let timeIntervalu = this.highlightPointFeatureInterval = window.setInterval(()=>{
            iTime = iTime - dTime;

            let dHeight = getHeight(iHeight, (totalTime - iTime) / 1000);

            let piexl = [curPixel[0], curPixel[1] - dHeight];
            let coor = this._getCoordinateFromScreenXY(piexl);
            copyPoint.setCoordinates(coor);

            if(point.getGeometry().getCoordinates()[0] != centerPoint[0]){
                copyPoint.setCoordinates(centerPoint);
                window.clearInterval(timeIntervalu);
            }

            if(iTime <= 0) {
                copyPoint.setCoordinates(centerPoint);
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
       return this.map.getPixelFromCoordinate(coor);
    }

    /**
     * 从屏幕坐标获取地理坐标
     * @param pixel
     * @returns {ol.Coordinate}
     * @private
     */
    _getCoordinateFromScreenXY(pixel){
        return this.map.getCoordinateFromPixel(pixel);
    }

    /**
     * 获取地图的尺寸
     * @returns {ol.Size}
     */
    _getMapSize(){
        return this.map.getSize();
    }
    /**
     * 高亮鼠标经过的要素
     * @param evt {MouseEvent}
     * @private
     */
    _highlighFeature(evt){
        let features = this.map.getFeaturesAtPixel(evt.pixel);
        if(!!features){
            let _feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature)=> {
                return feature;
            });
            if (_feature !== this.highlighfeature) {
                if (!!this.highlighfeature) {
                    this.highlightlayer.getSource().removeFeature(this.highlighfeature);
                }
                if (!!_feature) {
                    this.highlightlayer.getSource().addFeature(_feature);
                }
                this.highlighfeature = _feature;
            }
        }
        else{
            if (!!this.highlighfeature) {
                this.highlightlayer.getSource().removeFeature(this.highlighfeature);
                this.highlighfeature = null;
            }
        }
    }
    /*
    展示途径要素高亮功能
     */
    _highlightShow(){
        this.mapListeners.push(this.map.on('pointermove', this._highlighFeature.bind(this)));
    }
    /*
    关闭途经要素高亮功能
     */
    _highlightClose(){
        for (let i = 0, key; i < this.mapListeners.length; i++) {
            Observable.unByKey(this.mapListeners[i]);
        }
        this.mapListeners.length = 0;

        if (!!this.highlightOtherFeature) {
            this.highlightlayerforspecific.getSource().removeFeature(this.highlightOtherFeature);
        }
        if (!!this.highlightPointFeature) {
            this.highlightlayerforspecific.getSource().removeFeature(this.highlightPointFeature);
        }
    }
}

export default FeatureFeatureHighLightUtils;