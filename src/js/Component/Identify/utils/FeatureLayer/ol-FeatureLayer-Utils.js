import Base from '../ol-Base-Utils';
import VectorSource from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import TileLayer from 'ol/layer/tile';
import LayerGroup from 'ol/layer/group';
import ImageLayer from 'ol/layer/image';
/**
 * OpenLayers Feature Layer Utils. Help to Use Layer and Feature;
 * @constructor
 * @extends {ol.Base.Utils}
 * @param {lo.map} map
 */
class FeatureIdentifyUtils extends Base{
    constructor(map){
        super(map);
    }

    /**
     *
     */
    getVectorLayerInfo(layers){
        let result = [];
        for (let i = 0, length = layers.array_.length; i < length; i++){
            let layer = layers.array_[i];
            if(!(layer instanceof  VectorLayer || layer instanceof LayerGroup)) continue;

            let layerinfo = {};
            layerinfo.oid = layer.ol_uid;
            layerinfo.title = this.getVectorLayerTitle(layer);
            layerinfo.layerdata = layer;
            layerinfo.icon = "layer";
            layerinfo.value = "layer_" + layerinfo.oid;
            if(layer instanceof LayerGroup){
                let childlayer = this.getVectorLayerInfo(layer.getLayers());
                layerinfo.childLayer = childlayer;
                layerinfo.icon = "layergroup";
                layerinfo.value = "layergroup_" + layerinfo.oid;
            }

            result.push(layerinfo);
        }
        return result;
    }

    /**
     * @public
     * @param {ol-feature} feature
     * @returns {ol-layer} if no layer return null
     */
    getLayerByFeature(feature){
        let layersCollection = this.map.getLayers();
        let result = this._getLayerByFeature(layersCollection, feature);
        return result;
    }
    /**
     * @public
     * @param {ol-feature} feature
     * @returns {ol-layer} if no layer return null
     * @desc given the visible layer whicn the spectic feature
     */
    getVisibleLayerByFeature(feature){
        let layersCollection = this.map.getLayers();
        let result = this._getLayerByFeature(layersCollection, feature, {visible: true});
        return result;
    }
    /**
     * @private
     * @param {ol-Collection} layersCollection
     * @param {ol-feature} feature
     * @returns {ol-layer} if no layer return null
     * TODO make all of the layerType are useful
     */
    _getLayerByFeature(layersCollection, feature, filterOtions){
        let result = null, layers = layersCollection.getArray();

        if(!!layers){
            for(let i = 0, length = layers.length; i < length; i++){
                let layer = layers[i];
                // filter the propertity
                if(this._filterLayer(layer, filterOtions))
                    break;
                //indincate the layer type
                if(layer instanceof LayerGroup){
                    result = this._getLayerByFeature(layer.getLayers(), feature);
                    if(result) break;
                }else{
                    let source = layer.getSource && layer.getSource();
                    if(source instanceof VectorSource) {
                        let hasFeatures = this._isFeatureInVectorSource(source, feature, false);
                        if (hasFeatures) {
                            result = layer; break;
                        }
                    }else if(source instanceof ImageLayer){
                        //TODO ImageLayer process
                    }else if(source instanceof TileLayer){
                        //TODO TileLayer process
                    }
                }
            }
        }
        return result;
    }

    /**
     *
     * @param filterOtions layer's Propertity
     * @private
     * @desc filter layer's Propertity
     * @return {boolean} isHasFilterPropertity
     */
    _filterLayer(layer, filterOtions){
        let options = filterOtions || {};
        let layerPropertity = layer.getProperties();

        for (let key in filterOtions){
            if(options[key] !== layerPropertity[key])
                return true;
        }
        return false;
    }
    /**
     * @private
     * @param {ol-source} source
     * @param {ol-feature} feature
     * @param {boolean} isIndex
     * @returns {number} if isIndex is true
     * @returns {boolean} if isIndex is false
     * @desc judge the feature is nor in the specified source
     */
    _isFeatureInVectorSource(source, feature, isIndex){
        let features = source.getFeatures(), rIndex = -1;
        if(features && features.length > 0){
            for(let i = 0, length = features.length; i < length; i++){
                if(features[i].ol_uid === feature.ol_uid) {
                    rIndex = i;
                    break;
                }
            }
        }
        return isIndex == true ? rIndex : (rIndex === -1 ? false : true);
    }

