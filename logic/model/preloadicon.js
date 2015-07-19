var matrixelim = matrixelim || {};

(function(){
	/**
	 * Icon which indicates how much of the 
	 * game has been preloaded. 
	 * @param {[type]} progressbarStrokeStyle The stroke style of the progressbar. 
	 * @param {[type]} progressbarRadius Radius of the progress bar. 
	 * @param {[type]} progressbarColor The color of the progressbar. 
	 * @param {[type]} decrAlphaTill Until which alpha value should the progressbar be decreased. Used by the PreloadIcon.flashProgressBar method. 
	 * @author Roman Pusec
	 * @augments {matrixelim.LRGroup}
	 * @see LRgroup for the parameter documentation and how the 'lines' paramete should look like. 
	 */
	function PreloadIcon(point, radius, strokeStyle, alpha, lines, backgroundColor, progressbarStrokeStyle, progressbarRadius, progressbarColor, decrAlphaTill, options){
		this.LRGroup_constructor(point, radius, strokeStyle, alpha, lines, backgroundColor);

		var self = this;

		options = matrixelim.setDefaultProperties(options, {
			fontStyle: '14px Arial',
			fontColor: '#fff',
			alphaDecrAmount: 0.005,
			iconIncrAmount: 1.5,
			iconDecrAmount: 0.025
		});

		var text = new createjs.Text('0%', options.fontStyle, options.fontColor);
		text.textAlign = 'center';
		text.textBaseline = 'middle';

		this.addChild(text);

		var progressbarGraphics = new createjs.Shape();
		updateProgressbar(0);

		this.addChildAt(progressbarGraphics, 0);

		var wh = progressbarRadius + radius + strokeStyle;
		this.setBounds(0, 0, wh, wh);

		/**
		 * Adds new percentage. 
		 * @param {Number} newPercentage The new percentage to display. 
		 */
		this.setPercentage = function(newPercentage){
			if(typeof newPercentage !== 'number')
				return;

			text.text = newPercentage + '%';
			updateProgressbar(newPercentage);
		}

		/**
		 * Updates the graphics of the progressbar based on the percentage. 
		 * @param  {Number} newPercentage The new percentage to display. 
		 */
		function updateProgressbar(newPercentage){
			progressbarGraphics.graphics
			.clear()
			.setStrokeStyle(progressbarStrokeStyle)
			.beginStroke(progressbarColor)
			.arc(0, 0, progressbarRadius, 0, ((Math.PI*2)/100)*newPercentage)
			.endStroke();
			flashProgressBar();
			increaseIcon();
		}

		/**
		 * Triggers the progressbar to flash. 
		 */
		function flashProgressBar(){
			progressbarGraphics.alpha = 1;
			createjs.Ticker.removeEventListener('tick', onFlashPB);
			createjs.Ticker.addEventListener('tick', onFlashPB);
		}

		function increaseIcon(){
			self.scaleX = options.iconIncrAmount;
			self.scaleY = options.iconIncrAmount;
			createjs.Ticker.removeEventListener('tick', onIncrIcon);
			createjs.Ticker.addEventListener('tick', onIncrIcon);
		}

		function onIncrIcon(){
			if(self.scaleX - options.iconDecrAmount > 1 && self.scaleY - options.iconDecrAmount > 1)
			{
				self.scaleX -= options.iconDecrAmount;
				self.scaleY -= options.iconDecrAmount;
			}
			else
			{
				self.scaleX = 1;
				self.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onIncrIcon);
			}
		}

		/**
		 * Makes it possible for the progressbar to flash. 
		 */
		function onFlashPB(){
			if(self.parent === null)
				createjs.Ticker.removeEventListener('tick', onFlashPB);

			if(progressbarGraphics.alpha - options.alphaDecrAmount > decrAlphaTill)
				progressbarGraphics.alpha -= options.alphaDecrAmount;
			else
			{
				progressbarGraphics.alpha = decrAlphaTill;
				createjs.Ticker.removeEventListener('tick', onFlashPB);
			}
		}
	}

	var e = createjs.extend(PreloadIcon, matrixelim.LRGroup);

	matrixelim.PreloadIcon = createjs.promote(PreloadIcon, 'LRGroup');
}());