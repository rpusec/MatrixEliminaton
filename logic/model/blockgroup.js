var matrixelim = matrixelim || {};

(function(){
	function BlockGroup(point, rows, cols, dimensions, colorArr, delay, strokeStyle, strokeColor, options){
		this.Container_constructor();		

		if(point !== null)
		{
			this.x = point.x;
			this.y = point.y;
		}

		var blocks = [];

		options = matrixelim.setDefaultProperties(options, {
			alphaDecrAmount: 0.25,
			decrByRow: 0
		});

		var currDecrByRowAmount = 0;

		var blockOffset = {x: dimensions.width / cols, y: dimensions.height / rows};
		var blockDelay = delay;

		var currAlpha = 1;

		var margin = {x: blockOffset.x/2, y: blockOffset.y/2};

		for(var row = 0; row < rows; row++)
		{
			for(var col = 0; col < cols; col++)
			{
				var newBlock = new matrixelim.Block(
					new createjs.Point((blockOffset.x * col) + margin.x, (blockOffset.y * row) + margin.y),
					{width: blockOffset.x - currDecrByRowAmount, height: blockOffset.y - currDecrByRowAmount},
					colorArr,
					blockDelay,
					strokeStyle,
					strokeColor,
					options);

				blockDelay += delay;

				newBlock.alpha = currAlpha;

				blocks.push(newBlock);
				this.addChild(newBlock);
			}

			currAlpha -= options.alphaDecrAmount;
			currDecrByRowAmount += options.decrByRow;
		}

		this.setBounds(0, 0, dimensions.width, dimensions.height);

		this.regX = this.getBounds().width/2;
		this.regY = this.getBounds().height/2;

		this.x += this.getBounds().width/2;
		this.y += this.getBounds().height/2;

		this.push = function(pushTill, pushAmount, pushAmountAftermath, delay){

			if(typeof delay !== 'number')
				delay = 0;

			var delayIcrFor = delay;

			blocks.forEach(function(b){
				b.push(pushTill, pushAmount, pushAmountAftermath, delay);
				delay += delayIcrFor;
			});

		}

		this.doRotation = function(rotationSpeed, rotationDelay, incrDelayFor){
			if(typeof rotationDelay !== 'number')
				rotationDelay = 0;

			if(typeof incrDelayFor !== 'number')
				incrDelayFor = 0;

			blocks.forEach(function(b){
				b.doRotation(rotationSpeed, rotationDelay);
				rotationDelay += incrDelayFor;
			});
		}

		var switchBgFunct = null;
		var completeFunct = null;

		/**
		 * Switches all of the blocks. 
		 * @param  {Function} [_completeFunct] Function which is executed when the blocks are switched. 
		 */
		this.switchBlocks = function(_completeFunct){
			if(typeof switchBgFunct === 'function')
			{
				createjs.Ticker.removeEventListener('tick', switchBgFunct);
				switchBgFunct = null;
				completeFunct = null;
				return;
			}

			var d = delay;

			blocks.forEach(function(b){
				b.stopAnimation();
				b.doReverse(d);
				d += delay;
			});

			if(typeof _completeFunct !== 'function')
				return;
			else
				completeFunct = _completeFunct;

			switchBgFunct = createjs.Ticker.addEventListener('tick', onCheckSwitchedBackground);
		}

		/**
		 * Checks if the background had been switched. 
		 */
		function onCheckSwitchedBackground(){
			var i = checkBlockAnimationStatus();

			if(i === blocks.length)
			{
				completeFunct();
				createjs.Ticker.removeEventListener('tick', switchBgFunct);
				switchBgFunct = null;
				completeFunct = null;
			}
		}

		/**
		 * Checks how many blocks are currently being animated. 
		 * @return {Integer} The number of animated blocks. 
		 */
		function checkBlockAnimationStatus(){
			var i = 0;

			for(i; i < blocks.length; i++){
				if(blocks[i].getAnimating())
					break;
			}

			return i;
		}

		var skewAmount = 0;
		var maxSkewVal = 0;
		var side = false;
		var currSkewVal = 0;

		this.startSkewingBlocks = function(_skewAmount, _maxSkewVal){
			createjs.Ticker.removeEventListener('tick', onSkewBlocks);

			if(typeof _skewAmount !== 'number')
				_skewAmount = 0.025;

			if(typeof _maxSkewVal !== 'number')
				_maxSkewVal = 5;

			side = Math.random() < 0.5 ? true : false;

			//resetting skew values
			for(var i = 0; i < blocks.length; i++)
			{
				if((i % 2) === 0)
				{
					if(side)
						blocks[i].skewY = _maxSkewVal * -1;
					else
						blocks[i].skewY = _maxSkewVal;
				}
				else
				{
					if(side)
						blocks[i].skewY = _maxSkewVal;
					else
						blocks[i].skewY = _maxSkewVal * -1;
				}
			}

			currSkewVal = 0;
			skewAmount = _skewAmount;
			maxSkewVal = _maxSkewVal;
			createjs.Ticker.addEventListener('tick', onSkewBlocks);
		}

		function onSkewBlocks(){
			for(var i = 0; i < blocks.length; i++)
			{
				if(currSkewVal + skewAmount < maxSkewVal*2)
				{
					if((i % 2) === 0)
					{
						if(side)
							blocks[i].skewY += skewAmount;
						else
							blocks[i].skewY -= skewAmount;
					}
					else
					{
						if(side)
							blocks[i].skewY -= skewAmount;
						else
							blocks[i].skewY += skewAmount;
					}
					
				}
				else
				{
					side = !side;
					currSkewVal = 0;
				}
			}

			currSkewVal += skewAmount;
		}
	}

	var e = createjs.extend(BlockGroup, createjs.Container);

	matrixelim.BlockGroup = createjs.promote(BlockGroup, 'Container');
}());