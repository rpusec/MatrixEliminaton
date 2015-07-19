var matrixelim = matrixelim || {};

(function(){
	/**
	 * TextPanel which presents lives to the user. 
	 * @param {createjs.Point} point             Coordinates of the object. 
	 * @param {Object} dimensions                Object with width and height properties. 
	 * @param {Integer} maxNumLives              Maximum nuber of lives. 
	 * @param {String} lifeActiveColor           Color which represents an active life. 
	 * @param {String} lifeActiveRefl            Color which represents reflection an active life. 
	 * @param {String} lifeInactiveColor         Color which represents an inactive life. 
	 * @param {String} lifeInactiveRefl          Color which represents reflection an inactive life.
	 * @param {String} bgColor                   Background color of the panel. 
	 * @param {String} borderColor               The border color. 
	 * @param {Integer} strokeStyle              Stroke style. 
	 * @param {Object} options                   Additional options. 
	 */
	function LifePanel(point, dimensions, maxNumLives, lifeActiveColor, lifeActiveRefl, lifeInactiveColor, lifeInactiveRefl, bgColor, borderColor, strokeStyle, options){
		this.TextPanel_constructor(point, dimensions, null, null, null, bgColor, borderColor, strokeStyle, options);

		options = matrixelim.setDefaultProperties(options, {
			bWidth: 20,
			bHeight: 20
		});

		var livesCont = new createjs.Container();
		var currNumLives = maxNumLives;

		for(var i = 0; i < maxNumLives; i++)
		{
			var newBlock = new matrixelim.Block(
				new createjs.Point(livesCont.children.length > 0 ? (i*livesCont.children[0].getBounds().width) : 0, 0),
				{width: options.bWidth, height: options.bHeight},
				[[lifeActiveColor, lifeActiveRefl], [lifeInactiveColor, lifeInactiveRefl]],
				0,
				0,
				'#000');

			livesCont.addChild(newBlock);
		}

		livesCont.x = this.getBounds().width/2 - livesCont.getBounds().width/2;
		livesCont.y = this.getBounds().height/2;

		this.addChild(livesCont);

		/**
		 * Removes a life from the list. 
		 */
		this.decreaseHealth = function(){
			if(currNumLives !== 0)
			{
				livesCont.children[currNumLives-1].doReverse();
				currNumLives--;
			}
		}

		/**
		 * Restores all lives. 
		 */
		this.restoreLives = function(){
			for(var i = currNumLives; i < maxNumLives; i++)
				livesCont.children[i].doReverse();
			currNumLives = maxNumLives;
		}

		this.getNumLives = function(){
			return currNumLives;
		}
	}

	var e = createjs.extend(LifePanel, matrixelim.TextPanel);

	matrixelim.LifePanel = createjs.promote(LifePanel, 'TextPanel');
}());