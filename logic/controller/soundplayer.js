var matrixelim = matrixelim || {};

matrixelim.SoundPlayer = {};

/**
 * Class which uses SoundJS to play sounds 
 * exclusively for this application.
 * @author  Roman Pusec  
 */
(function(){
	//booleans denoting whether music/sound is activated
	var activatedSound = true;
	var activatedMusic = true;
	var currMusic = null;
	var musicID = null;
	var shouldLoop = true;

	//saving tick functions
	var gdmTick = null;
	var onFMPInstance = null;

	/**
	 * Plays a certain sound. 
	 * @param  {String}  soundID    The sound ID. 
	 * @param  {Boolean} shouldLoop True for the sound to loop, false otherwise. 
	 */
	matrixelim.SoundPlayer.playSound = function(soundID, shouldLoop){
		if(!activatedSound)
			return;

		createjs.Sound.play(soundID, {loop: (shouldLoop ? -1 : 0)});
	};

	/**
	 * Plays music. 
	 * @param  {String}  mID   The sound ID. 
	 * @param  {Boolean} sLoop True for the sound to loop, false otherwise. 
	 */
	matrixelim.SoundPlayer.playMusic = function(mID, sLoop){
		if(typeof sLoop === 'undefined')
			sLoop = true;

		musicID = mID;
		shouldLoop = sLoop;

		if(!activatedMusic)
			return false;

		if(currMusic !== null)
			currMusic.destroy();

		currMusic = createjs.Sound.play(musicID, {loop: (shouldLoop ? -1 : 0)});
	};

	/**
	 * Activates or deactivates the possibility of producing sound effects. 
	 * @param  {Boolean} bool True for playing sound effects, false otherwise. 
	 */
	matrixelim.SoundPlayer.activateSound = function(bool){
		activatedSound = bool;
	};

	/**
	 * Activates or deactivates the possibility of playing music. 
	 * Additionally, it automatically stops music. 
	 * @param  {Boolean} bool True for playing music, false otherwise. 
	 */
	matrixelim.SoundPlayer.activateMusic = function(bool, destroy){
		activatedMusic = bool;

		if(typeof destroy !== 'boolean')
			destroy = false;

		if(typeof gdmTick === 'function')
		{
			createjs.Ticker.removeEventListener('tick', gdmTick);
			gdmTick = null;
		}

		if(destroy)
		{
			if(!activatedMusic)
			{
				if(currMusic !== null)
				{
					currMusic.destroy();
					currMusic = null;
				}
			}
			else
				currMusic = createjs.Sound.play(musicID, {loop: (shouldLoop ? -1 : 0)});
		}
		else
		{
			if(currMusic !== null)
			{
				if(!activatedMusic)
					currMusic.pause();
				else
					currMusic.play();
			}
		}
	};

	/**
	 * Checks if the sound effects are activated. 
	 * @return {Boolean} True if sounds are activated, false otherwise. 
	 */
	matrixelim.SoundPlayer.isSoundActivated = function(){
		return activatedSound;
	};

	/**
	 * Checks if the music is activated. 
	 * @return {Boolean} True if music is activated, false otherwise. 
	 */
	matrixelim.SoundPlayer.isMusicActivated = function(){
		return activatedMusic;
	};

	/**
	 * Stops playing the music. 
	 */
	matrixelim.SoundPlayer.stopMusic = function(){
		if(currMusic !== null)
			currMusic.stop();
	};

	/**
	 * Starts playing the music. 
	 */
	matrixelim.SoundPlayer.resumeMusic = function(){
		if(currMusic !== null)
			currMusic = createjs.Sound.play(musicID, {loop: (shouldLoop ? -1 : 0)});
	};

	/**
	 * 'Fiddles' the pan value of the music instance. It basically gradually moves the sound to 
	 * the left pan, and then to the right pan, and finally back to the center. 
	 * @param  {Number} fiddleSpeed The amount of change in the pan value. 
	 */
	matrixelim.SoundPlayer.fiddleMusicPan = function(fiddleSpeed){
		if(fiddleSpeed !== 'number')
			fiddleSpeed = 0.025;

		var startingPos = Math.random() < 0.5 ? 'left' : 'right';

		var pos = startingPos;
		var fullCircle = false;
		var end = false;

		if(onFMPInstance !== null)
			createjs.Ticker.removeEventListener('tick', onFMPInstance);

		onFMPInstance = createjs.Ticker.addEventListener('tick', onFiddleMusicPan);

		function onFiddleMusicPan(){
			currMusic.pan = currMusic.pan.toFixed(5);

			if(!fullCircle)
			{
				if(pos === 'left')
				{
					if(currMusic.pan - fiddleSpeed > -1)
						currMusic.pan -= fiddleSpeed;
					else
					{
						currMusic.pan = -1;
						pos = 'right';
						if(startingPos === 'right')
							fullCircle = true;
					}
				}
				else
				{
					if(currMusic.pan + fiddleSpeed < 1)
						currMusic.pan += fiddleSpeed;
					else
					{
						currMusic.pan = 1;
						pos = 'left';
						if(startingPos === 'left')
							fullCircle = true;
					}
				}
			}
			else
			{
				if(startingPos === 'left')
				{
					if(currMusic.pan - fiddleSpeed > 0)
						currMusic.pan -= fiddleSpeed;
					else
						end = true;
				}
				else if(startingPos === 'right')
				{
					if(currMusic.pan + fiddleSpeed < 0)
						currMusic.pan += fiddleSpeed;
					else
						end = true;
				}
				
				if(end)
				{
					currMusic.pan = 0;
					createjs.Ticker.removeEventListener('tick', onFMPInstance);
					onFMPInstance = null;
				}
			}
		}
	}
}());