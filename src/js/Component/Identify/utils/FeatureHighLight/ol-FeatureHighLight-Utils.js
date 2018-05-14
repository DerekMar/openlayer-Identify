import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import SymbolStyle from 'ol/style/style';
import CircleSymbol from 'ol/style/circle';
import StrokeSymbol from 'ol/style/stroke';
import FillSymbol from 'ol/style/fill';
import Base from '../ol-Base-Utils';
import Observable from 'ol/observable';
import Point from 'ol/geom/point';
import Feature from 'ol/feature';

import AnimationMarker  from '../../../AnimationMarker/ol-AnimationMarker';

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
        this.animationMarker = null;
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
        if(this.animationMarker && this.animationMarker.isOpened()){
            this.animationMarker.clearAnimation();
            this.map.removeOverlay(this.animationMarker);
            this.animationMarker = null;
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
        //this.map.getView().fit(point.getGeometry(), { duration: 500, maxZoom: 17 });
        let animationMarker = this.animationMarker =  new AnimationMarker();
        this.map.addOverlay(animationMarker);

        animationMarker.show(point);
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

        this._clearhighlightFeature();
    }
}

export default FeatureFeatureHighLightUtils;