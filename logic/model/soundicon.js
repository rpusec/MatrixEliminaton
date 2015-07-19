var matrixelim = matrixelim || {};

(function(){
	/**
	 * Represents a Sound icon. 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {Object} dimensions         Width and height of the object. Object which contains width and height properties.
	 * @param {String} iconColor          The color of the icon. 
	 * @param {Object} options            Additional options. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function SoundIcon(point, dimensions, iconColor, options){
		this.Container_constructor();

		var self = this;
		var waves = [];

		options = matrixelim.setDefaultProperties(options, {
			waveIncrSpeed: 0.025,
			initialWaveScale: 0.5
		});

		var wave = new createjs.Shape();
		wave.graphics
		.setStrokeStyle((dimensions.width/10) < 1 ? 1 : (dimensions.width/10))
		.beginStroke(iconColor).moveTo(0, 0)
		.quadraticCurveTo(dimensions.height/4, (dimensions.height/1.5)/2, 0, dimensions.height/1.5)
		.endStroke();
		waves.push(wave);
		wave.x = (dimensions.width/2)/1.1;
		wave.y = dimensions.height/2;
		wave.regX = (dimensions.height/2)/-2;
		wave.regY = (dimensions.height/1.5)/2;

		wave.scaleX = options.initialWaveScale;
		wave.scaleY = options.initialWaveScale;

		this.x = point.x;
		this.y = point.y;

		var rectShape = new createjs.Shape();
		rectShape.graphics
		.beginFill(iconColor)
		.drawRect(0, (dimensions.width/2) - ((dimensions.width/3)/2), dimensions.width/3, dimensions.height/3)
		.endFill();

		var triangleShape = new createjs.Shape();
		triangleShape.graphics
		.beginFill(iconColor)
		.drawPolyStar((dimensions.width/2.5), ((dimensions.width/3)) + ((dimensions.width/3)/2), (dimensions.height/2.5), 3, 0, 180);

		this.addChild(rectShape, triangleShape, wave);
	
		createjs.Ticker.addEventListener('tick', onIncrementWave);

		var disabled = false;

		/**
		 * Disables or enables the wave animation. 
		 */
		this.alter = function(){
			disabled = !disabled;
		}

		/**
		 * Gradually increments the scale value of the wave. 
		 */
		function onIncrementWave(){
			if(wave.alpha - options.waveIncrSpeed > 0)
			{
				wave.scaleX += options.waveIncrSpeed;
				wave.scaleY += options.waveIncrSpeed;
				wave.alpha -= options.waveIncrSpeed;
			}
			else
			{
				if(!disabled)
				{
					wave.scaleX = options.initialWaveScale;
					wave.scaleY = options.initialWaveScale;
					wave.alpha = 1;
				}
			}
		}
	}

	var e = createjs.extend(SoundIcon, createjs.Container);

	matrixelim.SoundIcon = createjs.promote(SoundIcon, 'Container');
}());