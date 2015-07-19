var matrixelim = matrixelim || {};

(function(){
	/**
	 * Shows which block will be the next one. 
	 * @see matrixelim.TextPanel for parameter documentation for the constructor. 
	 * @author Roman Pusec
	 * @augments {matrixelim.TextPanel}
	 */
	function NextBlockPanel(point, dimensions, bgColor, borderColor, strokeStyle, options){
		this.TextPanel_constructor(point, dimensions, null, null, '#fff', bgColor, borderColor, strokeStyle, options);

		var currBlock = null;
		var questionmark = null;

		this.setNextBlock = function(blockColor, blockDimensions){
			if(currBlock !== null)
				this.removeChild(currBlock);

			if(questionmark !== null)
			{
				this.removeChild(questionmark);
				questionmark = null;
			}

			currBlock = new matrixelim.Block(
				new createjs.Point(0, 0),
				blockDimensions,
				[[blockColor, '#fff']],
				0,
				1,
				'#000');
			currBlock.x = this.getBounds().width/2;
			currBlock.y = this.getBounds().height/2;
			this.addChild(currBlock);
		}

		this.setUnknownBlock = function(qmarkSize){
			if(typeof qmarkSize !== 'number')
				qmarkSize = 14;

			if(questionmark !== null)
				this.removeChild(questionmark);

			if(currBlock !== null)
			{
				this.removeChild(currBlock);
				currBlock = null;
			}

			questionmark = new createjs.Text('?', qmarkSize + 'px Arial');
			questionmark.textAlign = 'center';
			questionmark.textBaseline = 'middle';

			questionmark.x = this.getBounds().width/2;
			questionmark.y = this.getBounds().height/2;

			this.addChild(questionmark);
		}
	}

	var e = createjs.extend(NextBlockPanel, matrixelim.TextPanel);

	matrixelim.NextBlockPanel = createjs.promote(NextBlockPanel, 'TextPanel');
}());