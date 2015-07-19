var matrixelim = matrixelim || {};

(function(){
	/**
	 * Creates a flash from the whole screen. 
	 * @param {Object} stage The stage reference of this object. 
	 * @param {String} color The color of the flash.  
	 */
	function ScreenFlash(stage, color, defaultAlpha, zIndex){
		this.Shape_constructor();
		this.graphics
		.beginFill(color)
		.drawRect(0, 0, stage.canvas.width, stage.canvas.height)
		.endFill();
		this.alpha = 0;
		this.cache(0, 0, stage.canvas.width, stage.canvas.height);

		/**
		 * Maximizes its alpha value and gradually 
		 * subtracts its value. 
		 */
		this.createFlash = function(){
			if(!stage.contains(this))
				stage.addChild(this);

			var self = this;

			this.parent.setChildIndex(this, zIndex);
			this.triggerAlpha('out', 0.005, defaultAlpha, function(){
				if(self.parent !== null)
					self.parent.removeChild(self);
			});
		}
	}

	var e = createjs.extend(ScreenFlash, createjs.Shape);

	matrixelim.ScreenFlash = createjs.promote(ScreenFlash, 'Shape');
}());