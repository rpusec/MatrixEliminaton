var matrixelim = matrixelim || {};

(function(){
	/**
	 * Frame objects can contain complex content, include a scrollbar 
	 * to scroll the content, and can be closed. 
	 * @author Roman Pusec
	 * @augments {matrixelim.MessageBox}
	 * @see the matrixelim.MessageBox object for explanation of constructor's parameters. 
	 */
	function Frame(point, dimensions, title, textColor, bgColor, borderColor, onMouseOverColor, strokeStyle, options){
		this.MessageBox_constructor(point, dimensions, null, title, textColor, bgColor, borderColor, onMouseOverColor, strokeStyle, options);

		var marginLeft = 10;
		var self = this;

		var allContent = new createjs.Container();
		allContent.x = marginLeft;
		allContent.y = this.getTitle().getBounds().height*2;
		
		var contentMask = new createjs.Shape();
		allContent.mask = contentMask;
		this.addChild(allContent);

		/**
		 * Adds part of content for this frame. Each content instance is composed of title, and content array. 
		 * Content array is the array of text and image objects, and it should look like this: 
		 *
		 *	contentArr = [
		 *		'some text, or paragraph',
		 *		'another text, or paragraph'
		 *		new createjs.Bitmap(path),
		 *		...
		 *	];
		 * 
		 * @param {String} titleCont  The title of the content. 
		 * @param {Array} contentArr  The array of content. 
		 * @param {Object} opt        Additional options. 
		 */
		this.addContent = function(titleCont, contentArr, opt){
			var content = new createjs.Container();

			opt = matrixelim.setDefaultProperties(opt, {
				titleFontStyle: '15px Arial',
				textFontStyle: '12px Arial',
				fontColor: textColor,
				lineHeight: 25,
				separatorThickness: 2,
				separatorWidth: dimensions.width/1.2,
				separatorColor: borderColor
			});

			var titleObj = new createjs.Text(titleCont, opt.titleFontStyle, opt.fontColor);
			titleObj.lineHeight = opt.lineHeight;

			content.addChild(titleObj);

			var separator = new createjs.Shape();
			separator.graphics
			.setStrokeStyle(opt.separatorThickness)
			.beginStroke(opt.separatorColor)
			.moveTo(0,0)
			.lineTo(opt.separatorWidth, 0);

			separator.setBounds(0, 0, opt.separatorWidth, opt.separatorThickness*2);
			separator.y = titleObj.y + titleObj.getBounds().height;

			content.addChild(separator);

			//iterates through content array and assembles the content instace
			contentArr.forEach(function(item){
				var newCont; //either a createjs.Bitmap or createjs.Text

				if(typeof item === 'string')
				{
					newCont = new createjs.Text(item, opt.textFontStyle, opt.fontColor);
					newCont.lineWidth = dimensions.width/1.2;
					newCont.lineHeight = opt.lineHeight;
				}
				else if((item.toString().indexOf('Bitmap') !== -1 && typeof item === 'object'))
					newCont = item;

				//adding text or bitmap to the last row
				if(content.children.length > 0)
				{
					var lastChildContent = content.children[content.children.length-1];
					newCont.y = Math.floor(lastChildContent.y + lastChildContent.getBounds().height);
				}
				else
					newCont.y = separator.y;
				
				content.addChild(newCont);
			});

			//adding the content instance to the last place
			if(allContent.children.length > 0)
			{
				var lastContent = allContent.children[allContent.children.length-1];
				content.y = Math.floor(lastContent.y + lastContent.getBounds().height);
			}
			
			allContent.addChild(content);

			contentMask.graphics
			.clear()
			.beginFill('#000')
			.drawRect(0, this.getTitle().getBounds().height*2, (dimensions.width/1.2) + marginLeft, dimensions.height - (this.getTitle().getBounds().height*2));
			contentMask.setBounds(0, 0, (dimensions.width/1.2) + marginLeft, dimensions.height);
		}

		/**
		 * Prepares the scrollbar for usage. 
		 * @param  {String} barColor The color of the scrollbar. 
		 * @param  {Number} barWidth The width of the scrollbar. 
		 */
		this.prepareScrollbar = function(barColor, barWidth, initialAlpha){
			
			if(typeof initialAlpha !== 'number')
				initialAlpha = 0.8;

			var a = (Math.max(allContent.getBounds().height, contentMask.getBounds().height)/contentMask.getBounds().height);
			var b = contentMask.getBounds().height;

			var barHeight;

			if((Math.ceil(a) - a) !== 0)
				barHeight = ((Math.ceil(a) - a) * b) - this.y;
			else
				barHeight = contentMask.getBounds().height - (this.y - allContent.y);

			var scrollbarInitialY = allContent.y;

			var scrollbarBg = new createjs.Shape();
			scrollbarBg.graphics
			.setStrokeStyle(barWidth)
			.beginStroke(barColor)
			.moveTo(0,0)
			.lineTo(0,this.getBounds().height - scrollbarInitialY);
			scrollbarBg.x = this.getBounds().width - barWidth;
			scrollbarBg.y = scrollbarInitialY;
			this.addChild(scrollbarBg);
			scrollbarBg.alpha = 0.2;

			var scrollbar = new createjs.Shape();
			scrollbar.graphics
			.setStrokeStyle(barWidth)
			.beginStroke(barColor)
			.moveTo(0,0)
			.lineTo(0,barHeight);
			scrollbar.x = this.getBounds().width - barWidth;
			scrollbar.y = scrollbarInitialY;
			this.addChild(scrollbar);

			scrollbar.alpha = initialAlpha;

			//used so that the alpha value would not be lost if the user drags the bar and mouseovers out of it
			var switchToPrevIniAlpha = true;

			scrollbar.addEventListener('pressmove', function(e){
				var barLoc = (e.stageY - self.y) - (barHeight / 2);

				//if the bar is not out of its appropriate Y axis
				if(barLoc >= scrollbarInitialY)
					e.target.y = barLoc;
				else
					e.target.y = scrollbarInitialY;

				//if the bar's Y axis is greater than the height of the frame
				if(barLoc > self.getBounds().height - barHeight)
				{
					e.target.y = self.getBounds().height - barHeight;
					allContent.y = self.getBounds().height - allContent.getBounds().height;
				}
				else
					if(barLoc - scrollbarInitialY > 0)
						allContent.y = (barLoc - self.y) * -1;

				scrollbar.alpha = 1;
				switchToPrevIniAlpha = false;
			});

			scrollbar.on('pressup', function(e){
				var pt = scrollbar.globalToLocal(e.stageX, e.stageY);
				if(!scrollbar.hitTest(pt.x, pt.y))
					scrollbar.alpha = initialAlpha;
				switchToPrevIniAlpha = true;
			});

			scrollbar.on('mouseover', function(){
				scrollbar.alpha = 1;
			});

			scrollbar.on('mouseout', function(){
				if(switchToPrevIniAlpha)
					scrollbar.alpha = initialAlpha;
			});
		}
	}

	var e = createjs.extend(Frame, matrixelim.MessageBox);

	matrixelim.Frame = createjs.promote(Frame, 'MessageBox');
}());