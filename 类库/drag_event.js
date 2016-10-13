function down(e){
	//保存盒子和鼠标和原始值
	this.x=this.offsetLeft;
	this.y=this.offsetTop;
	this.mx=e.pageX;
	this.my=e.pageY;
	if(this.setCapture){
		this.setCapture();
		on(this,"mousemove",move);
		on(this,"mouseup",up);
	}else{
		this._move=move.bind(this);
		this._up=up.bind(this);
		processThis(this,up);
		
		//bind方法是定义在Function.prototype上的方法，作用是它会返回一个函数，返回的函数功能上和调用它的这个函数相同，这个函数在执行的时候，里面的this指向bind的第一个参数，功能和processThis一样
		on(document,"mousemove",this._move);
		on(document,"mouseup",this._up);	
		selfRun.call(this,"selfdragstart",e);//就是通知
	}
	/*
	clearTimeout(this.flyTimer);
	clearTimeout(this.dropTimer);
	*/
}
	//根据浏览器不同，用不同的方式来绑定move方法
	
	function move(e){
		this.style.left=this.x+(e.pageX-this.mx)+"px";
		this.style.top=this.y+(e.pageY-this.my)+"px";
		selfRun.call(this,"selfdrag",e);
		/*
		//fly的速度是这一次的位置-上一次位置
		if(!this.prevPosi){
			this.prevPosi=this.offsetLeft;
		}else{
			this.speed=this.offsetLeft-this.prevPosi;
			this.prevPosi=this.offsetLeft;	
		}
		*/
		
}
	function up(e){
		if(this.releaseCapture){
		this.releaseCapture();
		off(this,"mousemove",move);
		off(this,"mouseup",up);
		}else{
			off(document,"mousemove",this._move);
			off(document,"mouseup",this._up);
		}
		/*
		fly.call(this);
		drop.call(this);
		*/
		selfRun.call(this,"selfdragend",e);
}
