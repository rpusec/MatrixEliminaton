var matrixelim = matrixelim || {};

(function(){
	/**
	 * Icon which represents frequency rate of a pseudo song playing. 
	 * @param {createjs.Point} point       The location of the object. 
	 * @param {Object} dimensions          Width and height of the object. Object which contains width and height properties. 
	 * @param {String} lineColor           The color of each line. 
	 * @param {Integer} numLines           The number of lines. 
	 * @param {Number} rhythmDelay         The delay of each rhythm. 
	 * @param {Object} options             Additional options. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function MusicIcon(point, dimensions, lineColor, numLines, rhythmDelay, options){
		this.Container_constructor();

		var self = this;

		this.x = point.x;
		this.y = point.y;

		options = matrixelim.setDefaultProperties(options, {
			linesXScale: 0.8,
			lineYScaleDivideVal: 1.05
		});

		var lines = [];

		//adding lines
		for(var i = 0; i < numLines; i++)
		{
			var newLine = new createjs.Shape();
			newLine.graphics
			.beginFill(lineColor)
			.drawRect(0, 0, dimensions.width/numLines, dimensions.height)
			.endFill();

			//to ensure that the frequencies are animated upwards 
			newLine.regY = dimensions.height;

			newLine.x = (dimensions.width/numLines)*i;
			newLine.y = dimensions.height;
			newLine.scaleX = options.linesXScale;
			newLine.scaleY = Math.random();

			lines.push(newLine);
			this.addChild(newLine);
		}

		//makes it possible to simulate rhythm
		var rhythmInterval = setInterval(onRhythm, rhythmDelay);

		createjs.Ticker.addEventListener('tick', onDecrLines);

		/**
		 * Deactivates or activates rhythm. 
		 */
		this.alter = function(){
			if(rhythmInterval !== null)
			{
				clearInterval(rhythmInterval);
				rhythmInterval = null;
			}
			else
			{
				onRhythm();
				rhythmInterval = setInterval(onRhythm, rhythmDelay);
			}
		}

		/**
		 * Divides each line's scaleY value, making them gradually shrink. 
		 */
		function onDecrLines(){
			lines.forEach(function(line){
				if(line.scaleY > 0.1)
					line.scaleY /= options.lineYScaleDivideVal;
			});
		}

		/**
		 * Simulates rhythm. 
		 */
		function onRhythm(){
			lines.forEach(function(line){
				//to ensure that the lines do not pass value of 1
				var randNum = Math.random();
				line.scaleY = (line.scaleY + randNum) > 1 ? 1 : (line.scaleY + randNum);
			});
		}
	}

	var e = createjs.extend(MusicIcon, createjs.Container);

	matrixelim.MusicIcon = createjs.promote(MusicIcon, 'Container');
}());