    /**
     * 查找是否在给定的图层上
     * @param layer
     * @param feature
     * @return {boolean}
     */
    isFeatureInLayer(layer, feature){
        let result = false;
        if(layer instanceof LayerGroup){
            let _layers = layer.getLayers().array_;
            for (let i = 0, length = _layers.length; i < length; i++ ){
                let _result = this.isFeatureInLayer(_layers[i], feature);
                if(_result){
                    result = _result;
                    break;
                }
            }
        }else if(layer instanceof VectorLayer){
            result = this._isFeatureInVectorSource(layer.getSource(), feature);
        }
        return result;
    }

    /**
     * 要素集中获取指定图层的要素
     * @param features
     * @param layer
     * @return {Array}
     */
    getFeaturesByLayerFilter(features, layer){
        let result = [];
        if(!!features && features.length > 0){
            for (let i = 0, length = features.length; i < length; i++){
                let feature = features[i];
                if(this.isFeatureInLayer(layer, feature))
                    result.push(feature);
            }
        }
        return result;
    }
    /**
     *
     * search all of the features inside extent in all layers
     * @param layers
     * @param extent
     * @return {Array}
     */
    getFeatureByExtent(layers, extent, options){
        let features = [], _options = options || {};
        for(let i = layers.length - 1; i >= 0; i--){
            let layer = layers[i];
            if(_options.visible && !layer.getVisible()) continue;

            if(layer instanceof LayerGroup){
                let _features = this.getFeatureByExtent(layer.getLayers().array_, extent, _options);
                features = features.concat(_features);
                if(_options.topmost && features.length > 0) break;
            }else{
                let source = layer.getSource && layer.getSource();
                if(source instanceof VectorSource) {
                    let _features = source.getFeaturesInExtent(extent);
                    features = features.concat(_features);
                    if(_options.topmost && features.length > 0) break;
                }
            }
        }
        return features;
    }

    /**
     *
     */
    getVectorLayerTitle(layer){
        let title = "无标题";
        if(!!layer){
            if(layer instanceof VectorLayer || layer instanceof LayerGroup) {
                if(layer.get("title")) {
                    title = layer.get("title");
                }
            }
        }
        return title;
    }

    /**
     * 根据Layer的OL_OID返回对应的Layer对象
     * @param oid
     */
    getLayerByLayerID(oid, layers){
        let result = null;
        if(layers){
            for (let i = 0, length = layers.length; i < length; i++){
                let layer = layers[i];

                if(layer.ol_uid == oid){
                    result = layer;
                    break;
                }
                if(layer instanceof LayerGroup){
                    let _layer = this.getLayerByLayerID(oid, layer.getLayers().array_);
                    if(_layer) {
                        result = _layer;
                        break;
                    };
                }
            }
        }
        return result;
    }
    /**
     * get the topmost layer from all of the layer
     * @param layers
     * @return {ol/layer/layer}
     */
    geTopMostLayer(layers){
        let _layer = null;
        for(let i = layers.length - 1; i >= 0; i--){
            let layer = layers[i];
            if(layer instanceof LayerGroup){
                _layer = this.geTopMostLayer(layer.getLayers().array_);
            }else{
                let source = layer.getSource && layer.getSource();
                if(source instanceof VectorSource) {
                    _layer = layer;
                    break;
                }
            }
        }
        return _layer;
    }
}
export default FeatureIdentifyUtils;