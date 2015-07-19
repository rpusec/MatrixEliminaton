var matrixelim = matrixelim || {};

/**
 * The main controller for managing the logic in the game. 
 * @author  Roman Pusec
 */
(function(){
	var gameInitialized = false
	, stage = null
	, bgBlockGroup
	, menuBtns = []
	, menuLines
	, matrix
	, gameStartTimer
	, gpBlock = null
	, gpBlockSpeed = 4
	, reflBlockPool
	, signature
	, gameTitle
	, posFlash
	, negFlash
	, gameOverPanel
	, specialThanksFrame
	, helpFrame
	, txtProgress
	, endStage = false
	, savedMovingBlock
	, nextBlockPanel
	, musicCB
	, soundCB;

	//determine in which direction should the block appear and move
	var LEFT = 0;
	var RIGHT = 1;
	var UP = 2;
	var DOWN = 3;

	/**
	 * Configures the whole application, sets the FPS, 
	 * renders the game, and starts the preloader.  
	 */
	matrixelim.init = function(){
		if(gameInitialized)
			return;

		//canvas reference
		stage = new createjs.Stage(document.getElementsByTagName('canvas')[0]);

		window.stage = stage;

		stage.enableMouseOver(10);

		//setting fps and starts rendering the game 
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener('tick', onRenderGame);

		gameInitialized = true;	

		//setting up preloader graphics, manifest, and starting the preload process
		matrixelim.Preloader.initPreloadGraphics(stage);
		matrixelim.Preloader.setManifest([
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirImages, 'activetiles.png', 'ActiveTiles'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirImages, 'hud.png', 'Hud'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirImages, 'keys.png', 'Keys'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'bg_change.mp3', 'BgChange'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'block_eliminated.mp3', 'BlockEliminated'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'block_not_eliminated.mp3', 'BlockNotEliminated'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'menu_btn_click.mp3', 'MenuBtnClick'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'menu_btn_hover.mp3', 'MenuBtnHover'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'timer_tick.mp3', 'TimerTick'),
			new matrixelim.Preloader.Item(matrixelim.Preloader.directories.dirSound, 'music.mp3', 'Music')]);
		matrixelim.Preloader.startPreload();

		stage.addEventListener('click', onFocusMainWindow);
	}

	/**
	 * Called when the preloader is finished. Creates the 
	 * background, establishes the matrix, etc.
	 */
	matrixelim.initializeGame = function(){
		prepareBackground(4, 4);
		prepareRotatingLines();

		prepareMenuBtns([
			{title: 'Start Game', onclick: function(){
				if(!specialThanksFrame.getDisplayed() && !helpFrame.getDisplayed())
					hideMenu(true, function(){
						matrix.prepareMatrix();
					});
			}},
			{title: 'Help', onclick: function(){
				if(!specialThanksFrame.getDisplayed() && !helpFrame.getDisplayed())
					hideMenu(true, function(){
						helpFrame.displayPanel();
					});
			}},
			{title: 'Special Thanks', onclick: function(){
				if(!specialThanksFrame.getDisplayed() && !helpFrame.getDisplayed())
					specialThanksFrame.displayPanel();
			}}
		], 10, {width: 130, height: 50}, 7, 3, 1);

		gameStartTimer = new matrixelim.GameStartTimer(new createjs.Point(stage.canvas.width/2, stage.canvas.height/2), 3, 'Go!', 1000, 30, 5, 0.5, [
			{startAngle: 0,
	  			endAngle: Math.PI/2,
	  		 	color: '#65adff',
	  		  	rotationSpeed: 3},
	  		{startAngle: 0,
	  			endAngle: Math.PI/2,
	  		 	color: '#65adff',
	  		  	rotationSpeed: -5}],
	  		  	'rgba(0,0,0,0.25)',
	  		  	function(){
	  		  		startGamePlay();
	  		  	});

		matrix = new matrixelim.Matrix(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			{width: stage.canvas.width/2, height: stage.canvas.height/2},
			3,
			10,
			stage,
			50,
			100,
			{onOpenBg: function(){
				matrix.prepareTiles();
				nextBlockPanel.displayPanel(true);
				prepareRandomMovingBlock();
				gameStartTimer.displayTimer();
			}});

		gameOverPanel = new matrixelim.ChoicePanel(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			{width: matrix.getDimensions().width, height: 150},
			'No info. ',
			'Game Over',
			'#fff',
			'rgba(0, 0, 0, 0.5)',
			'#3494ff',
			2,
			[
				{title: 'Restart game', executeFunct: function(){
					matrix.resetScore();
					matrix.resetActiveTiles();
					matrix.restoreLives();
					matrix.prepareTiles();
					prepareRandomMovingBlock();
					gameStartTimer.displayTimer();
				}},
				{title: 'Back to main menu', executeFunct: function(){
					matrix.resetScore();
					matrix.resetActiveTiles();
					matrix.restoreLives();
					matrix.hideMatrix();
					matrix.loadHud(false);
					nextBlockPanel.displayPanel(false);
					hideMenu(false);
				}}
			],
			{width: 150, height:40},
			null);

		gameOverPanel.x -= gameOverPanel.getBounds().width/2;
		gameOverPanel.y -= gameOverPanel.getBounds().height/2;

		stage.addChild(matrix);
		stage.addChild(gameStartTimer);
		stage.addChild(gameOverPanel);

		signature = new TypedText(new createjs.Point(stage.canvas.width, stage.canvas.height),
			 'Copyright (C) rpusec, 2015',
			 12,
			 '#81b9ff',
			 'Arial');

		signature.x -= signature.getBounds().width + 10;
		signature.y -= signature.getBounds().height + 10;
		
		signature.animate();
		stage.addChild(signature);

		gameTitle = new TypedText(new createjs.Point(stage.canvas.width/2, menuBtns[0].y - menuBtns[0].getBounds().height),
			'Matrix Elimination', 25, '#fff', 'Lucida Console');
		gameTitle.x -= gameTitle.getBounds().width/2;
		gameTitle.animate();
		stage.addChild(gameTitle);

		reflBlockPool = new matrixelim.ReflBlockPool(stage, matrix.getBlockDimensions(), 0.5);
		reflBlockPool.expandPool(50);

		posFlash = new matrixelim.ScreenFlash(stage, 'rgb(117, 255, 117)', 0.25, stage.getChildIndex(matrix));
		negFlash = new matrixelim.ScreenFlash(stage, 'rgb(255, 44, 44)', 0.25, stage.getChildIndex(matrix));

		specialThanksFrame = new matrixelim.MessageBox(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			{width: 400, height: 160},
			'Thanks to the creators of CreateJS that provided me with the appropriate tools to create this game. http://www.createjs.com \n\n' + 
			'Thanks to freeSFX for providing me with sound effects used in the game. http://www.freesfx.co.uk/',
			'Special Thanks',
			'#fff',
			'rgba(0,0,0,0.7)',
			'#3e99ff',
			'#bcdcff',
			2);

		specialThanksFrame.x -= specialThanksFrame.getBounds().width/2;
		specialThanksFrame.y -= specialThanksFrame.getBounds().height/2;

		txtProgress = new createjs.Text('', '12px Arial', '#fff');
		txtProgress.x = stage.canvas.width/2;
		txtProgress.y = menuBtns[menuBtns.length-1].y + menuBtns[menuBtns.length-1].getBounds().height + 10;
		txtProgress.textAlign = 'center';
		txtProgress.triggerAlpha('in');
		stage.addChild(txtProgress);

		setNewProgress();

		stage.addChild(specialThanksFrame);

		helpFrame = new matrixelim.Frame(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			{width: stage.canvas.width/1.2, height: stage.canvas.height/1.2},
			'Help',
			'#fff',
			'rgba(0,0,0,0.5)',
			'#53acff',
			'#acd7ff',
			3,
			{
				onCloseFunction: function(){
					hideMenu(false);
				}
			});

		helpFrame.x -= helpFrame.getBounds().width/2;
		helpFrame.y -= helpFrame.getBounds().height/2;

		helpFrame.addContent('Introduction', 
			['Welcome to Matrix Elimination. The point of this game is to eliminate prominent tiles that appear in the cells of the matrix. ', 
			'Once they\'ve been eliminated, a greater number of tiles will be displayed, and the process continues until the player is left without any lives. ']);

		helpFrame.addContent('Active Tiles', 
			[new createjs.Bitmap(matrixelim.Preloader.getPreloader().getResult('ActiveTiles').src), 
			'Active Tiles are prominent tiles which are presented in different colors in the matrix. ', 
			'To eliminate them, the player must bring the tile that they\'re controlling onto an active tile of the same color, then immediately hit space. ' + 
			'Repeat the same process until all tiles are eliminated. ']);

		helpFrame.addContent('Controls',
			[new createjs.Bitmap(matrixelim.Preloader.getPreloader().getResult('Keys').src), 
			'The tile that the player controls is moved with the arrow keys. If the tile appeared on the horizontal position, then the tile is controlled with the ' + 
			'up and down arrow keys, otherwise it is controlled with the left and right arrow keys. ',
			'The ESC key will abort the current game. ',
			'Press SPACE to eliminate an active tile. ']);

		helpFrame.addContent('Hud',
			[new createjs.Bitmap(matrixelim.Preloader.getPreloader().getResult('Hud').src),
			'The game displays a hud, which shows lives, number of active tiles, score, and the next block. ']);

		helpFrame.addContent('Saved score?',
			['Your score and max active tile reached is saved using localStorage support, meaning your progress is saved in your browser. ',
			'Your browser ' + (matrixelim.SaveManager.isStorageSupported() ? 'supports' : 'DOES NOT support') + ' localStorage, the application tested it. ']);

		helpFrame.prepareScrollbar('#43a4ff', 8);
		stage.addChild(helpFrame);

		nextBlockPanel = new matrixelim.NextBlockPanel(
			new createjs.Point(stage.canvas.width, 0),
			{width: 100, height:100},
			'rgba(0,0,0,0.5)',
			'#43a4ff',
			3);

		nextBlockPanel.x -= nextBlockPanel.getBounds().width;

		stage.addChild(nextBlockPanel);

		window.onkeydown = onkeydown;

		matrixelim.SoundPlayer.playMusic('Music');

		musicCB = new matrixelim.CheckBox(new createjs.Point(stage.canvas.width, 10), {width: 30, height: 30}, {
			onSelectFunct: function(){
				matrixelim.SoundPlayer.activateMusic(true);
			},
			onUnselectFunct: function(){
				matrixelim.SoundPlayer.activateMusic(false);
			},
			icon: new matrixelim.MusicIcon(new createjs.Point(0, 0), {width: 30, height: 30}, '#fff', 5, 500),
			selected: true
		});

		musicCB.x -= musicCB.getBounds().width - 5;
		musicCB.y += musicCB.getBounds().height/2;
		stage.addChild(musicCB);

		soundCB = new matrixelim.CheckBox(new createjs.Point(stage.canvas.width, 10), {width: 30, height: 30}, {
			onSelectFunct: function(){
				matrixelim.SoundPlayer.activateSound(true);
			},
			onUnselectFunct: function(){
				matrixelim.SoundPlayer.activateSound(false);
			},
			icon: new matrixelim.SoundIcon(new createjs.Point(0, 0), {width: 30, height: 30}, '#fff'),
			selected: true
		});

		soundCB.x -= soundCB.getBounds().width*2;
		soundCB.y += soundCB.getBounds().height/2;
		stage.addChild(soundCB);
	}

	/**
	 * Refreshes the game. 
	 */
	function onRenderGame(e){
		stage.update(e);
	}

	function startGamePlay(){
		matrix.restoreLives();
		createjs.Ticker.addEventListener('tick', onStartGamePlay);
		startAddingBlockReflections(true);
	}

	var blReflInterval = null;

	/**
	 * Starts adding the matrixelim.BlockReflection objects. 
	 * @param  {Boolean} b True to activate listener specified for adding matrixelim.BlockReflection objects, false otherwise. 
	 */
	function startAddingBlockReflections(b){
		if(typeof b !== 'boolean')
			b = true;

		if(blReflInterval !== null)
		{
			clearInterval(blReflInterval);
			blReflInterval = null;
		}

		if(b)
		{
			blReflInterval = setInterval(function(){
				if(gpBlock !== null)
				{
					var poolBlockRefl = reflBlockPool.addObjectFromPool(new createjs.Point(gpBlock.x, gpBlock.y));
					poolBlockRefl.parent.setChildIndex(poolBlockRefl, stage.getChildIndex(gpBlock));
					poolBlockRefl.setColor(gpBlock.getColorArr()[0][0]);
				}
			}, 150);
		}
	}

	/**
	 * Provides algoritms for colliding with other blocks, 
	 * load next level, block movement, etc. 
	 */
	function onStartGamePlay(){
		if(matrix.getNumLives() === 0)
		{
			matrixelim.SaveManager.setSave(matrix.getScore(), matrix.getActiveTileNum());
			createjs.Ticker.removeEventListener('tick', onStartGamePlay);
			startAddingBlockReflections(false);
			gameOverPanel.setText(
				'Score: ' + matrix.getScore() + ' and ' + 
				' Active Tiles: ' + matrix.getActiveTileNum());
			gameOverPanel.displayPanel();
			return;
		}

		if(gpBlock === null)
		{
			if(!endStage)
			{
				gpBlock = savedMovingBlock;
				stage.addChild(gpBlock);
				prepareRandomMovingBlock();
			}
		}

		if(endStage)
		{
			bgBlockGroup.doRotation(2, 0, 50);
			bgBlockGroup.push(undefined, undefined, undefined, 100);
			matrix.addLifeScore();
			matrix.restoreLives();
			createjs.Ticker.removeEventListener('tick', onStartGamePlay);
			startAddingBlockReflections(false);
			matrix.prepareTiles();
			gameStartTimer.displayTimer();
			prepareRandomMovingBlock();
			matrixelim.SaveManager.setSave(matrix.getScore(), matrix.getActiveTileNum());
			endStage = false;
			stage.removeChild(gpBlock);
			gpBlock = null;
		}
		else
		{
			if(gpBlock !== null)
			{
				switch(gpBlock.direction)
				{
					case LEFT : 
						gpBlock.x += gpBlockSpeed;

						if(gpBlock.x > stage.canvas.width)
							removeMovingBlock(false);
						break;
					case RIGHT : 
						gpBlock.x -= gpBlockSpeed;

						if(gpBlock.x < 0)
							removeMovingBlock(false);
						break;
					case UP : 
						gpBlock.y += gpBlockSpeed;

						if(gpBlock.y > stage.canvas.height)
							removeMovingBlock(false);
						break;
					case DOWN : 
						gpBlock.y -= gpBlockSpeed;

						if(gpBlock.y < 0)
							removeMovingBlock(false);
						break;
				}
			}
		}
	}

	function onkeydown(e){
		if(matrix.getUsedColorCombinations().length === 0)
			return;

		//prevent default js execution when the arrow keys or spacebar were pressed
		if(e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 32 || e.keyCode === 27)
			e.preventDefault();

		if(gpBlock !== null)
		{
			if(gpBlock.direction !== null)
			{
				switch(gpBlock.direction)
				{
					case LEFT : 
					case RIGHT : 
						upDownCombo();
						break;
					case UP : 
					case DOWN : 
						leftRightCombo();
						break;
				}

				if(e.keyCode === 32) //space
				{
					var chosenBlocks = matrix.getChosenBlocks();
					var eliminated = false;

					//check if the block collides with another block from the matrix
					for(var i = 0; i < chosenBlocks.length; i++)
					{
						//to ensure that two tiles of the same color won't be eliminated
						if(eliminated)
							break;

						var pt = chosenBlocks[i].globalToLocal(gpBlock.x, gpBlock.y);

						if(chosenBlocks[i].hitTest(pt.x, pt.y))
						{
							var cbColorArr = chosenBlocks[i].getColorArr();

							//checking if the color is the same
							if(cbColorArr[0][0] === gpBlock.getColorArr()[0][0] && chosenBlocks[i].getColorIndex()-1 === 0)
							{
								chosenBlocks[i].doReverse(); //removes the block from matrix
								var usedColorCombArr = matrix.getUsedColorCombinations();

								//removes the color that was associated with the block that was removed
								for(var j = 0; j < usedColorCombArr.length; j++)
								{
									if(usedColorCombArr[j] === gpBlock.getColorArr()[0][0])
									{
										usedColorCombArr.splice(j, 1);
										eliminated = true;
										break;
									}
								}
							}
						}
					}

					removeMovingBlock(eliminated);
				}

				if(e.keyCode === 27)
				{
					createjs.Ticker.removeEventListener('tick', onStartGamePlay);
					startAddingBlockReflections(false);
					gameOverPanel.setText(
						'Game aborted. \n\n' + 
						'Score: ' + matrix.getScore() + ' and ' + 
						' Active Tiles: ' + matrix.getActiveTileNum());
					gameOverPanel.displayPanel();
					stage.removeChild(gpBlock);
					gpBlock = null;
				}
			}
		}

		/**
		 * Moves the block up or down. 
		 * @param  {Number} tiltAmount Amount of tilt. 
		 */
		function upDownCombo(tiltAmount){
			if(typeof tiltAmount !== 'number')
				tiltAmount = 25;

			if(e.keyCode === 38) //up
			{
				gpBlock.y -= matrix.getBlockDimensions().height;

				switch(gpBlock.direction)
				{
					case LEFT :
						gpBlock.tilt(tiltAmount*-1);
						break;
					case RIGHT : 
						gpBlock.tilt(tiltAmount);
						break;
				}
			}
			else if(e.keyCode === 40) //down
			{
				gpBlock.y += matrix.getBlockDimensions().height;

				switch(gpBlock.direction)
				{
					case LEFT :
						gpBlock.tilt(tiltAmount);
						break;
					case RIGHT : 
						gpBlock.tilt(tiltAmount*-1);
						break;
				}
			}
		}

		/**
		 * Moves the block left or right. 
		 * @param  {Number} tiltAmount Amount of tilt. 
		 */
		function leftRightCombo(tiltAmount){
			if(typeof tiltAmount !== 'number')
				tiltAmount = 25;

			if(e.keyCode === 37) //left
			{
				gpBlock.x -= matrix.getBlockDimensions().width;

				switch(gpBlock.direction)
				{
					case UP :
						gpBlock.tilt(tiltAmount);
						break;
					case DOWN : 
						gpBlock.tilt(tiltAmount*-1);
						break;
				}
			}
			else if(e.keyCode === 39) //right
			{
				gpBlock.x += matrix.getBlockDimensions().width;
				
				switch(gpBlock.direction)
				{
					case UP :
						gpBlock.tilt(tiltAmount*-1);
						break;
					case DOWN : 
						gpBlock.tilt(tiltAmount);
						break;
				}
			}
		}
	}

	/**
	 * Removes the moving block off of stage, sets its variable to 
	 * null so that a new one would be immediately assigned. 
	 */
	function removeMovingBlock(eliminated){
		stage.removeChild(gpBlock);
		gpBlock = null;

		if(eliminated)
		{
			matrix.addBlockScore();
			posFlash.createFlash();
			matrixelim.SoundPlayer.playSound('BlockEliminated');
		}
		else
		{
			negFlash.createFlash();
			matrix.decreaseHealth();
			matrixelim.SoundPlayer.playSound('BlockNotEliminated');
		}

		matrixelim.VisualEffects.stretchObject(
			bgBlockGroup, 
			0.05, 
			Math.random() < 0.5 ? matrixelim.VisualEffects.STRETCH_VERTICALLY : matrixelim.VisualEffects.STRETCH_HORIZONTALLY, 
			0.001);
	}

	/**
	 * Prepares the NEXT block to use. 
	 */
	function prepareRandomMovingBlock(){
		if(matrix.getUsedColorCombinations().length === 0)
		{
			endStage = true;
			savedMovingBlock = null;
			return;
		}

		//random color from the matrix
		var randMatrixColor;

		if(gpBlock === null)
			randMatrixColor = matrix.getUsedColorCombinations()[Math.floor(Math.random()*matrix.getUsedColorCombinations().length)];
		else
		{
			while(true)
			{
				randMatrixColor = matrix.getUsedColorCombinations()[Math.floor(Math.random()*matrix.getUsedColorCombinations().length)];

				if(matrix.getUsedColorCombinations().length === 1)
					break;

				//checking if the colors are the same
				if(gpBlock.getColorArr()[0][0] === randMatrixColor)
				{
					if(countInstancesOfColor(randMatrixColor) > 1)
						break;
				}
				else
					break;
			}
		}
		
		//randomly assigning the block to an appropriate random spot
		var result = assignGPBlockSide();
		
		var randPrepBlock = new matrixelim.Block(result['coordinates'], 
			matrix.getBlockDimensions(),
			[[randMatrixColor, '#fff']],
			0,
			0,
			'#000');

		randPrepBlock.direction = result['direction'];

		savedMovingBlock = randPrepBlock;
		nextBlockPanel.setNextBlock(savedMovingBlock.getColorArr()[0][0], matrix.getBlockDimensions());

		/**
		 * It is importnant to count how many instances there are of a particular color. 
		 * E.g. if the moving tile is yellow, and there is only one yellow tile left in the 
		 * matrix, the NEXT tile should NOT be yellow. 
		 * @param  {String} chosenColor A chosen color from the matrix. 
		 * @return {Integer}            Number of instances of that color.  
		 */
		function countInstancesOfColor(chosenColor){
			var count = 0;

			matrix.getUsedColorCombinations().forEach(function(color){
				if(color === chosenColor)
					count++;
			});

			return count;
		}
	}

	/**
	 * Specifies from which side should the Block 
	 * move toward the matrix. 
	 * @return {Object} Appropriate coordinates for the Block.
	 */
	function assignGPBlockSide(){
		var randNum = Math.floor(Math.random()*4);

		var result = {};

		switch(randNum)
		{
			case LEFT : 
				result['coordinates'] = new createjs.Point(0, (stage.canvas.height/2) + matrix.getBlockDimensions().height/2);
				break;
			case RIGHT : 
				result['coordinates'] = new createjs.Point(stage.canvas.width, (stage.canvas.height/2) + matrix.getBlockDimensions().height/2);
				break;
			case UP : 
				result['coordinates'] = new createjs.Point((stage.canvas.width/2) + matrix.getBlockDimensions().height/2, 0);
				break;
			case DOWN : 
				result['coordinates'] = new createjs.Point((stage.canvas.width/2) + matrix.getBlockDimensions().height/2, stage.canvas.height);
				break;
		}

		result['direction'] = randNum;

		return result;
	}

	/**
	 * Creates the background for both the game and the menu.  
	 * @param  {Integer} bgRows Number of rows. 
	 * @param  {Integer} bgCols Number of columns. 
	 */
	function prepareBackground(bgRows, bgCols){
		bgBlockGroup = new matrixelim.BlockGroup(
			null, 
			bgRows, 
			bgCols, 
			{width: stage.canvas.width, height: stage.canvas.height},
			[['#000', '#3996ff'], ['#000', '#041931']],
			40,
			3,
			'#3996ff');

		stage.addChild(bgBlockGroup);
	}

	/**
	 * Prepares the menu buttons. 
	 *
	 * E.g.:
	 *
	 * 	btnData = [
	 * 		{title: 'title1', onclick: funct1},
	 * 		{title: 'title2', onclick: funct2},
	 * 		...
	 * 		{title: 'titleN', onclick: functN},
	 *  ];
	 * 
	 * @param {Object} btnData Array which contains the titles and the onClick functions of menu buttons.
	 * @param {Number} offset The offset between each button.
	 * @param {Object} dimensions Object which contains width and height properties. 
	 * @param {Integer} amountX The amount of blocks in the X coordinate. 
	 * @param {Integer} amountY The amount of blocks in the Y coordinate. 
	 * @param {Number} moveSpeed Each block's movement speed. 
	 */
	function prepareMenuBtns(btnData, offset, dimensions, amountX, amountY, moveSpeed){
		if(typeof offset !== 'number')
			offset = 10;

		for(var i = 0; i < btnData.length; i++)
		{
			var newBtn = new matrixelim.BlockButton(
				new createjs.Point(stage.canvas.width/2, (stage.canvas.height/2) + ((i*dimensions.height) + (i*offset))),
				btnData[i]['title'],
				dimensions,
				amountX,
				amountY,
				null,
				moveSpeed,
				btnData[i]['onclick'],
				true);

			newBtn.x -= newBtn.getBounds().width/2;

			menuBtns.push(newBtn);
			stage.addChild(newBtn);
		}

		var centerOffsetY = (menuBtns.length * offset) + dimensions.height;

		menuBtns.forEach(function(b){
			b.y -= centerOffsetY;
			b.displayBlocks();
		});
	}

	/**
	 * Prepares the rotating lines seen in the menu. 
	 */
	function prepareRotatingLines(){
		stage.addChild(new matrixelim.LRGroup(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			250,
			20,
			0.5,
			[
				{startAngle: 0,
					endAngle: Math.PI/2,
					color: '#4da1ff',
					rotationSpeed: 2},
				{startAngle: 0,
					endAngle: Math.PI/2,
					color: '#66aeff',
					rotationSpeed: -2.5},
				{startAngle: 0,
					endAngle: Math.PI/2,
					color: '#3896ff',
					rotationSpeed: 3},
				{startAngle: 0,
					endAngle: Math.PI/2,
					color: '#3896ff',
					rotationSpeed: -3.5}
			], 'rgba(0,0,0,0.75)'));

		menuLines = stage.children[stage.children.length-1];
	}

	/**
	 * Hides the menu and switches the background. 
	 * @param  {Boolean} b               True for the menu to be switched, false otherwise. 
	 * @param {Function} [completeFunct] The function to be executed when the background is switched. 
	 */
	function hideMenu(b, completeFunct){
		menuLines.hide(b);

		menuBtns.forEach(function(btn){
			btn.displayBlocks();
		});

		bgBlockGroup.switchBlocks(completeFunct);

		if(b)
		{
			signature.deleteText();
			gameTitle.deleteText();
		}
		else
		{
			signature.animate();
			gameTitle.animate();
		}

		txtProgress.triggerAlpha(b ? 'out' : 'in');
		setNewProgress();

		musicCB.display(b);
		soundCB.display(b);

		matrixelim.SoundPlayer.playSound('BgChange');
	}

	/**
	 * Shows the user's highscore. 
	 */
	function setNewProgress(){
		var currSave = matrixelim.SaveManager.getSave();
		txtProgress.text = 'Score: ' + currSave.score + '\n\nActive Tiles: ' + currSave.activetilenum;
	}

	/**
	 * For some reason, EaselJS tends to have problems with focusing 
	 * window object when running applications via HTML iframe elements. 
	 */
	function onFocusMainWindow(){
		window.focus();
	}
}());