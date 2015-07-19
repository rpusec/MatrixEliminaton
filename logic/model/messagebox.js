var matrixelim = matrixelim || {};

(function(){
	/**
	 * Panel which contains text and offers a close button. 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {Object} dimensions         Object which contains the width and height properties. 
	 * @param {String} text               The text to be displayed. 
	 * @param {String} textColor          The color of the text. 
	 * @param {String} bgColor            The background color. 
	 * @param {String} borderColor        Color of the border. 
	 * @param {Integer} strokeSyle        Depth of the stroke. 
	 * @param {Object} options            Additional options. 
	 * @author Roman Pusec
	 * @augments {matrixelim.TextPanel}
	 */
	function MessageBox(point, dimensions, text, title, textColor, bgColor, borderColor, onMouseOverColor, strokeStyle, options){
		this.TextPanel_constructor(point, dimensions, text, title, textColor, bgColor, borderColor, strokeStyle, options);

		var self = this;

		options = matrixelim.setDefaultProperties(options, {
			onCloseFunction: null
		});

		options = matrixelim.setDefaultProperties(options, {
			closeBtnWidth: 15,
			closeBtnHeight: 15,
			closeBtnRadius: 5,
			btnGColor: '#fff',
			strokeStyle: 2,
			btnGSize: 8
		});

		var closeBtnCont = new createjs.Container();

		var closeBtnBg = new createjs.Shape();
		setBtnBgGraphics(borderColor);

		closeBtnBg.setBounds(0, 0, options.closeBtnWidth, options.closeBtnHeight);

		var closeBtnGraphics = new createjs.Shape();
		closeBtnGraphics.graphics
		.setStrokeStyle(options.strokeStyle)
		.beginStroke(options.btnGColor)
		.moveTo(0, 0)
		.lineTo(options.btnGSize, options.btnGSize)
		.moveTo(options.btnGSize, 0)
		.lineTo(0, options.btnGSize)
		.endStroke();

		closeBtnGraphics.x += options.btnGSize/2;
		closeBtnGraphics.y += options.btnGSize/2;

		closeBtnCont.addChild(closeBtnBg, closeBtnGraphics);

		closeBtnCont.x = this.getBounds().width - closeBtnCont.getBounds().width - (closeBtnCont.getBounds().width/2);
		closeBtnCont.y += closeBtnCont.getBounds().height/2;

		this.addChild(closeBtnCont);

		closeBtnCont.addEventListener('mousedown', onCloseFrame);
		closeBtnCont.addEventListener('mouseover', onMouseOver);
		closeBtnCont.addEventListener('mouseout', onMouseOut);

		closeBtnCont.mouseChildren = false;

		function onCloseFrame(){
			closeBtnCont.removeEventListener('click', onCloseFrame);
			self.displayPanel(false);

			if(typeof options.onCloseFunction === 'function')
				options.onCloseFunction();
		}

		function onMouseOver(){
			setBtnBgGraphics(onMouseOverColor);
			matrixelim.SoundPlayer.playSound('MenuBtnHover');
		}

		function onMouseOut(){
			setBtnBgGraphics(borderColor);
			matrixelim.SoundPlayer.playSound('MenuBtnClick');
		}

		function setBtnBgGraphics(color){
			closeBtnBg.graphics
			.clear()
			.beginFill(color)
			.drawRoundRect(0, 0, options.closeBtnWidth, options.closeBtnHeight, options.closeBtnRadius)
			.endFill();
		}

		var superDisplayPanel = this.displayPanel;

		this.displayPanel = function(b){
			superDisplayPanel(b);

			if(b)
				closeBtnCont.addEventListener('click', onCloseFrame);
			else
				closeBtnCont.removeEventListener('click', onCloseFrame);
		}
	}

	var e = createjs.extend(MessageBox, matrixelim.TextPanel);

	matrixelim.MessageBox = createjs.promote(MessageBox, 'TextPanel');
}());