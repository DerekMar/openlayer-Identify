import SymbolStyle from 'ol/style/style';
import CircleSymbol from 'ol/style/circle';
import StrokeSymbol from 'ol/style/stroke';
import FillSymbol from 'ol/style/fill';

class Symbol{
    /*
    符号对象，记录符号的颜色和线宽
     */
    constructor(r, g, b, l){
        if(typeof r ==="number"
            && typeof g ==="number"
            && typeof b ==="number"
        ){
            this.RWeight = !!r ? r % 256: 0;//红色分量
            this.GWeight = !!g ? g % 256: 0;//绿色分量
            this.BWeight = !!b ? b % 256: 0;//蓝色分量
            this.lineWeight = !!l ? l % 30: 1;//线宽
        }else{
            console.warn("输入的数字为非数字类型， 调用Symbol")
        }
    }
    toStyle(){
        return [this.RWeight, this.GWeight, this.GWeight, this.lineWeight];
    }
    toRGBAString(){
        return 'rgba('+ this.RWeight + ',' + this.GWeight + ',' + this.BWeight + ',' + this.lineWeight + ')';
    }
}
class ColorPicker{
/*
只简单的列出一些简单的方法
TODO 列出更多好看的颜色的RGBA，拓展更多的颜色
 */
    static getRGBAColor(r, g, b, a){
        return new symbol(r, g, b, a);
    }
    static getRed(){
        return new Symbol(255, 50, 20);
    }
    static getBlue(){
        return new Symbol(20, 50 ,255);
    }
    static getGreen(){
        return new Symbol(10, 255,40);
    }
    static getRandom(){
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return new Symbol(r, g, b);
    }
}
class SymbolCreator {
    /*
     *  根据符号的类型获取符号，可以传入options可选参数
     *  TODO 完善符号类型 以及Options参数的实现 这里只简单实现了一个符号与随机颜色符号
     */
    getSymbolByGeoType(geoType, options){
        let result = null;
        if(!!geoType){
            switch (geoType){
                case "Point":
                    result = this._getPointSymbol(options);
                    break;
                case "Polyline":
                    result = this._getPolylineSymbol(options);
                    break;
                case "Polygon":
                    result = this._getPolygonSymbol(options);
                    break;
                default:
                    break;
            }
        }else{
            console.warn("输入的参数无效,调用Symbol类的getSymbolByGeoType方法");
        }
        return result;
    }
    _getPointSymbol(options){
        return new SymbolStyle({
            image: new CircleSymbol({
                radius: 6,
                snapToPixel: false,
                fill: new FillSymbol({color: 'black'}),
                stroke: new StrokeSymbol({
                    color: 'white', width: 2
                })
            })
        })
    }
    _getPolylineSymbol(options){
        return new SymbolStyle({
            stroke: new StrokeSymbol({
                width: 6,
                color: ColorPicker.getBlue().toRGBAString()
            })
        })
    }
    _getPolygonSymbol(options){
        return new SymbolStyle({
            fill: new FillSymbol({
                color: ColorPicker.getGreen().toRGBAString()
            }),
            stroke: new StrokeSymbol({
                color: ColorPicker.getRandom().toRGBAString(),
                width: 2
            })
        })
    }
}

export default SymbolCreator;