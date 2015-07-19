var matrixelim = matrixelim || {};

(function(){
	/**
	 * Represents a group of RotatingLine objects. 
	 *
	 * The parameter 'lines' should look like this:
	 *
	 * 	[
	 * 		{startAngle: 0,
	 * 			endAngle: Math.PI/2,
	 * 		 	color: '#fff',
	 * 		  	rotationSpeed: 3},
	 * 		{startAngle: 0,
	 * 			endAngle: Math.PI/2,
	 * 		 	color: '#fff',
	 * 		 	rotationSpeed: 3},
	 * 		...
	 * 	]
	 * 
	 * @param {createjs.Point} point       The coordinates of this object. 
	 * @param {Number} radius              The radius of the circle. 
	 * @param {Number} strokeStyle         The width of the lines. 
	 * @param {Number} alpha               The alpha value of the container. 
	 * @param {Object} lines               The array of line data.
	 * @author Roman Pusec
	 * @augments {createjs.Container} 
	 */
	function LRGroup(point, radius, strokeStyle, alpha, lines, backgroundColor){
		this.Container_constructor();

		var rotatingLines = [];
		var self = this;

		this.x = point.x;
		this.y = point.y;

		var bg = null;

		if(typeof backgroundColor !== 'undefined')
		{
			bg = new createjs.Shape();
			bg.graphics
			.beginFill(backgroundColor)
			.drawCircle(0, 0, radius)
			.endFill();
			this.addChild(bg);
			bg.cache(radius * -1, radius * -1, radius*2, radius*2);
		}

		lines.forEach(function(line){

			var newRL = new matrixelim.RotatingLine(
				new createjs.Point(0, 0),
				radius,
				line['startAngle'],
				line['endAngle'],
				strokeStyle,
				line['color'],
				line['rotationSpeed'],
				Math.random()*360);

			newRL.startRotation(); 
			newRL.alpha = alpha;

			rotatingLines.push(newRL);
			self.addChild(newRL);
		});

		this.hide = function(b){
			rotatingLines.forEach(function(line){
				line.hide(b);
			});

			if(b)
			{
				this.scaleX = 1;
				this.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onShowBg);
				createjs.Ticker.removeEventListener('tick', onHideBg);
				createjs.Ticker.addEventListener('tick', onHideBg);
			}
			else
			{
				this.scaleX = 0;
				this.scaleY = 0;
				createjs.Ticker.removeEventListener('tick', onShowBg);
				createjs.Ticker.removeEventListener('tick', onHideBg);
				createjs.Ticker.addEventListener('tick', onShowBg);
			}
		}

		function onHideBg(){
			if(bg === null)
				createjs.Ticker.removeEventListener('tick', onHideBg);

			if(self.scaleX > 0 && self.scaleY > 0)
			{
				self.scaleX -= 0.025;
				self.scaleY -= 0.025;
			}
			else
			{
				self.scaleX = 0;
				self.scaleY = 0;
				createjs.Ticker.removeEventListener('tick', onHideBg);
			}
		}

		function onShowBg(){
			if(bg === null)
				createjs.Ticker.removeEventListener('tick', onShowBg);

			if(self.scaleX < 1 && self.scaleY < 1)
			{
				self.scaleX += 0.025;
				self.scaleY += 0.025;
			}
			else
			{
				self.scaleX = 1;
				self.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onShowBg);
			}
		}
	}

	var e = createjs.extend(LRGroup, createjs.Container);

	matrixelim.LRGroup = createjs.promote(LRGroup, 'Container');
}());