import './css/index.css';//加载css样式文件
import 'ol/ol.css';
import mapCreator from './js/mapCreator';
import layerCreator from './js/layerCreator';
import Identify from './js/Component/Identify/ol-Identify';
/*
生成地图
 */
let mapCtrl = new mapCreator("map");
mapCtrl.initMap("map", {});
mapCtrl.startMap();
/*
加载wfs服务图层
 */
var layerCtrl = new layerCreator();
var layerGroup = layerCtrl.getLayerGourp();
mapCtrl.addLayer(layerGroup);
/**
 * 引入Identify
 *
 */
let identify = new Identify({
    // position: "bottom"
});
mapCtrl.getMap().addControl(identify);
identify.showIdenditfy();

/*
加载要素识别模块
*/
// let featureIdentifyCom = new featureIdentify(mapCtrl.getMap());
// featureIdentifyCom.startup();
/*
加载要素查询模块
 */
// let featureQueryCom = new featureQuery(mapCtrl.getMap());
// featureQueryCom.startup();




