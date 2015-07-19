var matrixelim = matrixelim || {};

(function(){
	/**
	 * Timer which creates an event when its time runs out. 
	 * @param {createjs.Point} point         The coordiantes of the object. 
	 * @param {Integer} timeoutFrom          From which number should the timer start counting backwards. 
	 * @param {String} finTxtDispl           Text that is displayed when the counter reaches 0.
	 * @param {Long} delay                   The delay during each count.  
	 * @param {Number} radius                Radius of the lines. 
	 * @param {Number} strokeStyle           The stroke width of the lines. 
	 * @param {Number} alpha                 Alpha value of the lines. 
	 * @param {Object} lines                 Information about the lines. 
	 * @param {Function} completeFunct       The function which is executed when the timer reaches 0. 
	 * @author Roman Pusec
	 * @see matrixelim.LRGroup for how the 'lines' parameter should look like. 
	 * @augments {matrixelim.LRGroup}
	 */
	function GameStartTimer(point, timeoutFrom, finTxtDispl, delay, radius, strokeStyle, alpha, lines, backgroundColor, completeFunct, options){
		this.LRGroup_constructor(point, radius, strokeStyle, alpha, lines, backgroundColor);

		var self = this;
		var currentTime = timeoutFrom;

		var initialY = point.y;

		options = matrixelim.setDefaultProperties(options, {
			fontStyle: radius + 'px Arial',
			fontColor: '#fff',
			beginAlpha: 0,
			beginY: initialY + 250,
			additionalY: 40
		});

		var initialAddY = options.additionalY;

		this.alpha = options.beginAlpha;
		this.y = options.beginY;

		var displText = new createjs.Text(timeoutFrom, options.fontStyle, options.fontColor);
		displText.regX = displText.getBounds().width/2;
		displText.regY = displText.getBounds().height/2;
		this.addChild(displText);

		var mask = new createjs.Shape();
		redrawMask();

		mask.regX = displText.getBounds().width/2;
		mask.regY = displText.getBounds().height/2;

		displText.mask = mask;

		var maskInitialLoc = {x: mask.x, y: mask.y};

		var stInterval = null;
		var timerDisplayed = false;

		var displSpeed;

		this.displayTimer = function(){
			if(timerDisplayed)
				return;

			this.reset(false);

			createjs.Ticker.removeEventListener('tick', onHideTimer);
			createjs.Ticker.removeEventListener('tick', onDisplayTimer);

			this.y = options.beginY;
			options.additionalY = initialAddY;
			displSpeed = Math.abs(initialY - options.beginY) + options.additionalY;

			timerDisplayed = true;
			this.triggerAlpha('in', 0.1);
			createjs.Ticker.addEventListener('tick', onDisplayTimer);
		}

		this.hideTimer = function(){
			if(!timerDisplayed)
				return;

			createjs.Ticker.removeEventListener('tick', onHideTimer);
			createjs.Ticker.removeEventListener('tick', onDisplayTimer);

			this.y = initialY;
			options.additionalY = initialAddY;
			displSpeed = Math.abs(initialY - options.beginY);

			timerDisplayed = false;
			this.triggerAlpha('out', 0.1);
			createjs.Ticker.addEventListener('tick', onHideTimer);
		}

		function onDisplayTimer(){
			if(Math.floor(displSpeed) !== 0)
			{
				displSpeed /= 2;
				self.y -= displSpeed;
			}
			else
			{
				if(Math.floor(options.additionalY) !== 0)
				{
					options.additionalY /= 2;
					self.y += options.additionalY;
				}
				else
				{
					self.y = initialY;
					createjs.Ticker.removeEventListener('tick', onDisplayTimer);
					self.startTimer();
				}
			}
		}

		function onHideTimer(){
			if(Math.floor(options.additionalY) !== 0)
			{
				options.additionalY /= 2;
				self.y -= options.additionalY;
			}
			else
			{
				if(Math.floor(displSpeed) !== 0)
				{
					displSpeed /= 2;
					self.y += displSpeed;
				}
				else
					createjs.Ticker.removeEventListener('tick', onHideTimer);
			}
		}

		this.startTimer = function(){
			if(!timerDisplayed)
				return;

			if(stInterval !== null)
				clearInterval(stInterval);

			matrixelim.SoundPlayer.playSound('TimerTick');

			stInterval = setInterval(function(){
				updateTimer();
			}, delay);
		}

		this.reset = function(shouldStart){
			currentTime = timeoutFrom;
			displText.text = currentTime;
			
			if(typeof shouldStart !== 'boolean')
				shouldStart = true;

			if(shouldStart)
				this.startTimer();
			
			adjustTextAndMast();
		}

		function updateTimer(){
			currentTime--;

			if(currentTime !== 0)
				displText.text = currentTime;
			else
				displText.text = finTxtDispl;

			adjustTextAndMast();	

			matrixelim.SoundPlayer.playSound('TimerTick');

			var randNum = Math.floor(Math.random()*4);

			createjs.Ticker.removeEventListener('tick', onMaskMoveLeft);
			createjs.Ticker.removeEventListener('tick', onMaskMoveRight);
			createjs.Ticker.removeEventListener('tick', onMaskMoveDown);
			createjs.Ticker.removeEventListener('tick', onMaskMoveUp);

			switch(randNum)
			{
				case 0 : 
					mask.x += displText.getBounds().width;
					createjs.Ticker.addEventListener('tick', onMaskMoveLeft);
					break;
				case 1 : 
					mask.x -= displText.getBounds().width;
					createjs.Ticker.addEventListener('tick', onMaskMoveRight);
					break;
				case 2 : 
					mask.y -= displText.getBounds().height;
					createjs.Ticker.addEventListener('tick', onMaskMoveDown);
					break;
				case 3 : 
					mask.y += displText.getBounds().height;
					createjs.Ticker.addEventListener('tick', onMaskMoveUp);
					break;
			}

			if(displText.text === finTxtDispl)
			{
				clearInterval(stInterval);
				stInterval = null;
				completeFunct();
				return;
			}
		}

		function onMaskMoveLeft(){
			if(mask.x > maskInitialLoc.x)
				mask.x -= 1;
			else
				endMaskMove('x', onMaskMoveLeft);
		}

		function onMaskMoveRight(){
			if(mask.x < maskInitialLoc.x)
				mask.x += 1;
			else
				endMaskMove('x', onMaskMoveRight);
		}

		function onMaskMoveDown(){
			if(mask.y < maskInitialLoc.y)
				mask.y += 1;
			else
				endMaskMove('y', onMaskMoveDown);
		}

		function onMaskMoveUp(){
			if(mask.y > maskInitialLoc.y)
				mask.y -= 1;
			else
				endMaskMove('y', onMaskMoveUp);
		}

		function endMaskMove(property, tickFunct){
			mask[property] = maskInitialLoc[property];
			createjs.Ticker.removeEventListener('tick', tickFunct);

			if(displText.text === finTxtDispl)
				self.hideTimer();
		}

		function redrawMask(){
			mask.graphics.clear().beginFill().drawRect(0, 0, displText.getBounds().width, displText.getBounds().height);
		}

		function adjustTextAndMast(){
			displText.regX = displText.getBounds().width/2;
			displText.regY = displText.getBounds().height/2;
			mask.regX = displText.getBounds().width/2;
			mask.regY = displText.getBounds().height/2;
			redrawMask();
		}
	}

	var e = createjs.extend(GameStartTimer, matrixelim.LRGroup);

	matrixelim.GameStartTimer = createjs.promote(GameStartTimer, 'LRGroup');
}());