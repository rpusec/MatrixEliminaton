var matrixelim = matrixelim || {};

(function(){
	/**
	 * Check if a particular object has a set of properties. 
	 * If the object does not have a particular set of properties, then the 
	 * user-defined default properties are added. 
	 * @author  Roman Pusec
	 *
	 * How properties should be defined:
	 * 
	 * 	properties = {
	 * 		property1: 'defaultValueForProperty1',
	 * 		property2: 'defaultValueForProperty2',
	 * 		property3: 'defaultValueForProperty3',
	 * 		...
	 * 		propertyN: 'defaultValueForPropertyN'
	 *  }
	 * 
	 * @param  {Object} objRef     The object to be examined. 
	 * @param  {Object} properties The properties that we want to see whether they are a part of the sait object. 
	 * @return {Object} 			Same as objRef, but missing user-defined default values. 
	 */
	matrixelim.setDefaultProperties = function(objRef, properties){
		objRef = objRef || {};

		for(var property in properties){
			
			//if the property doesn't exist, create 
			//the property and add the default value
			if(!objRef.hasOwnProperty(property))
				objRef[property] = properties[property];
			
		}

		return objRef;
	}

	/**
	 * Added a method on every display object which can
	 * fade in/out the target display object. 
	 * @param  {String} fade   Fade type, either 'in' or 'out'.
	 * @param  {Number} amount The fade amount. 
	 * @param {Function} onComplete Function which is executed when the process is finished. 
	 */
	createjs.DisplayObject.prototype.triggerAlpha = function(fade, amount, defaultAlpha, onComplete){
		var self = this;

		var IN = 'in';
		var OUT = 'out';

		createjs.Ticker.removeEventListener('tick', onAlpha);

		fade = fade || IN;
		amount = amount || 0.025;
		defaultAlpha = defaultAlpha || 1;
	
		if(fade === OUT)
			this.alpha = defaultAlpha;
		else if(fade === IN)
			this.alpha = 0;	

		createjs.Ticker.addEventListener('tick', onAlpha);

		function onAlpha(){
			if(fade === OUT)
			{
				if(self.alpha > 0)
					self.alpha -= amount;
				else
					executeComplete();
			}
			else if(fade === IN)
			{
				if(self.alpha < defaultAlpha)
					self.alpha += amount;
				else
					executeComplete();
			}

			function executeComplete(){
				createjs.Ticker.removeEventListener('tick', onAlpha);
				if(typeof onComplete === 'function')
					onComplete();
			}
		}
	}

	createjs.DisplayObject.prototype.doCache = function(){
		this.cache(this.getBounds().x, 
			this.getBounds().y, 
			this.getBounds().width, 
			this.getBounds().height);
	}

	createjs.DisplayObject.prototype.addBlur = function(blurX, blurY, quality){
		var blurFilter = new createjs.BlurFilter(blurX, blurY, quality);
 		this.filters = [blurFilter];
 		this.updateCache();
	}
}());