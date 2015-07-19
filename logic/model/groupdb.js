var matrixelim = matrixelim || {};

(function(){
	/**
	 * Represents a group of DisappearingBlocks. 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {Object} dimensions         The dimensions, object with width and height properties. 
	 * @param {Integer} amountX           The amount of objects in x coordinate. 
	 * @param {Integer} amountY           The amount of objects in y coordinate.
	 * @param {String/Array} colors       The colors of the blocks.
	 * @param {Number} moveSpeed          The movement speed of all blocks.
	 * @param {Boolean} hide              Should the blocks be initially hidden.
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function GroupDB(point, dimensions, amountX, amountY, colors, moveSpeed, hide){
		this.Container_constructor();

		this.x = point.x;
		this.y = point.y;

		this.blocks = [];

		if(Object.prototype.toString.call(colors) !== '[object Array]' && typeof colors === 'string')
			colors = [colors];
		else if(colors === null)
			colors = ['#4ea1ff', '#2985ed', '#166bcc', '#0f54a2', '#0a2e57', '#061b33', '#030e1b', '#01070e'];

		//dimensions for each individual block
		var dbWidth = Math.floor(dimensions.width / amountX);
		var dbHeight = Math.floor(dimensions.height / amountY);

		this.setBounds(0, 0, dimensions.width, dimensions.height);

		var colorIndex = 0;

		for(var row = 0; row < amountX; row++)
		{
			for(var col = 0; col < amountY; col++)
			{
				var newDB = new matrixelim.DisappearingBlock(
					new createjs.Point(row * dbWidth, col * dbHeight),
					{width: dbWidth, height: dbHeight},
					colors[colorIndex],
					moveSpeed,
					getRandomDir(), 
					hide);

				this.addChild(newDB);
				this.blocks.push(newDB);

				if(colorIndex !== colors.length-1)
					colorIndex++;
			}
		}

		/**
		 * Returns a random direction for a DisappearingBlock. 
		 * @return {String} Direction for a DisappearingBlock. 
		 */
		function getRandomDir(){
			var dirs = ['up', 'down', 'left', 'right'];
			return dirs[Math.floor(Math.random() * dirs.length)];
		}
	}

	var e = createjs.extend(GroupDB, createjs.Container);

	/**
	 * Displays or hides all of the blocks. 
	 */
	e.displayBlocks = function(){
		this.blocks.forEach(function(b){
			b.displayBlock();
		});
	}

	e.expandAll = function(){
		this.blocks.forEach(function(b){
			b.expand();
		});
	}

	e.calmUpAll = function(){
		this.blocks.forEach(function(b){
			b.calmUp();
		});
	}

	matrixelim.GroupDB = createjs.promote(GroupDB, 'Container');
}());