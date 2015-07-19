var matrixelim = matrixelim || {};

(function(){
	/**
	 * Text panel which displays text and in addition choices. 
	 *
	 * The choices param should be defined as follows: 
	 *
	 * 	choices = [
	 * 		{title: 'title1', executeFunct: funct1},
	 * 		{title: 'title2', executeFunct: funct2},
	 * 		...
	 * 		{title: 'titleN', executeFunct: functN}
	 * 	];
	 * 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {Object} dimensions         Object which contains the width and height properties. 
	 * @param {String} text               The text to be displayed. 
	 * @param {String} textColor          The color of the text. 
	 * @param {String} bgColor            The background color.
	 * @param {Object} choices            User defined choices.  
	 * @param {Object} options            Additional options. 
	 * @author Roman Pusec
	 * @augments {matrixelim.TextPanel}
	 */
	function ChoicePanel(point, dimensions, text, title, textColor, bgColor, borderColor, strokeStyle, choices, choicesDim, choicesColors, options){
		this.TextPanel_constructor(point, dimensions, text, title, textColor, bgColor, borderColor, strokeStyle, options);

		var choicesCont = new createjs.Container();
		var self = this;

		options = matrixelim.setDefaultProperties(options, {
			btnXAmount: 10,
			btnYAmount: 3,
			btnMoveSpeed: 5,
			padding: 10
		});

		choices.forEach(function(ch){
			var newButton = new matrixelim.BlockButton(
				new createjs.Point(choicesCont.children.length > 0 ? (choicesCont.children[0].getBounds().width * choices.indexOf(ch)) + (options.padding * choices.indexOf(ch)) : 0, 0),
				ch['title'],
				choicesDim,
				options.btnXAmount,
				options.btnYAmount,
				choicesColors,
				options.btnMoveSpeed,
				function(){
					self.displayPanel(false);
					ch['executeFunct']();
				},
				true);
			
			choicesCont.addChild(newButton);
		});

		choicesCont.x = this.getBounds().width/2 - choicesCont.getBounds().width/2;
		choicesCont.y = this.getBounds().height - choicesCont.getBounds().height - options.padding;

		this.addChild(choicesCont);

		var superDisplayPanel = this.displayPanel;

		this.displayPanel = function(b){
			superDisplayPanel(b);
			choicesCont.children.forEach(function(btn){
				btn.displayBlocks();
			});
		}
	}

	var e = createjs.extend(ChoicePanel, matrixelim.TextPanel);

	matrixelim.ChoicePanel = createjs.promote(ChoicePanel, 'TextPanel');
}());