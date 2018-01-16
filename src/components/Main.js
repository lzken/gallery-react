require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片的相关数据
let imageDatas = require('../data/imageDatas.json');

//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function getImageURL(imageDatasArr){
  imageDatasArr.map((item) => {
    item.imageURL = require('../images/'+item.fileName);
  });
  return imageDatasArr;
})(imageDatas);

/*
 *获取区间内的一个随机数
 * @param low最小值，height最大值
 */
function getRangeRandom(low, height) {
  return Math.ceil(Math.random() * (height - low) + low);
}

/**
 * 获取30度的随机旋转角度(正负30度的值)
 */
function get30DegRandom() {
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}
//子组件
class ImgFigure extends React.Component{
  render() {
    let styleObj = {};
    //如果props指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }
    //如果图片的旋转角度有值且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      let prefixArr= ['-moz-','-ms-','-webkit-',''];
      prefixArr.forEach((value) => {
        styleObj[value + 'transform'] ='rotate(' + this.props.arrange.rotate + 'deg)';
      });
    }

    return (
      <figure className="img-figure" style={styleObj}>
        <img className="img-size"
          src={this.props.data.imageURL}
          alt={this.props.data.title}
        />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
      </figure>
    );
  }
}


//父组件
class AppComponent extends React.Component {

  constructor(props){//es6的语法,相当于es5的getInitialState
    super(props);
    this.state = { imgsArrangeArr:[] };
  }

  Constant = {
    centerPos: {
      left: 0,
      top: 0
    },
    hPosRange: {//水平方向的取值范围
      leftSecX: [0, 0],
      rightSecX: [0, 0],
      y: [0, 0]
    },
    vPosRange: {//垂直方向的取值范围
      x: [0, 0],
      topY: [0, 0]
    }
  };
  /*
   *重新布局所有图片
   * @param  centerIndex 指定居中排列哪个图片
   */
   rearrange(centerIndex) {
     let imgsArrangeArr = this.state.imgsArrangeArr,
         Contant = this.Constant,
         centerPos = Contant.centerPos,
         hPosRange = Contant.hPosRange,
         vPosRange = Contant.vPosRange,
         hPosRangeLeftSecX = hPosRange.leftSecX,
         hPosRangeRightSecX = hPosRange.rightSecX,
         hPosRangeY = hPosRange.y,
         vPosRangeTopY = vPosRange.topY,
         vPosRangeX = vPosRange.x,

         imgsArrangeTopArr = [], //上侧区域图片的状态信息
         topImgNum = Math.ceil(Math.random() * 2), //取一个或者不取
         topImgSpliceIndex = 0, //声明上侧的图片是从数组对象的哪个位置（index)拿出来的
         imgsArrangeCenterArr =imgsArrangeArr.splice(centerIndex, 1); //用来存储居中图片的状态信息

     //首先居中centerIndex的图片
     imgsArrangeCenterArr[0].pos = centerPos;

     //居中的curryIndex的图片不需要旋转
     imgsArrangeCenterArr[0].rotate = 0;

     //取出要布局上侧的图片的状态信息
     topImgSpliceIndex = Math.ceil(Math.random() * imgsArrangeArr.length - topImgNum);
     imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

     //布局位于上侧的图片
     imgsArrangeTopArr.forEach(function(value, index){
       imgsArrangeTopArr[index] = {
         pos : {
           top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
           left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
         },
         rotate: get30DegRandom()
       }
     });

     //布局左右两侧的图片
     for(var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
       let hPosRangeLorRX = null;
       if(i < k) {
         hPosRangeLorRX = hPosRangeLeftSecX;
       }else {
         hPosRangeLorRX = hPosRangeRightSecX;
       }
       imgsArrangeArr[i] = {
         pos : {
           top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
           left: getRangeRandom(hPosRangeLorRX[0], hPosRangeLorRX[1])
         },
         rotate: get30DegRandom()
       }
     }
     if(imgsArrangeTopArr && imgsArrangeTopArr[0]) {
       imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
     }
     imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
     this.setState({
       imgsArrangeArr: imgsArrangeArr
     });
   }

  //图片加载走，为每张图片计算其加载位置范围
  componentDidMount(){

    // 首先拿到舞台的大小
    let stageDOM = this.refs.stage,
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //拿到imageFigure的大小
    let imgFigrueDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigrueDOM.scrollWidth,
        imgH = imgFigrueDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }

    //计算左侧，右侧区域的位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    //计算上侧区域位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }
  render() {
    let controllerUnits = [], imgFigures = [];
    imageDatas.forEach(function(value, index){
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos : {
            left: 0,
            top: 0
          },
          rotate: 0
        }

      }

      imgFigures.push(<ImgFigure data={value} ref={'imgFigure'+index}
                                 arrange={this.state.imgsArrangeArr[index]}
                                 key={index}/>);
    }.bind(this));
    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

// AppComponent.defaultProps = {
// };

export default AppComponent;
