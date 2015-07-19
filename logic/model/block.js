var matrixelim = matrixelim || {};

(function(){

	/**
	 * Represents a single block in the game. 
	 * @param {createjs.Point} point    The coordinates of the object. 
	 * @param {Object} dimensions 		Width and height of the object. 
	 * @param {String} colorArr 		The colors. Each time it is rotated, another color will be picked from the array.
	 * @param {Number} delay 			Delay in displaying the block. 
	 * @param {Object} options  		Additional options for the block. 
	 * @author Roman Pusec
	 * @augments {createjs.Shape}
	 */
	function Block(point, dimensions, colorArr, delay, strokeStyle, strokeColor, options){
		this.Shape_constructor();

		var self = this;
		var animating = false;
		var displayed = false;
		var currentColorIndex = 0;

		this.direction = null;

		this.x = point.x;
		this.y = point.y;

		delay = delay || 0;

		options = matrixelim.setDefaultProperties(options, 
			{rotationSpeed: 0.05});

		this.setBounds(dimensions.width / -2, dimensions.height / -2, 
			dimensions.width + (dimensions.width/2), dimensions.height + (dimensions.height / 2));

		this.regX = dimensions.width/2;
		this.regY = dimensions.height/2;

		this.scaleX = 0;

		this.doCache();

		//properties related to doReverse method
		var closing = false;

		//the setTimeout instance reference
		var cachedDelay = null;

		this.getColorArr = function(){
			return colorArr;
		}

		var divideBy = 0;

		/**
		 * Slightly rotates the object and gradually sets its initial rotation value back.  
		 * @param  {Number} amount    Amount of tilt, or rotation. 
		 * @param  {Number} _divideBy By which number should the rotation be divided. 
		 */
		this.tilt = function(amount, _divideBy){
			createjs.Ticker.removeEventListener('tick', onTitl);

			if(typeof amount !== 'number')
				amount = 10;

			if(typeof _divideBy !== 'number')
				_divideBy = 1.25;

			divideBy = _divideBy;
			this.rotation = amount;

			createjs.Ticker.addEventListener('tick', onTitl);
		}

		/**
		 * Tilt argorithm. 
		 */
		function onTitl(){
			if(self.rotation | 0 === 0)
				self.rotation /= divideBy;
			else
			{
				self.rotation = 0;
				createjs.Ticker.removeEventListener('tick', onTitl);
			}
		}

		var pushTill = 0;
		var pushAmount = 0;
		var pushAmountAftermath = 0;
		var push = true; //if false, the object is pulled
		var timeoutPushVal = null;

		/**
		 * Pushes the object away (alters its X and Y scale values), and then 
		 * forwards the object back to its initial scale position. 
		 * @param  {Number} _pushTill            Untill which scale value should the object's X and Y scale be deteriorated.  
		 * @param  {Number} _pushAmount          Object's X and Y scale values would be diminished. 
		 * @param  {Number} _pushAmountAftermath The pull amount of the object. 
		 * @param  {Number} delay                Until how many milliseconds should the object be pushed. 
		 */
		this.push = function(_pushTill, _pushAmount, _pushAmountAftermath, delay){
			if(timeoutPushVal !== null)
			{
				clearTimeout(timeoutPushVal);
				timeoutPushVal = null;
			}

			if(typeof delay !== 'number')
				delay = 0;

			if(delay <= 0)
				return;

			timeoutPushVal = setTimeout(function(){
				createjs.Ticker.removeEventListener('tick', onPush);

				if(typeof _pushTill !== 'number')
					_pushTill = 0.5;

				if(typeof _pushAmount !== 'number')
					_pushAmount = 0.025;

				if(typeof _pushAmountAftermath !== 'number')
					_pushAmountAftermath = 0.005;

				pushTill = _pushTill;
				pushAmount = _pushAmount;
				pushAmountAftermath = _pushAmountAftermath;
				push = true;

				self.scaleX = 1;
				self.scaleY = 1;

				createjs.Ticker.addEventListener('tick', onPush);

				timeoutPushVal = null;
			}, delay);
		}

		/**
		 * Push algorithm. 
		 */
		function onPush(){

			if(push)
			{
				if(self.scaleX + pushAmount > pushTill && self.scaleY + pushAmount > pushTill)
				{
					self.scaleX -= pushAmount;
					self.scaleY -= pushAmount;
				}
				else
				{
					self.scaleX = pushTill;
					self.scaleY = pushTill;
					push = false;
				}
			}
			else
			{
				if(self.scaleX + pushAmountAftermath < 1 && self.scaleY + pushAmountAftermath < 1)
				{
					self.scaleX += pushAmountAftermath;
					self.scaleY += pushAmountAftermath;
				}
				else
				{
					self.scaleX = 1;
					self.scaleY = 1;
					createjs.Ticker.removeEventListener('tick', onPush);		
				}
			}
		}

		/**
		 * Creates a rotation effect 
		 * and changes the color. 
		 */
		this.doReverse = function(delay){
			if(!displayed)
				return;

			if(typeof delay !== 'number')
				delay = 0;

			if(delay <= 0)
				startRotationListener();
			else
				cachedDelay = setTimeout(function(){
					cachedDelay = null;
					startRotationListener();
				}, delay);

			if(animating)
			{
				if(closing)
				{
					self.scaleX = 0;
					closing = false;
					this.switchColor();
				}
				else
				{
					self.scaleX = 1;
					closing = true;
				}
			}

			animating = true;

			function startRotationListener(){
				self.updateCache();
				createjs.Ticker.removeEventListener('tick', onReverse);
				createjs.Ticker.addEventListener('tick', onReverse);
			}
		}

		var rotationSpeed;
		var rotationTimeout = null;

		/**
		 * Will rotate this block. 
		 * @param  {Number} _rotationSpeed The speed of the rotation. s
		 */
		this.doRotation = function(_rotationSpeed, rotationDelay){
			if(rotationTimeout !== null)
				clearTimeout(rotationTimeout);

			if(rotationDelay > 0)
			{
				rotationTimeout = setTimeout(function(){
					executeContent();
					rotationTimeout = null;
				}, rotationDelay);
			}
			else
				executeContent();

			function executeContent(){
				rotationSpeed = _rotationSpeed;
				self.rotation = 0;
				createjs.Ticker.removeEventListener('tick', onDoRotation);
				createjs.Ticker.addEventListener('tick', onDoRotation);
			}
		}

		/**
		 * Makes it possible for the block to rotate. 
		 */
		function onDoRotation(){
			if(self.rotation + rotationSpeed <= 360)
				self.rotation += rotationSpeed;
			else
			{
				self.rotation = 0;
				createjs.Ticker.removeEventListener('tick', onDoRotation);
			}
		}

		this.eraseCachedDelay = function(){
			if(cachedDelay !== null)
			{
				clearTimeout(cachedDelay);
				cachedDelay = null;
			}
		}

		this.getCachedDelay = function(){
			return cachedDelay;
		}

		this.stopAnimation = function(){
			if(!animating)
				return;

			this.eraseCachedDelay();
			this.switchColor();
			createjs.Ticker.removeEventListener('tick', onReverse);
			animating = false;
		}

		this.getAnimating = function(){
			return animating;
		}

		this.getColorIndex = function(){
			return currentColorIndex;
		}

		/**
		 * Removes the object from the application. 
		 */
		this.exclude = function(){
			self.scaleX = 1;
			createjs.Ticker.removeEventListener('tick', onReverse);
			animating = false;
		}

		/**
		 * Makes it possible to remove the object 
		 * from the application. 
		 */
		function onExclude(){
			if(self.scaleX > 0)
				self.scaleX -= options.rotationSpeed;
			else
			{
				createjs.Ticker.removeEventListener('tick', onExclude);

				if(self.parent !== null)
					self.parent.removeChild(self);
			}
		}

		/**
		 * Contains the rotation algorithm. 
		 */
		function onReverse(){
			if(closing)
			{
				if(self.scaleX > 0)
					self.scaleX -= options.rotationSpeed;
				else
				{
					closing = false;
					self.switchColor();
				}
			}
			else
			{
				if(self.scaleX < 1)
					self.scaleX += options.rotationSpeed;
				else
				{
					closing = true;
					animating = false;
					createjs.Ticker.removeEventListener('tick', onReverse);
				}
			}
		}

		/**
		 * Switches to the next color 
		 * from the array. 
		 */
		this.switchColor = function(){
			self.graphics.
			clear().
			setStrokeStyle(strokeStyle).
			beginStroke(strokeColor).
			beginFill(colorArr[currentColorIndex][0]).
			drawRect(0, 0, dimensions.width, dimensions.height).
			endFill().
			endStroke().
			beginFill(colorArr[currentColorIndex][1]).
			drawRect(dimensions.width/10, dimensions.height/10, dimensions.width/2, dimensions.height/2).
			drawRect(dimensions.width/1.5, dimensions.height/1.5, (dimensions.width/4), (dimensions.height/4)).
			endFill();

			if(colorArr.length-1 !== currentColorIndex)
				currentColorIndex++;
			else
				currentColorIndex = 0;

			self.updateCache();
		}

		this.switchColor();

		if(delay === 0)
		{
			displayed = true;
			this.doReverse();
		}
		else
		{
			setTimeout(function(){
				if(self.parent !== null)
				{
					displayed = true;
					self.doReverse();
				}
			}, delay);
		}
	}

	var e = createjs.extend(Block, createjs.Shape);

	matrixelim.Block = createjs.promote(Block, 'Shape');
}());