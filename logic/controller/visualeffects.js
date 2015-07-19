var matrixelim = matrixelim || {};

matrixelim.VisualEffects = {};

(function(){
	matrixelim.VisualEffects.STRETCH_VERTICALLY = 0;
	matrixelim.VisualEffects.STRETCH_HORIZONTALLY = 1;

	/**
	 * Stretches an object vertically or horizontally. 
	 * @param {createjs.DisplayObject} targetObject The target object to strech. 
	 * @param {Number} amount   The strech amount. 
	 * @param {Integer} dir     Direction, either vertically or horizontally. 
	 * @param {Number} chAmount Signifies for what amount should the X and Y scale decrease or increase. 
	 */
	matrixelim.VisualEffects.stretchObject = function(targetObject, amount, dir, chAmount, finalScaleVal){
		if(typeof chAmount === 'undefined')
			chAmount = 0.0025;

		if(typeof finalScaleVal !== 'number')
			finalScaleVal = 1;

		if(typeof targetObject.onStretchRef === 'undefined')
			targetObject.onStretchRef = null;

		targetObject.finalScaleVal = finalScaleVal;

		switch(dir){
			case matrixelim.VisualEffects.STRETCH_VERTICALLY : 
				if(targetObject.onStretchRef !== null)
					targetObject.removeEventListener('tick', targetObject.onStretchRef);
				targetObject.onStretchRef = onStretchVertically;

				targetObject.scaleX -= amount;
				targetObject.scaleY += amount;
				
				targetObject.addEventListener('tick', targetObject.onStretchRef);
				break;
			case matrixelim.VisualEffects.STRETCH_HORIZONTALLY : 
				if(targetObject.onStretchRef !== null)
					targetObject.removeEventListener('tick', targetObject.onStretchRef);
				targetObject.onStretchRef = onStretchHorizontally;

				targetObject.scaleX += amount;
				targetObject.scaleY -= amount;

				targetObject.addEventListener('tick', targetObject.onStretchRef);
				break;
		}
	
		function onStretchVertically(){
			if(targetObject.scaleX < targetObject.finalScaleVal && targetObject.scaleY > targetObject.finalScaleVal)
			{
				targetObject.scaleX += chAmount;
				targetObject.scaleY -= chAmount;
			}
			else
			{
				targetObject.scaleX = targetObject.finalScaleVal;
				targetObject.scaleY = targetObject.finalScaleVal;
				targetObject.removeEventListener('tick', targetObject.onStretchRef);
				targetObject.onStretchRef = null;
			}
		}

		function onStretchHorizontally(){
			if(targetObject.scaleX > targetObject.finalScaleVal && targetObject.scaleY < targetObject.finalScaleVal)
			{
				targetObject.scaleX -= chAmount;
				targetObject.scaleY += chAmount;
			}
			else
			{
				targetObject.scaleX = targetObject.finalScaleVal;
				targetObject.scaleY = targetObject.finalScaleVal;
				targetObject.removeEventListener('tick', targetObject.onStretchRef);
				targetObject.onStretchRef = null;
			}
		}
	}
}());