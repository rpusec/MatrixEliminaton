var matrixelim = matrixelim || {};

(function(){
	/**
	 * Panel which contains text. 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {Object} dimensions         Object which contains the width and height properties. 
	 * @param {String} text               The text to be displayed. 
	 * @param {String} textColor          The color of the text. 
	 * @param {String} bgColor            The background color. 
	 * @param {String} borderColor        Color of the border. 
	 * @param {Integer} strokeSyle        Depth of the stroke. 
	 * @param {Object} options            Additional options. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function TextPanel(point, dimensions, text, title, textColor, bgColor, borderColor, strokeStyle, options){
		this.Container_constructor();
		
		this.x = point.x;
		this.y = point.y;

		var self = this;
		var displayed = false;

		options = matrixelim.setDefaultProperties(options, {
			fontStyle: '13px Arial',
			titleFS: '15px Arial',
			borderRoundness: 10,
			additionalBoost: 0.1,
			padding: 30,
			titlePadding: 10,
			lineWidthEnabled: true,
			scaleIncrAmount: 0.025
		});

		var bgGraphics = new createjs.Shape();
		bgGraphics.graphics
		.setStrokeStyle(strokeStyle)
		.beginStroke(borderColor)
		.beginFill(bgColor)
		.drawRoundRect(0, 0, dimensions.width, dimensions.height, options.borderRoundness)
		.endFill();

		this.setBounds(0, 0, dimensions.width, dimensions.height);
		this.addChild(bgGraphics);

		var textObj = null;
		var titleTxt = null;

		if(title !== null)
		{
			titleTxt = new createjs.Text(title, options.titleFS, textColor);
			titleTxt.x += options.titlePadding/2;
			titleTxt.y += options.titlePadding/2;
			this.addChild(titleTxt);
		}

		if(text !== null)
		{
			textObj = new createjs.Text(text, options.fontStyle, textColor);
			setUpText();
			this.addChild(textObj);
		}

		this.scaleX = 0;
		this.scaleY = 0;

		var shouldAddBoost = false;

		this.setText = function(newText){
			if(textObj !== null)
			{
				textObj.text = newText;
				setUpText();
			}
		}

		function setUpText(){
			textObj.x = options.padding;
			textObj.y = (self.getBounds().height/2) - (textObj.getBounds().height/2) - (titleTxt !== null ? titleTxt.getBounds().height + options.titlePadding : 0);
			
			if(options.lineWidthEnabled)
				textObj.lineWidth = dimensions.width - (options.padding*2);
		}

		this.getText = function(){
			return textObj;
		}

		this.getTitle = function(){
			return titleTxt;
		}

		this.getDisplayed = function(){
			return displayed;
		}

		/**
		 * Displays or hides the panel. 
		 * @param  {Boolean} b True to hide the panel, false otherwise. 
		 */
		this.displayPanel = function(b){
			if(typeof b !== 'boolean')
				b = true;

			createjs.Ticker.removeEventListener('tick', onDisplayPanel);
			createjs.Ticker.removeEventListener('tick', onHidePanel);

			if(b)
			{
				displayed = false;
				shouldAddBoost = false;
				this.scaleX = 0;
				this.scaleY = 0;
				createjs.Ticker.addEventListener('tick', onDisplayPanel);
			}
			else
			{
				displayed = true;
				shouldAddBoost = true;
				this.scaleX = 1;
				this.scaleY = 1;
				createjs.Ticker.addEventListener('tick', onHidePanel);
			}
		}

		function onDisplayPanel(){
			if(!shouldAddBoost)
			{
				if(self.scaleX < 1 + options.additionalBoost + options.scaleIncrAmount && self.scaleY < 1 + options.additionalBoost + options.scaleIncrAmount)
				{
					self.scaleX += options.scaleIncrAmount;
					self.scaleY += options.scaleIncrAmount;
				}
				else
					shouldAddBoost = true;
			}
			else
			{
				if(self.scaleX - options.scaleIncrAmount > 1 && self.scaleY - options.scaleIncrAmount > 1)
				{
					self.scaleX -= options.scaleIncrAmount;
					self.scaleY -= options.scaleIncrAmount;
				}
				else
				{
					self.scaleX = 1;
					self.scaleY = 1;
					shouldAddBoost = false;
					displayed = true;
					createjs.Ticker.removeEventListener('tick', onDisplayPanel);
				}
			}
		}

		function onHidePanel(){
			if(shouldAddBoost)
			{
				if(self.scaleX < 1 + options.additionalBoost + options.scaleIncrAmount && self.scaleY < 1 + options.additionalBoost + options.scaleIncrAmount)
				{
					self.scaleX += options.scaleIncrAmount;
					self.scaleY += options.scaleIncrAmount;
				}
				else
					shouldAddBoost = false;
			}
			else
			{
				if(self.scaleX - options.scaleIncrAmount - options.scaleIncrAmount > 0 && self.scaleY - options.scaleIncrAmount - options.scaleIncrAmount > 0)
				{
					self.scaleX -= options.scaleIncrAmount;
					self.scaleY -= options.scaleIncrAmount;
				}
				else
				{
					self.scaleX = 0;
					self.scaleY = 0;
					shouldAddBoost = true;
					displayed = false;
					createjs.Ticker.removeEventListener('tick', onHidePanel);
				}
			}
		}
	}

	var e = createjs.extend(TextPanel, createjs.Container);

	matrixelim.TextPanel = createjs.promote(TextPanel, 'Container');
}());