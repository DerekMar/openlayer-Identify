import Map from 'ol/map';
import View from 'ol/view';
import Projection from 'ol/proj/projection';
import Tile from 'ol/layer/tile';
import OSM from 'ol/source/osm';
import Control from 'ol/control';

class mapBase{
    constructor(){
        this.map =  null;//地图变量
        this.view = null;//地图投影参数
        this.bounds =  null;//地图的可视范围
        this.baseMap = null;//地图底图类型
        this.mapDivID =   null;//地图渲染的id
        this.projection = null;//地图投影参数

    }
    getMap(){

        return this.map;
    }
}
class mapCreator extends  mapBase{
    constructor(ID){
        super();
        //页面上地图的id
        this.mapDivID = ID;
        //定义地图图层范围
        this.bounds = [118.71735446343295, 30.927840396965042,
            118.77970605871286, 30.971974273228675];

        //定义底图图层
        this.baseMap = new Tile({
            source: new OSM()
        });;

        //定义投影参数
        this.projection = new Projection({
            code: 'EPSG:4326',
            units: 'degrees',
            axisOrientation: 'neu',
            global: true
        });

        this.view = new View({
            center: [118.74581, 30.94982],
            zoom: 14,
            projection: this.projection
        });
    }
    initMap(htmlID, options){
        this.mapDivID = htmlID;

        for(let key in options){
            !!options[key] && (this[key] = options[key]);
        }
        return this;
    }
    startMap(){
        this.map = new Map({
            layers: [
                this.baseMap
            ],
            target: this.mapDivID,
            controls: Control.defaults({
                attributionOptions: {
                    collapsible: false
                }
            }),
            view: this.view
        });
        this.map.getView().fit(this.bounds, this.map.getSize());

        return this;
    }

    addLayer(layers){
        if(!this.map){
            alert("请先初始化地图容器！");
            return;
        }
        this.map.addLayer(layers);

        return this;
    }
}

export default  mapCreator;