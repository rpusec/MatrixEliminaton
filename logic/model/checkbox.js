var matrixelim = matrixelim || {};

(function(){
	/**
	 * Represents a single checkbox. 
	 * @param {createjs.Point} point      The coordinates of the object. 
	 * @param {Object} dimensions         Width and height of the object. Object which contains width and height properties.
	 * @param {Object} options            Additional options. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function CheckBox(point, dimensions, options){
		this.Container_constructor();

		var self = this;

		this.x = point.x;
		this.y = point.y;

		this.mouseChildren = false;

		options = matrixelim.setDefaultProperties(options, {
			selected: false,
			selectedColor: 'rgba(196, 255, 190, 0.8)',
			unselectedColor: 'rgba(255, 73, 73, 0.8)',
			onSelectFunct: null,
			onUnselectFunct: null,
			radius: 2,
			incrScaleAmount: 0.025,
			additionalScaleSize: 0.2,
			icon: null,
			strokeStyle: 0,
			strokeColor: '#bedeff'
		});

		var cbGraphics = new createjs.Shape();
		redraw();

		if(!options.selected && options.icon !== null && options.icon.hasOwnProperty('alter'))
			options.icon.alter();

		this.addChild(cbGraphics);

		this.setBounds(0, 0, dimensions.width, dimensions.height);

		this.regX = this.getBounds().width/2;
		this.regY = this.getBounds().height/2;

		this.addEventListener('click', onClickCB);
		this.addEventListener('mouseover', mouseOverCB);
		this.addEventListener('mouseout', mouseOutCB);

		if(options.icon !== null)
			this.addChild(options.icon);

		function mouseOverCB(){
			self.scaleX = 1;
			self.scaleY = 1;
			createjs.Ticker.addEventListener('tick', onMouseoverCB);
		}

		function mouseOutCB(){
			self.scaleX = 1 + options.additionalScaleSize;
			self.scaleY = 1 + options.additionalScaleSize;
			createjs.Ticker.addEventListener('tick', onMouseoutCB);
		}

		this.getIcon = function(){
			return options.icon;
		}

		/**
		 * Function executed when the checkbox is clicked. 
		 * Calls either options.onSelectFunct or options.onUnselectFunct 
		 * depending on whether the checkbox is selected or unselected. 
		 */
		function onClickCB(){
			options.selected = !options.selected;
			redraw();

			if(options.selected)
			{
				if(typeof options.onSelectFunct === 'function')
					options.onSelectFunct();
			}
			else
			{
				if(typeof options.onUnselectFunct === 'function')
					options.onUnselectFunct();
			}

			if(options.icon.hasOwnProperty('alter'))
				options.icon.alter();
		}

		/**
		 * Redraws the graphics of the checkbox, based on 
		 * whether it is selected or unselected. 
		 */
		function redraw(){
			cbGraphics.graphics
			.clear();

			if(options.strokeStyle > 0)
			{
				cbGraphics.graphics
				.setStrokeStyle(options.strokeStyle)
				.beginStroke(options.strokeColor);
			}

			cbGraphics.graphics
			.beginFill(!options.selected ? options.unselectedColor : options.selectedColor)
			.drawRoundRect(0, 0, dimensions.width, dimensions.height, options.radius)
			.endFill();
		}

		function onMouseoverCB(){
			if(self.scaleX + options.incrScaleAmount < 1 + options.additionalScaleSize && self.scaleY + options.incrScaleAmount < 1 + options.additionalScaleSize)
			{
				self.scaleX += options.incrScaleAmount;
				self.scaleY += options.incrScaleAmount;
			}
			else
			{
				self.scaleX = 1 + options.additionalScaleSize;
				self.scaleY = 1 + options.additionalScaleSize;
				createjs.Ticker.removeEventListener('tick', onMouseoverCB);
			}
		}

		function onMouseoutCB(){
			if(self.scaleX - options.incrScaleAmount > 1 && self.scaleY - options.incrScaleAmount > 1)
			{
				self.scaleX -= options.incrScaleAmount;
				self.scaleY -= options.incrScaleAmount;
			}
			else
			{
				self.scaleX = 1;
				self.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onMouseoutCB);
			}
		}

		this.display = function(b){
			if(typeof b !== 'boolean')
				b = true;

			addListeners(false);

			if(b)
			{
				this.scaleX = 1;
				this.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onShow);
				createjs.Ticker.removeEventListener('tick', onHide);
				createjs.Ticker.addEventListener('tick', onHide);
			}
			else
			{
				this.scaleX = 0;
				this.scaleY = 0;
				createjs.Ticker.removeEventListener('tick', onHide);
				createjs.Ticker.removeEventListener('tick', onShow);
				createjs.Ticker.addEventListener('tick', onShow);
			}
		}

		function onHide(){
			if(self.scaleX - options.incrScaleAmount > 0 && self.scaleY - options.incrScaleAmount > 0)
			{
				self.scaleX -= options.incrScaleAmount;
				self.scaleY -= options.incrScaleAmount;
			}
			else
			{
				self.scaleX = 0;
				self.scaleY = 0;
				createjs.Ticker.removeEventListener('tick', onHide);
				addListeners(true);
			}
		}

		function onShow(){
			if(self.scaleX + options.incrScaleAmount < 1 && self.scaleY + options.incrScaleAmount < 1)
			{
				self.scaleX += options.incrScaleAmount;
				self.scaleY += options.incrScaleAmount;
			}
			else
			{
				self.scaleX = 1;
				self.scaleY = 1;
				createjs.Ticker.removeEventListener('tick', onShow);
				addListeners(true);
			}
		}

		function addListeners(b){
			if(typeof b !== 'boolean')
				b = true;

			self.removeEventListener('click', onClickCB);
			self.removeEventListener('mouseover', mouseOverCB);
			self.removeEventListener('mouseout', mouseOutCB);

			if(b)
			{
				self.addEventListener('click', onClickCB);
				self.addEventListener('mouseover', mouseOverCB);
				self.addEventListener('mouseout', mouseOutCB);
			}
		}
	}

	var e = createjs.extend(CheckBox, createjs.Container);

	matrixelim.CheckBox = createjs.promote(CheckBox, 'Container');
}());