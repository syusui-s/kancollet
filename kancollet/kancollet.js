/* 互換性維持のための多段Javascript読み込み */
(function(){
	if(document.getElementById('kancollet_script_0_12_1')){
		Kancollet.create();
	} else {
		var e = document.createElement('script');
		e.setAttribute('language','javascript');
		e.id='kancollet_script_0_12_1';
		e.setAttribute('src','http://syusui-s.github.io/kancollet/kancollet-master/kancollet/kancollet.js');
		e.setAttribute('charset', 'UTF-8');
		document.head.appendChild(e);
	}
}());
