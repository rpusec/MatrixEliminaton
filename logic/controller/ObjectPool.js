/**
 *  Object pooling provides us with the possibility
 *  to reuse already created objects, to avoid using
 *  the 'new' keyword and thus save a lot of memory.
 *  @param {Function} getObjFunct The function which returns appropriate object(s) that we want to reuse. 
 *  @param {createjs.Container/createjs.Stage} container The container that'll store the objects. 
 *  @author  Roman Pusec
 */
function ObjectPool(getObjFunct, cont)
{
	var currObjInd = 0;
	var poolRange = 0;
	var objects = []; //reusable objects
	var container = cont;

	/**
	 * Expands the pool with a new array of 
	 * objects, and removes the previous array. 
	 * @param  {Integer} newPoolRange The new range of objects. 
	 */
	this.expandPool = function(newPoolRange){

		//assigns the new range
		poolRange = newPoolRange;

		//removes all objects
		while(objects.length > 0)
			objects.pop();

		//uses the 'getObjFunct' to retrieve appropriate objects
		for(var i = 0; i < newPoolRange; i++)
			objects.push(getObjFunct());
	};

	/**
	 * Sets a new container. 
	 * @param {createjs.Container} newCont The new container for use. 
	 */
	this.setContainer = function(newCont){
		container = newCont;
	};

	/**
	 * Adds the object from pool to the container. 
	 * @param {createjs.Point} point The new point (XY coordinates) of the selected object. 
	 */
	this.addObjectFromPool = function(point){
		
		//if it's equal to the max range, then rest it to zero
		if(currObjInd == poolRange)
			currObjInd = 0;
		
		//adds the object to stage if it exists
		if(!container.contains(objects[currObjInd]))
		{
			container.addChild(objects[currObjInd]);

			objects[currObjInd].x = point.x;
			objects[currObjInd].y = point.y;

			if(objects[currObjInd].hasOwnProperty('reset'))
				objects[currObjInd].reset();
		}

		//prepares the next object
		currObjInd++;

		//returns the object that was worked on
		return objects[currObjInd-1];
	};

	/**
	 * Resets the pool to its default settings. 
	 */
	this.reset = function(){
		//removes all objects
		while(objects.length > 0)
			objects.pop();

		poolRange = 0;
		currObjInd = 0;
	};

	/**
	 * Returns all of the preloaded objects. 
	 */
	this.getObjects = function(){
		return objects;
	};

	/**
	 * Returns the current object from pool. 
	 * @return {Object} The current object on the line. 
	 */
	this.getCurrentObject = function(){
		if(currObjInd == poolRange)
			currObjInd = 0;

		return objects[currObjInd];
	}
}