import Base from '../ol-Base-Utils';
import VectorSource from 'ol/source/vector';
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
                if(features[i] === feature) rIndex = i;
            }
        }
        return isIndex == true ? rIndex : (rIndex === -1 ? false : true);
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