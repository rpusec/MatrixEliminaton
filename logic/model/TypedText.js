(function(){
	/**
	*	This is the animation which simulates computer-ish-ly typed
	*	text onto the screen.
	*	@param {createjs.Point} point 			The coordinates of the text.
	*	@param {String} sent 					The sentence to be displayed.
	*	@param {Double} textSize				The size of the font.
	*	@param {HTML Color} color				The color of the font. 
	*	@param {String} font					The type of the font, eg Arial.
	*	@param {Integer} [textBlinkingAmount]	Number of times the "_" sign should blink. 
	*	@param {Double} [blinkingDelay]			How fast should the "_" sign blink.
	*	@param {Double} [typingDelay]			How fast should the font appear.
	*	@example new TypedText(new createjs.Point(30, 30), "Hello World", 30, "#fff", "Arial", 5, 250, 50);
	*	@author Roman Pusec
	*/
	function TypedText(point, sent, textSize, color, font, textBlinkingAmount, blinkingDelay, typingDelay){
		this.Text_constructor("", textSize + "px " + font, color);

		textBlinkingAmount = textBlinkingAmount || 5;
		blinkingDelay = blinkingDelay || 250;
		typingDelay = typingDelay || 50;

		var self = this;

		this.x = point.x;
		this.y = point.y;

		/* to accurately measure the bounds, we've created a temporary Text object which
		has the same sentence embedded to it, and used its bounds on the actual text object */
		var tempText = new createjs.Text(sent, textSize + "px " + font, color);
		this.setBounds(0, 0, tempText.getBounds().width, tempText.getBounds().height);

		this.animationInterval = null;
		var animHelper = 0; //helps us with some animation config
		this.typing = false; //active when the text should appear
		this.typed = false; //active when the text had already appeared
		this.sentence = sent;

		/**
		 * Starts animating the text. 
		 */
		this.animate = function(){
			if(this.animationInterval !== null)
			{
				animHelper = 0; 
				this.typing = false; 
				this.typed = false; 
				this.sentence = sent;
				this.removeEventListener("tick", onDeleteText);
				this.removeListeners();
				this.animationInterval = null;
			}

			this.animationInterval = setInterval(onAnimation, blinkingDelay);
		}

		function onAnimation()
		{
			//if the state of typing isn't active
			if(!self.typing)
			{
				//if the text still wasn't typed
				if(!self.typed)
				{
					//makes the "_" blink N amount of times
					if(animHelper != textBlinkingAmount)
					{
						if(animHelper % 2)
							self.text = "_";
						else
							self.text = "";

						animHelper++;
					}
					else
					{
						//starting a faster animation, to better simulate typing
						clearInterval(self.animationInterval);
						self.animationInterval = setInterval(onAnimation, typingDelay);
						animHelper = 0;
						self.typing = true; //typing starts
					}
				}
				else
				{
					/* this is the part of the code which repeatedly removes and
					adds the last character (which, in this case, is the "_" sign) */
					if(animHelper == 0)
						self.text = self.text.substring(0, self.text.length-1);
					else
						self.text += "_";

					animHelper++;
					animHelper %= 2;
				}
			}
			else
			{
				//this part of the code makes the final text appear on the screen
				if(animHelper != self.sentence.length+1)
				{
					/* at this point, the animHelper, with each execution of this function,
					is being added up by one, which in turn makes a greater substring of the text */
					self.text = self.sentence.substring(0, animHelper) + "_";
					animHelper++;
				}
				else
				{
					//the "typing" animation is over
					clearInterval(self.animationInterval);
					self.animationInterval = setInterval(onAnimation, blinkingDelay);
					self.typing = false;
					self.typed = true; //the "typed" animation begins
					animHelper = 0;
				}
			}
		}

		/**
		 *	Removes the animation listener and removes the "_" sign. 
		 */
		this.removeListeners = function(){
			if(this.animationInterval !== null)
				clearInterval(this.animationInterval);
			if(this.text.length == this.sentence.length+1 && this.typed)
				this.text = this.text.substring(0, this.text.length-1);
		};

		var currInd;

		/**
		 * Deletes the text by eliminating second last 
		 * character (it doesn't remove the "_" sign). 
		 */
		this.deleteText = function(){
			this.removeListeners();
			this.text = this.sentence + "_";
			currInd = this.text.length;
			this.addEventListener("tick", onDeleteText);
		}

		function onDeleteText()
		{
			if(currInd != 0)
			{
				self.text = self.text.substring(0, currInd-1);
				currInd--;
			}
			else
				self.removeAllEventListeners();
		}
	}

	var p = createjs.extend(TypedText, createjs.Text);

	window.TypedText = createjs.promote(TypedText, "Text");
}());