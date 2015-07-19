var matrixelim = matrixelim || {};

matrixelim.SaveManager = {};

/**
 * Saves and restores user's current progress. The progress is 
 * saved on the localStorage object. 
 * @author  Roman Pusec
 */
(function(){
	var SCORE_SAVE = 'matrixelim.score';
	var ACTIVE_TILE_SAVE = 'matrixelim.activetilenum';

	/**
	 * Returns the user's current save from local storage. 
	 * @return {Object} Object which has user's current save. 
	 */
	matrixelim.SaveManager.getSave = function(){
		if(!matrixelim.SaveManager.isStorageSupported())
			return;

		var result = {score: 0, activetilenum: 0};

		if(localStorage.getItem(SCORE_SAVE) !== null)
			result.score = localStorage.getItem(SCORE_SAVE);

		if(localStorage.getItem(ACTIVE_TILE_SAVE) !== null)
			result.activetilenum = localStorage.getItem(ACTIVE_TILE_SAVE);

		return result;
	}

	/**
	 * Sets the new score to the storage. 
	 * @param {Number} score      The new score. 
	 * @param {Integer} activetilenum The new active tile num. 
	 */
	matrixelim.SaveManager.setSave = function(score, activetilenum){
		if(!matrixelim.SaveManager.isStorageSupported())
			return;

		var prevSave = matrixelim.SaveManager.getSave();

		if(prevSave.score < score)
			localStorage.setItem(SCORE_SAVE, score);

		if(prevSave.activetilenum < activetilenum)
			localStorage.setItem(ACTIVE_TILE_SAVE, activetilenum);
	}

	/**
	 * Checks whether localstorage is supported. 
	 * @return {Boolean} True if storage is supported, false otherwise. 
	 */
	matrixelim.SaveManager.isStorageSupported = function(){
		if(typeof(Storage) === 'undefined')
			return false;
		return true;
	}
}());