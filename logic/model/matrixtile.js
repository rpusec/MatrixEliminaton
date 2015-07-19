var matrixelim = matrixelim || {};

(function(){
	/**
	 * Block that is included in the matrixelim.Matrix display object. 
	 * @param {createjs.Point} point    The coordinates of the object. 
	 * @param {Object} dimensions 		Width and height of the object. 
	 * @param {String} color     		The colors. Each time it is rotated, another color will be picked from the array.
	 * @param {Number} delay 			Delay in displaying the block. 
	 * @param {Object} options  		Additional options for the block. 
	 * @author Roman Pusec
	 * @augments {matrixelim.Block}
	 */
	function MatrixTile(point, dimensions, color, delay, defaultColor, defaultReflColor, chosenReflColor, strokeStyle, strokeColor, options){
		this.Block_constructor(point, dimensions, color === null ? [[defaultColor, defaultReflColor]] : [[color, chosenReflColor]].concat([[defaultColor, defaultReflColor]]), delay, strokeStyle, strokeColor, options);

		var globDoRotation = this.doRotation;
		var reversed = false;

		/**
		 * MatrixTile Blocks can be reversed only once. 
		 */
		this.doRotation = function(){
			if(reversed)
				return;

			globDoRotation();
			reversed = true;
		}
	}

	var e = createjs.extend(MatrixTile, matrixelim.Block);

	matrixelim.MatrixTile = createjs.promote(MatrixTile, 'Block');
}());