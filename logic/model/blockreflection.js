var matrixelim = matrixelim || {};

(function(){
	/**
	 * Represents a block that follows the main moving block (that the user controlls). 
	 * @param {Object} dimensions The dimensions of the object (width and height properties).
	 * @author Roman Pusec 
	 */
	function BlockReflection(dimensions, alpha){
		this.Shape_constructor();
		
		var color = null;
		var self = this;

		this.alpha = alpha;

		changeGraphics('#fff');

		this.regX = dimensions.width/2;
		this.regY = dimensions.height/2;

		this.cache(dimensions.width/2 * -1, dimensions.height/2 * -1, dimensions.width*2, dimensions.height*2);

		var rotationSpeed = 0;

		/**
		 * New color for the object. 
		 * @param  {String} newColor The new color. 
		 */
		this.setColor = function(newColor){
			if(newColor !== color)
			{
				changeGraphics(newColor);
				this.updateCache();
			}
		}

		this.getColor = function(){
			return color;
		}

		this.reset = function(){
			createjs.Ticker.removeEventListener('tick', onDecr);
			self.scaleX = 1;
			self.scaleY = 1;

			rotationSpeed = Math.random()*3;
			rotationSpeed *= Math.random() < 0.5 ? 1 : -1;

			createjs.Ticker.addEventListener('tick', onDecr);
		}

		function changeGraphics(newColor){
			self.graphics
			.clear()
			.beginFill(newColor)
			.drawRect(0, 0, dimensions.width, dimensions.height)
			.endFill();
			color = newColor;
		}

		function onDecr(){
			if(self.scaleX > 0 && self.scaleY > 0)
			{
				self.scaleX -= 0.025;
				self.scaleY -= 0.025;
				self.rotation += rotationSpeed;
			}
			else
			{
				if(self.parent !== null)
					self.parent.removeChild(self);
				createjs.Ticker.removeEventListener('tick', onDecr);
			}
		}
	}

	var e = createjs.extend(BlockReflection, createjs.Shape);

	matrixelim.BlockReflection = createjs.promote(BlockReflection, 'Shape');
}());