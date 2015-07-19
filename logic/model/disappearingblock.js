var matrixelim = matrixelim || {};

(function(){
	/**
	 * Block which hides or appears. 
	 * @param {createjs.Point} point      Coordinates of the object. 
	 * @param {Object}         dimensions The dimensions, object with 'width' and 'height' properties. 
	 * @param {String} 	       color      The color of the object
	 * @param {Number}         moveSpeed  The speed when is hidden or shown.
	 * @param {String}         direction  The direction this object should appear or disappear. Options: up, down, left, right. 
	 * @param {Boolean}        hide       Should the block be initially hidden.  
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function DisappearingBlock(point, dimensions, color, moveSpeed, direction, hide){
		this.Container_constructor();

		var self = this;

		this.x = point.x;
		this.y = point.y;

		var block = new createjs.Shape();
		block
		.graphics
		.beginFill(color)
		.drawRect(0, 0, dimensions.width, dimensions.height)
		.endFill();

		var bmask = block.clone();
		block.mask = bmask;

		this.addChild(block);

		this.setBounds(0, 0, dimensions.width, dimensions.height);

		self.doCache();
		
		if(typeof hide !== 'boolean')
			hide = false;

		var hidden = hide;
		var animating = false;

		if(hide)
		{
			//self.visible = false;

			switch(direction)
			{
				case 'up' : 
					block.y -= dimensions.height;
					break;
				case 'down' : 
					block.y += dimensions.height;
					break;
				case 'left' : 
					block.x -= dimensions.width;
					break;
				case 'right' : 
					block.x += dimensions.width;
					break;
			}
		}

		/**
		 * Hides or displays the block. 
		 */
		this.displayBlock = function(){

			switch(direction)
			{
				case 'up' : 
					moveUpward();
					break;
				case 'down' : 
					moveDownward();
					break;
				case 'left' : 
					moveLeftward();
					break;
				case 'right' : 
					moveRightward();
					break;
			}
		}

		var expandAngle;
		var expandSpeed = 1.25;
		var expandDist;
		var initialPos = {x: this.x, y: this.y};

		var expanding = false;

		this.expand = function(){
			createjs.Ticker.removeEventListener('tick', onExpand);
			expandAngle = Math.random() * (Math.PI * 2);
			expandDist = {x: 5, y: 5};
			expanding = true;
			createjs.Ticker.addEventListener('tick', onExpand);
		}

		this.calmUp = function(){
			createjs.Ticker.removeEventListener('tick', onExpand);
			expandAngle = Math.atan2(this.y - initialPos.y, this.x - initialPos.x);
			expandDist = {x: 5, y: 5};
			expanding = false;
			createjs.Ticker.addEventListener('tick', onExpand);
		}

		function onExpand(){
			if(Math.floor(expandDist.x) !== 0 || Math.floor(expandDist.y) !== 0)
			{
				expandDist.x /= expandSpeed;
				expandDist.y /= expandSpeed;

				self.x -= Math.cos(expandAngle) * expandDist.x;
				self.y -= Math.sin(expandAngle) * expandDist.y;
			}
			else
			{
				createjs.Ticker.removeEventListener('tick', onExpand);
				if(expanding)
				{
					self.x |= self.x;
					self.y |= self.y;
				}
				else
				{
					self.x = initialPos.x;
					self.y = initialPos.y;
				}
			}
		}

		function moveUpward(){
			createjs.Ticker.removeEventListener('tick', onMoveUpward);
			setupWard(animating, 0, dimensions.height * -1, 'y');
			createjs.Ticker.addEventListener('tick', onMoveUpward);
		}

		function moveDownward(){
			createjs.Ticker.removeEventListener('tick', onMoveDownward);
			setupWard(animating, 0, dimensions.height, 'y');
			createjs.Ticker.addEventListener('tick', onMoveDownward);
		}

		function moveLeftward(){
			createjs.Ticker.removeEventListener('tick', onMoveLeftward);
			setupWard(animating, 0, dimensions.width * -1, 'x');
			createjs.Ticker.addEventListener('tick', onMoveLeftward);
		}

		function moveRightward(){
			createjs.Ticker.removeEventListener('tick', onMoveRightward);
			setupWard(animating, 0, dimensions.width, 'x');
			createjs.Ticker.addEventListener('tick', onMoveRightward);
		}

		function onMoveUpward(){
			if(!hidden)
			{
				if(block.y > dimensions.height * -1)
					block.y -= moveSpeed;
				else
					endOnWard(dimensions.height * -1, onMoveUpward, true, 'y');
			}
			else
			{
				if(block.y < 0)
					block.y += moveSpeed;
				else
					endOnWard(0, onMoveUpward, false, 'y');
			}
			self.updateCache();
		}

		function onMoveDownward(){
			if(!hidden)
			{
				if(block.y < dimensions.height)
					block.y += moveSpeed;
				else
					endOnWard(dimensions.height, onMoveDownward, true, 'y');
			}
			else
			{
				if(block.y > 0)
					block.y -= moveSpeed;
				else
					endOnWard(0, onMoveDownward, false, 'y');
			}
			self.updateCache();
		}

		function onMoveLeftward(){
			if(!hidden)
			{
				if(block.x > dimensions.width * -1)
					block.x -= moveSpeed;
				else
					endOnWard(dimensions.width * -1, onMoveLeftward, true, 'x');
			}
			else
			{
				if(block.x < 0)
					block.x += moveSpeed;
				else
					endOnWard(0, onMoveLeftward, false, 'x');
			}
			self.updateCache();
		}

		function onMoveRightward(){
			if(!hidden)
			{
				if(block.x < dimensions.width)
					block.x += moveSpeed;
				else
					endOnWard(dimensions.width, onMoveRightward, true, 'x');	
			}
			else
			{
				if(block.x > 0)
					block.x -= moveSpeed;
				else
					endOnWard(0, onMoveRightward, false, 'x');
			}
			self.updateCache();
		}

		function endOnWard(finalDest, tickMethodToEnd, _hidden, property){

			createjs.Ticker.removeEventListener('tick', tickMethodToEnd);
			block[property] = finalDest;
			hidden = _hidden;
			animating = false;
			self.updateCache();
		}

		function setupWard(anim, hiddenCoorValue, shownCoorValue, property){
			self.updateCache();

			if(anim)
			{
				if(hidden)
				{
					block[property] = hiddenCoorValue;
					hidden = false;
				}
				else
				{
					block[property] = shownCoorValue;
					hidden = true;
				}
			}

			animating = true;
		}
	}

	var e = createjs.extend(DisappearingBlock, createjs.Container);

	matrixelim.DisappearingBlock = createjs.promote(DisappearingBlock, 'Container');
}());