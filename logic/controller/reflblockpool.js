var matrixelim = matrixelim || {};

(function(){
	function ReflBlockPool(stage, dimensions, alpha){
		this.ObjectPool_constructor(function(){
			return new matrixelim.BlockReflection(dimensions, alpha);
		}, stage);	
	}

	var e = createjs.extend(ReflBlockPool, ObjectPool);

	matrixelim.ReflBlockPool = createjs.promote(ReflBlockPool, 'ObjectPool');
}());