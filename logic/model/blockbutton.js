var matrixelim = matrixelim || {};

(function(){
	/**
	 * Button that is composed of disappearing block objects. 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {String} textStr            The text to be displayed. 
	 * @param {Object} dimensions         Object with width and height properties. 
	 * @param {Integer} amountX           The amount of blocks in the x coordinate. 
	 * @param {Integer} amountY           The amount of blocks in the y coordinate. 
	 * @param {String/Array} colors       The array of colors, or a single color. 
	 * @param {Number} moveSpeed          The speed in which blocks are moving. 
	 * @param {Function} onclickFunct     Function that is activated on click. 
	 * @param {Boolean} hide              Should the button be initially hidden. 
	 * @param {Object} options            Additional options. Include: textType, textColor. 
	 * @author Roman Pusec
	 * @augments {matrixelim.GroupDB}
	 */
	function BlockButton(point, textStr, dimensions, amountX, amountY, colors, moveSpeed, onclickFunct, hide, options){
		this.GroupDB_constructor(point, dimensions, amountX, amountY, colors, moveSpeed, hide);

		this.mouseChildren = false;

		var self = this;

		this.btnHidden = hide; 

		options = matrixelim.setDefaultProperties(options, 
			{textType: '12px Arial', 
			textColor: '#fff',
			textOutline: 3,
			textOColor: '#000'
		});

		var textContainer = new createjs.Container();

		//creating text
		this.text = new createjs.Text(textStr, options.textType, options.textColor);
		this.textBorder = this.text.clone();
		this.textBorder.outline = options.textOutline;
		this.textBorder.color = options.textOColor;

		textContainer.addChild(this.textBorder, this.text);

		this.addChild(textContainer);

		//positioning text
		textContainer.x = this.getBounds().width/2 - this.text.getBounds().width/2;
		textContainer.y = this.getBounds().height/2 - this.text.getBounds().height/2;

		var area = new createjs.Shape();
		area
		.graphics
		.beginFill('#000')
		.drawRect(0, 0, dimensions.width, dimensions.height)
		.endFill();
		
		this.hitArea = area;

		function onMouseOver(){
			self.expandAll();
			matrixelim.SoundPlayer.playSound('MenuBtnHover');
		}

		function onMouseOut(){
			self.calmUpAll();
			matrixelim.SoundPlayer.playSound('MenuBtnClick');
		}

		this.onMouseOut = onMouseOut;

		this.addMouseListeners = function(){
			this.addEventListener('mouseover', onMouseOver);
			this.addEventListener('mouseout', onMouseOut);
			this.addEventListener('click', onclickFunct);
		}

		this.removeMouseListeners = function(){
			this.removeEventListener('mouseover', onMouseOver);
			this.removeEventListener('mouseout', onMouseOut);
			this.removeEventListener('click', onclickFunct);
		}

		this.getTextContainer = function(){
			return textContainer;
		}

		this.addEventListener('click', onclickFunct);

		if(!hide)
			this.addMouseListeners();
	}

	var e = createjs.extend(BlockButton, matrixelim.GroupDB);

	e.displayBlocks = function(){
		this.GroupDB_displayBlocks();

		if(this.btnHidden)
		{
			this.getTextContainer().triggerAlpha('in');
			this.btnHidden = false;
			this.addMouseListeners();
		}
		else
		{
			this.getTextContainer().triggerAlpha('out');
			this.btnHidden = true;
			this.removeMouseListeners();
			this.onMouseOut();
		}
	}

	matrixelim.BlockButton = createjs.promote(BlockButton, 'GroupDB');
}());