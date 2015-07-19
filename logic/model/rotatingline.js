var matrixelim = matrixelim || {};

(function(){
	/**
	 * [RotatingLine description]
	 * @param {createjs.Point} point         Coordinates of the object. 
	 * @param {Number} radius                The radius of the circle. 
	 * @param {Number} startAngle            Starting angle. 
	 * @param {Number} endAngle              Ending angle. 
	 * @param {Number} strokeStyle           The width of the line. 
	 * @param {String} color                 The color of the line. 
	 * @param {Number} rotationSpeed         The speed of the rotation. 
	 * @param {Number} rotationVal           The initial rotation value.
	 * @author Roman Pusec
	 * @augments {createjs.Shape} 
	 */
	function RotatingLine(point, radius, startAngle, endAngle, strokeStyle, color, rotationSpeed, rotationVal){
		this.Shape_constructor();

		var self = this;

		this.graphics
		.setStrokeStyle(strokeStyle, 'round', 'round')
		.beginStroke(color)
		.arc(0, 0, radius, startAngle, endAngle)
		.endStroke();

		var radiusPlusStrokeStyle = radius + (strokeStyle*2);
		this.cache(radiusPlusStrokeStyle * -1, radiusPlusStrokeStyle * -1, radiusPlusStrokeStyle*2, radiusPlusStrokeStyle*2);

		this.x = point.x;
		this.y = point.y;

		this.rotation = rotationVal;

		this.startRotation = function(){
			createjs.Ticker.addEventListener('tick', onRotation);
		}

		this.endRotation = function(){
			createjs.Ticker.removeEventListener('tick', onRotation);
		}

		function onRotation(){
			self.rotation += rotationSpeed;
			self.rotation %= 360;
		}

		this.hide = function(b){
			if(typeof b !== 'boolean')
				b = true;

			if(b)
			{
				self.visible = true;
				self.scaleX = 1;
				self.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onHide);
				createjs.Ticker.removeEventListener('tick', onShow);
				createjs.Ticker.addEventListener('tick', onHide);
			}
			else
			{
				self.visible = true;
				self.scaleX = 0;
				self.scaleY = 0;
				createjs.Ticker.removeEventListener('tick', onHide);
				createjs.Ticker.removeEventListener('tick', onShow);
				createjs.Ticker.addEventListener('tick', onShow);
			}
		}

		function onHide(){
			if(self.scaleX > 0 || self.scaleY > 0)
			{
				self.scaleX -= 0.1;
				self.scaleY -= 0.1;
			}
			else
			{
				self.scaleX = 0;
				self.scaleY = 0;
				self.endRotation();
				self.visible = false;
				createjs.Ticker.removeEventListener('tick', onHide);
			}
		}

		function onShow(){
			if(Math.floor(self.scaleX) !== 1 || Math.floor(self.scaleY) !== 1)
			{
				self.scaleX += 0.1;
				self.scaleY += 0.1;
			}
			else
			{
				self.scaleX = 1;
				self.scaleY = 1;
				self.startRotation();
				createjs.Ticker.removeEventListener('tick', onShow);
			}
		}
	}

	var e = createjs.extend(RotatingLine, createjs.Shape);

	matrixelim.RotatingLine = createjs.promote(RotatingLine, 'Shape');
}());