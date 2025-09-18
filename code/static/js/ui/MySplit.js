class MySplit {
  constructor(left,main,right) {
    Split([left, main, right], {
        sizes: [14, 60, 26],
        minSize: [200, 0, 200], // 分别为左侧边栏、主内容区、右侧边栏设置最小宽度
        gutterSize: 4,
        elementStyle: function (dimension, size, gutterSize) {
          return {
            'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
          }
        },
        gutterStyle: function (dimension, gutterSize) {
          return {
            'flex-basis': gutterSize + 'px'
          }
        }
      });
  }
}