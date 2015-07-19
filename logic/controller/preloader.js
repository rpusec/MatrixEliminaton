var matrixelim = matrixelim || {};

matrixelim.Preloader = {};

/**
 * This object preloads all of the necessary 
 * assets you see in the game.
 * @param {Object} dirs Object which contains user-specified directory paths.
 * Example: 
 * 		dirs = {
 * 			directory1: 'root/footer1/footer2/',
 * 			directory2: 'root/footer1/footer2/',
 * 			directory3: 'root/footer1/footer2/',
 * 			...
 * 			directoryN: 'root/footer1/footer2/'
 * 		}; 
 *
 * You could reference a directory you labeled as 'yourDirectoryName' later like this: 
 * matrixelim.Preloader.directories.yourDirectoryName
 * @author  Roman Pusec
 */
(function(dirs, options){
	var preload;
	var manifest;
	var preloadIcon;
	var stage;
	var loadedInfoTexts = [];
	matrixelim.Preloader.directories = dirs;

	options = matrixelim.setDefaultProperties(options, {
		annTextColor: '#64a2ff',
		annTextStyle: 'Arial 14px',
		annTextDist: 100
	});

	/**
	 * Creates the graphics of the preload section. 
	 * @param {createjs.Stage} stage The stage reference. 
	 */
	matrixelim.Preloader.initPreloadGraphics = function(_stage){
		stage = _stage;

		preloadIcon = new matrixelim.PreloadIcon(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			20,
			5,
			0.5,
			[{startAngle: 0,
	  			endAngle: Math.PI/2,
	  		 	color: '#409aff',
	  		  	rotationSpeed: 2},
	  		{startAngle: 0,
	  			endAngle: Math.PI/2,
	  		 	color: '#94c6ff',
	  		 	rotationSpeed: 4},
	  		 {startAngle: 0,
	  			endAngle: Math.PI/2,
	  		 	color: '#78b8ff',
	  		 	rotationSpeed: 6}],
	  		 'rgba(21, 131, 255, 0.5)',
	  		 50,
	  		 40,
	  		 'rgb(96, 171, 255)',
	  		 0.5);

		options.annTextDist = stage.canvas.width/2 - preloadIcon.getBounds().width;
		stage.addChild(preloadIcon);
	}

	/**
	 * Sets a new manifest of files. 
	 * @param {Array} newManifest Manifest of files. 
	 */
	matrixelim.Preloader.setManifest = function(newManifest){
		if(Object.prototype.toString.call(newManifest) === '[object Array]')
			manifest = newManifest;
	}

	/**
	 * Starts the preload process. 
	 */
	matrixelim.Preloader.startPreload = function(){
		preload = new createjs.LoadQueue();
		preload.installPlugin(createjs.Sound);
		preload.addEventListener("fileload", handleFileLoad);
		preload.addEventListener("error", handleFileError);
		preload.addEventListener("complete", handleComplete);
		preload.loadManifest(manifest);
	}

	/**
	 * Represents an item added to the manifest. 
	 * @param {String} dirPath      The path to the file. 
	 * @param {String} itemPathName The name of the file in the path. 
	 * @param {String} itemId       The id of the file to later recognise by the preloader instance.
	 */
	matrixelim.Preloader.Item = function(dirPath, itemPathName, itemId){
		this.src = dirPath + itemPathName;
		this.id = itemId;
	}

	/**
	 * Returns the preloader. 
	 * @return {createjs.LoadQueue} The preload instance. 
	 */
	matrixelim.Preloader.getPreloader = function(){
		return preload;
	}

	function handleFileLoad(e){
		preloadIcon.setPercentage(Math.floor(preload.progress*100));
		announceLoadedItem('Loaded file: ' + e.item.id);
	}

	function handleFileError(e){
		console.log('error');
	}

	/**
	 * Displays user-specified text to the screen. The text 
	 * derives from the center and toward a random angle. 
	 * @param  {String} text The text to display on screen. 
	 */
	function announceLoadedItem(text){
		var txtSize = (Math.random()*10)+5;

		options.annTextStyle = txtSize + 'px Arial';

		var textObj = new createjs.Text(text, options.annTextStyle, options.annTextColor);

		textObj.alpha = txtSize/15;

		textObj.textAlign = 'center';
		textObj.textBaseline = 'middle';

		textObj.x = stage.canvas.width/2;
		textObj.y = stage.canvas.height/2;

		stage.addChild(textObj);

		var angle = Math.random()*(Math.PI*2);
		textObj.annDist = Math.random()*options.annTextDist;
		textObj.x += Math.cos(angle) * preloadIcon.getBounds().width;
		textObj.y += Math.sin(angle) * preloadIcon.getBounds().height;

		stage.addChild(textObj);

		createjs.Ticker.addEventListener('tick', onAnnounceLoadedItem);

		loadedInfoTexts.push(textObj);

		function onAnnounceLoadedItem(){
			if(textObj.annDist | 0 !== 0)
			{
				textObj.annDist /= 2;
				textObj.x += Math.cos(angle) * textObj.annDist;
				textObj.y += Math.sin(angle) * textObj.annDist;
			}
			else
			{
				textObj.annDist = undefined;
				createjs.Ticker.removeEventListener('tick', onAnnounceLoadedItem);
				textObj.triggerAlpha('out', 0.025, 1, function(){
					if(textObj.parent !== null)
						textObj.parent.removeChild(textObj);
				});
			}
		}
	}

	function handleComplete(e){
		preload.close();

		var beginGameBtn = new matrixelim.BlockButton(
			new createjs.Point(stage.canvas.width/2, stage.canvas.height/2),
			'Proceed',
			{width: 130, height: 40},
			10,
			3,
			null,
			1,
			function(){
				beginGameBtn.displayBlocks();

				preloadIcon.triggerAlpha('out', 0.025, 1, function(){
					if(preloadIcon.parent !== null)
						preloadIcon.parent.removeChild(preloadIcon);

					if(beginGameBtn.parent !== null)
						beginGameBtn.parent.removeChild(beginGameBtn);

					matrixelim.initializeGame();
				});
			},
			true);

		beginGameBtn.x -= beginGameBtn.getBounds().width/2;
		beginGameBtn.y += preloadIcon.getBounds().height;

		beginGameBtn.displayBlocks();

		stage.addChild(beginGameBtn);
	}
}({
	dirImages: 'media/images/',
	dirSound: 'media/sound/'
}));