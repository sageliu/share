/*on(ele,"click",fn1);
on(ele,"click",fn2);
on(ele,"click",fn3);*/
function on(ele,type,fn){//主要解决顺序问题
	//凡是以self开头的事件类型，都认为是自定义事件
	if(/^self/.test(type)){
		if(!ele[type]){
			ele[type]=[];	
		}
		var a=ele[type];
		for(var i=0;i<a.length;i++){
			if(a[i]==fn)return;	
		}
		a.push(fn);
		return;
	}
	if(ele.addEventListener){
		ele.addEventListener(type,fn,false);
		return;	
	}
	if(!ele["aEvent"+type]){//如果没有这样一个程序池，则创建
		ele["aEvent"+type]=[];
		ele.attachEvent("on"+type,function(){run.call(ele)});
	}
	
	var a=ele["aEvent"+type];//把这个数组赋值给一个简短的变量，便于操作
	for(var i=0;i<a.length;i++){//避免程序池里出现重复的方法
		if(a[i]==fn)return;	
	}
	a.push(fn);
	//bind(ele,type,run);//
	//this的问题，还不能使run重复绑定
	//ele.attachEvent("on"+type,function(){run.call(ele)});
	
}

function run(){
	var e=window.event;
	if(!e.target){//表示这肯定是IE，
		e.target=e.srcElement;
		e.preventDefault=function(){e.returnValue=false;}
		e.stopPropagation=function(){e.cancelBubble=true;};
		e.pageX=(document.documentElement.scrollLeft||document.body.scrollLeft)+e.clientX;
		e.pageY=(document.documentElement.scrollTop||document.body.scrollTop)+e.clientY;
	}
	var a=this["aEvent"+e.type];
	
	for(var i=0;i<a.length;i++){
		if(typeof a[i]=="function"){
			a[i].call(this,e);
		}else{
			a.splice(i,1);
			i--;
		}
	}
}
function selfRun(selfType,e){//就是自定义事件的“通知”方法
	var a=this[selfType];
		if(a){
			for(var i=0;i<a.length;i++){
				if(typeof a[i]=="function")
					a[i].call(this,e);//通知：就是遍历执行约定了selfdrag事件的那些方法	
			}
			
		}
	
}

function off(ele,type,fn){
	if(/^self/.test(type)){//以下是执行移除自定义事件上绑定的方法
		var a=ele[type];
		if(a){
			for(var i=0;i<a.length;i++){
				if(a[i]==fn){
					a[i]=null;
					return;	
				}
				
			}
		}
		return;//表示是自定义事件，不需要执行下边的事件处理
	}
	
	if(ele.removeEventListener){
		ele.removeEventListener(type,fn,false);
		return;	
	}
	var a=ele["aEvent"+type];
	if(a){
		for(var i=0;i<a.length;i++){
			if(a[i]==fn){
				a[i]=null;
				return;	
			}
		}
	}
}

function processThis(obj,fn){
	return function (e){fn.call(obj,e)}	
}
Function.prototype.bind//这个方法的功能和processThis相同

/*function bind(ele,type,fn){//解决ie中被绑定到事件上的方法，在运行的时候，this不指向ele的问题
	function fnTemp(e){fn.call(ele,e);}//这是核心代码
	ele.attachEvent("on"+type,fnTemp);
	//还有一个避免重复绑定的判断
	for(var i=0;i<a.length;i++){
		if(a[i].photo==fn)return;	
		
	}
}


function unbind(ele,type,fn){
	
}*/
//众生无始以来，一直处于无明烦恼之中，累劫累生，习气深厚，这些烦恼习气从未离心，所以虽发菩提心而难守持，虽欲度众生而自己却被烦恼束缚，虽欲修行而障难重重。即使能够深悟佛法之理，也由于难敌烦恼业力，不能进步
/*
moudle.exports.fn=on;
moudle.exports=on;
moudle.exports是Node内置的对象*/