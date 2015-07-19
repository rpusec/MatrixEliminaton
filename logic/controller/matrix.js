var matrixelim = matrixelim || {};

(function(){
	/**
	 * Represents the gameplay portion of the application. 
	 * @param {createjs.Point} point       The location of the object. 
	 * @param {Object} dimensions          Object which has 'width' and 'height' properties.  
	 * @param {Integer} minNumTiles        Minimum number of tiles. 
	 * @param {Integer} maxNumTiles        Maximum number of tiles. 
	 * @param {Object} options             Additional options. 
	 * @author  Roman Pusec
	 * @augments {createjs.Container}
	 */
	function Matrix(point, dimensions, minNumTiles, maxNumTiles, stage, blockScore, lifeScore, options){
		this.Container_constructor();

		var self = this;
		var blocks = [];
		var chosenBlocks = [];

		options = matrixelim.setDefaultProperties(options, {
			onOpenBg: null,
			onFinishStage: null
		});

		//contains all of the colors the blocks can be
		var possibleColorCombinations = ['#52ff77', '#f152ff', '#fdff52', '#ff7200', '#e30909', '#4758ff']; 
		var usedColorCombinations = [];

		this.currTiles = minNumTiles;
		var currentScore = 0;

		var cbSize = 1;

		this.setBounds(0, 0, dimensions.width, dimensions.height);

		this.x = point.x;
		this.y = point.y;

		var blockWidth = dimensions.width / maxNumTiles;
		var blockHeight = dimensions.height / maxNumTiles;

		this.regX = dimensions.width/2 - blockWidth/2;
		this.regY = dimensions.height/2 - blockHeight/2;

		this.scaleX = 0;
		this.scaleY = 0;

		var contShape = new createjs.Shape();
		contShape.graphics.beginFill('rgba(91, 168, 255, 0.5)').drawRoundRect(0, 0, dimensions.width + blockWidth, dimensions.height + blockHeight, 30).endFill();
		contShape.cache(0, 0, dimensions.width + blockWidth, dimensions.height + blockHeight);

		contShape.x -= blockWidth;
		contShape.y -= blockHeight;

		this.addChild(contShape);

		var tpScore = new matrixelim.TextPanel(
			new createjs.Point(0, stage.canvas.height), 
			{width: 150, height:35}, 
			'Score: 0',
			null, 
			'#fff', 
			'rgba(0, 0, 0, 0.5)',
			'rgba(91, 168, 255, 0.5)',
			2,
			{lineWidthEnabled: false});

		var tpActiveTiles = new matrixelim.TextPanel(
			new createjs.Point(tpScore.getBounds().width, stage.canvas.height), 
			{width: 150, height:35}, 
			'Active Tiles: 0', 
			null,
			'#fff', 
			'rgba(0, 0, 0, 0.5)',
			'rgba(91, 168, 255, 0.5)',
			2,
			{lineWidthEnabled: false});

		var tpLives = new matrixelim.LifePanel(
			new createjs.Point(tpScore.getBounds().width + tpActiveTiles.getBounds().width, stage.canvas.height), 
			{width: 150, height:35}, 
			3, 
			'#4eff91', 
			'rgba(255, 255, 255, 0.5)',
			'#000',
			'rgba(19, 26, 52, 0.5)',
			'rgba(0, 0, 0, 0.5)',
			'rgba(91, 168, 255, 0.5)',
			2);

		var padding = 10;

		tpActiveTiles.x += padding;
		tpLives.x += (padding*2);

		tpScore.y -= tpScore.getBounds().height;
		tpActiveTiles.y -= tpScore.getBounds().height;
		tpLives.y -= tpScore.getBounds().height;

		stage.addChild(tpScore, tpActiveTiles, tpLives);

		this.getDimensions = function(){
			return dimensions;
		}

		this.getBlockDimensions = function(){
			return {width: blockWidth, height: blockHeight};
		}

		this.getPossibleColorCombinations = function(){
			return possibleColorCombinations;
		}

		this.getUsedColorCombinations = function(){
			return usedColorCombinations;
		}

		this.getChosenBlocks = function(){
			return chosenBlocks;
		}

		this.decreaseHealth = function(){
			tpLives.decreaseHealth();
		}

		this.restoreLives = function(){
			tpLives.restoreLives();
		}

		this.resetActiveTiles = function(){
			this.currTiles = minNumTiles;
			tpActiveTiles.setText('Active Tiles: 0');

			while(usedColorCombinations.length > 0)
				usedColorCombinations.pop();
		}

		this.getNumLives = function(){
			return tpLives.getNumLives();
		}

		this.addBlockScore = function(){
			currentScore += blockScore;
			updateScore();
		}

		this.addLifeScore = function(){
			currentScore += lifeScore * this.getNumLives();
			updateScore();
		}

		this.resetScore = function(){
			currentScore = 0;
			updateScore();
		}

		this.getScore = function(){
			return currentScore;
		}

		this.getActiveTileNum = function(){
			return cbSize;
		}

		function updateScore(){
			tpScore.setText('Score: ' + currentScore);
		}

		/**
		 * Prepares the border of the matrix. 
		 */
		this.prepareMatrix = function(){
			createjs.Ticker.removeEventListener('tick', onHideMatrix);
			createjs.Ticker.removeEventListener('tick', onPrepareMatrix);
			this.scaleX = 0;
			this.scaleY = 0;
			createjs.Ticker.addEventListener('tick', onPrepareMatrix);
		}

		/**
		 * Makes it possible to prepare the border of the matrix. 
		 */
		function onPrepareMatrix(){
			if(self.scaleX < 1 && self.scaleY < 1)
			{
				self.scaleX += 0.025;
				self.scaleY += 0.025;
			}
			else
			{
				self.scaleX = 1;
				self.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onPrepareMatrix);

				if(options.onOpenBg !== null)
					options.onOpenBg();

				self.loadHud(true);
			}
		}

		this.loadHud = function(b){
			if(typeof b !== 'boolean')
				b = true;

			tpScore.displayPanel(b);
			tpActiveTiles.displayPanel(b);
			tpLives.displayPanel(b);
		}

		this.hideMatrix = function(){
			while(blocks.length > 0)
			{
				if(this.contains(blocks[blocks.length-1]))
					this.removeChild(blocks[blocks.length-1]);
				blocks.pop();
			}

			this.scaleX = 1;
			this.scaleY = 1;

			createjs.Ticker.addEventListener('tick', onHideMatrix);
		}

		function onHideMatrix(){
			if(self.scaleX > 0 && self.scaleY > 0)
			{
				self.scaleX -= 0.025;
				self.scaleY -= 0.025;
			}
			else
			{
				self.scaleX = 0;
				self.scaleY = 0;
				createjs.Ticker.removeEventListener('tick', onHideMatrix);
			}
		}

		/**
		 * Prepares a new set of tiles. 
		 */
		this.prepareTiles = function(){
			while(blocks.length > 0)
			{
				if(this.contains(blocks[blocks.length-1]))
					this.removeChild(blocks[blocks.length-1]);
				blocks.pop();
			}

			var blockData = [];

			cbSize = Math.floor(Math.pow(this.currTiles, 2)/2);

			//choose [currTiles] number of candidate blocks
			for(var i = 0; i < cbSize; i++)
			{
				while(true)
				{
					var candidateLegit = true;

					var xCoor = Math.floor(Math.random() * maxNumTiles);
					var yCoor = Math.floor(Math.random() * maxNumTiles);

					//iterate through already chosen blocks and check 
					//if the new candidate has a same coordinate
					for(var bd = 0; bd < blockData.length; bd++)
					{
						//check if new candidate has identical 
						//coordinates as another one
						if(xCoor === blockData[bd].x && yCoor === blockData[bd].y)
						{
							candidateLegit = false;
							break;
						}
					}

					if(candidateLegit)
					{
						blockData.push({x: xCoor, y: yCoor});
						break;
					}
				}
			}

			for(var row = 0; row < maxNumTiles; row++)
			{
				for(var col = 0; col < maxNumTiles; col++)
				{
					var chosenBlockColor = null;

					//check if there is a candidate block
					for(var i = 0; i < blockData.length; i++)
					{
						if(blockData[i].x === col && blockData[i].y === row)
						{
							chosenBlockColor = possibleColorCombinations[Math.floor(Math.random()*possibleColorCombinations.length)];
							break;
						}
					}

					var newMT = new matrixelim.MatrixTile(
						new createjs.Point(blockWidth * col, blockHeight * row),
						{width: blockWidth, height: blockHeight},
						chosenBlockColor,
						0,
						'#000',
						'#0a2747',
						'#fff',
						1,
						'#0a376a');

					blocks.push(newMT);
					this.addChild(newMT);

					if(chosenBlockColor !== null)
					{
						usedColorCombinations.push(chosenBlockColor);
						chosenBlocks.push(newMT);
					}

					chosenBlockColor = null;
				}
			}

			if(this.currTiles !== maxNumTiles)
				this.currTiles++;

			tpActiveTiles.setText('Active Tiles: ' + cbSize);
		}
	}

	var e = createjs.extend(Matrix, createjs.Container);

	matrixelim.Matrix = createjs.promote(Matrix, 'Container');
}()); 