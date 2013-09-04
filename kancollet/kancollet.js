function KancolletTimer(type,num,name){
	this.type    = type;
	this.num     = num;
	this.name    = name;
	this.time    = null;
	this.element = null;
	// private
	this.endtime = null;
	this.timer   = null;
}

KancolletTimer.prototype.appendElement = function(){
	var td = document.createElement('td');
	td.setAttribute('class','timer');
	td.setAttribute('id','timer'+this.type+this.num.toString());

	var timer_name = document.createElement('span');
	timer_name.setAttribute('class','timer-name');
	timer_name.innerText = this.name;

	var timer_show = document.createElement('span');
	timer_show.setAttribute('class','timer-show');
	
	var timer_button = document.createElement('input');
	timer_button.setAttribute('type','button');
	timer_button.setAttribute('class','timer-button');
	timer_button.setAttribute('value','');
	timer_button.setAttribute('onclick','settingTimer(this.parentNode)');

	td.appendChild(timer_name);
	td.appendChild(timer_show);
	td.appendChild(timer_button);

	var rows = document.getElementById('kancollet-timers-table').rows;
	var th   = null;
	for(var i=0;i<rows.length;i++){
		if(rows[i].childNodes[0].getAttribute('id') === this.type){
			th = rows[i];
			break;
		}
	}
	this.element = th.appendChild(td);
}

KancolletTimer.prototype.settingTimer = function(time){
	this.time = time;
	this.element.
}

function KancolletTable(){
	this.element = null;
	this.timers = {};
}

KancolletTable.prototype.appendElement = function(){
	var table = document.createElement('table');
	table.setAttribute('id','kancollet-timers-table');

	var types = {expedition:'遠征',dock:'入渠',arsenal:'建造'};
	for(key in types){
		var tr = table.insertRow(-1);
		var th = document.createElement('th');
		th.setAttribute('id',key);
		th.setAttribute('scope','row');
		th.innerText = types[key];
		tr.appendChild(th);
	}
	this.element = document.getElementById('kancollet-timers-form').appendChild(table);
}

KancolletTable.prototype.addTimer = function(type,num,name){
	if(!this.timers[type+'-'+num.toString()]){
		var key = type+'-'+num.toString();
		var timer = new KancolletTimer(type,num,name);
		timer.appendElement();
		this.timers[key] = timer;
		return true;
	}else{
		return false;
	}
}

KancolletTable.prototype.removeTimer = function(type,num){
	var key = type+'-'+num.toString();
	var timer = this.timers[type+'-'+num.toString()]
	if(timer){
		var parentnode = timer.element.parentNode;
		parentnode.removeChild(timer.element);
		delete this.timers[key];
	}else{
		return false;
	}
}

function KancolletPreset(){

}

function removeKancollet(){
	document.body.removeChild(document.getElementById('kancollet'));
}

function createKancollet(){
	var kancollet = document.createElement('div');
	kancollet.id = 'kancollet';
	
	var kancollet_timers_form = document.createElement('form');
	kancollet_timers_form.id = 'kancollet-timers-form';

	var kancollet_timersetting_form = document.createElement('form');
	kancollet_timersetting_form.id = 'kancollet-timersetting-form';
	
	var kancollet_timersetting_time = document.createElement('input');
	kancollet_timersetting_time.id = 'kancollet-setting-time';
	kancollet_timersetting_time.type = 'time';
	kancollet_timersetting_time.step = '1';

	var kancollet_timersetting_start = document.createElement('input');
	kancollet_timersetting_start.type = 'button';
	kancollet_timersetting_start.value = '開始';

	var kancollet_timersetting_stop = document.createElement('input');
	kancollet_timersetting_stop.type = 'button';
	kancollet_timersetting_stop.value = '停止');

	var kancollet_timersetting_softwarename = document.createElement('img');
	kancollet_timersetting_softwarename.id = 'kancollet-timersetting-softwarename';
	kancollet_timersetting_softwarename.src = './kancollet/img/kancollet.png';
	kancollet_timersetting_softwarename.alt = 'Kancollet';
	kancollet_timersetting_softwarename.width  = '62';
	kancollet_timersetting_softwarename.height = '11';

	var kancollet_timersetting_setting = document.createElement('a');
	kancollet_timersetting_setting.setAttribute('href','#');
	kancollet_timersetting_setting.innerText = '設定';

	var kancollet_timersetting_close = document.createElement('a');
	kancollet_timersetting_close.href = 'javascript:removeKancollet();');
	var kancollet_timersetting_closeimg = document.createElement('img');
	kancollet_timersetting_closeimg.id = 'kancollet-timersetting-closeimg'
	kancollet_timersetting_closeimg.src = './kancollet/img/close_button.png';
	kancollet_timersetting_closeimg.alt = '閉じる';
	kancollet_timersetting_closeimg.width  = '16';
	kancollet_timersetting_closeimg.height = '16';
	kancollet_timersetting_close.appendChild(kancollet_timersetting_closeimg);

	var kancollet_timersetting_cleardiv = document.createElement('div');
	kancollet_timersetting_cleardiv.class = 'clear';
	kancollet_timersetting_cleardiv.appendChild(document.createElement('hr'));

	kancollet_timersetting_form.appendChild(kancollet_timersetting_time);
	kancollet_timersetting_form.appendChild(kancollet_timersetting_start);
	kancollet_timersetting_form.appendChild(kancollet_timersetting_stop);
	kancollet_timersetting_form.appendChild(document.createElement('br'));
	kancollet_timersetting_form.appendChild(kancollet_timersetting_softwarename);
	kancollet_timersetting_form.appendChild(kancollet_timersetting_setting);
	kancollet_timersetting_form.appendChild(kancollet_timersetting_close);
	kancollet_timersetting_form.appendChild(kancollet_timersetting_cleardiv);

	kancollet.appendChild(kancollet_timers_form);
	kancollet.appendChild(kancollet_timersetting_form);

	document.body.appendChild(kancollet);
	kancollet_timers_table = new KancolletTable(); // keep this global to debug
	kancollet_timers_table.appendElement();

	kancollet_timers_table.addTimer('expedition',1,'第二艦隊');
	kancollet_timers_table.addTimer('expedition',2,'第三艦隊');
	kancollet_timers_table.addTimer('expedition',3,'第四艦隊');
	
	kancollet_timers_table.addTimer('dock',1,'ドック1');
	kancollet_timers_table.addTimer('dock',2,'ドック2');

	kancollet_timers_table.addTimer('arsenal',1,'ドック1');
	kancollet_timers_table.addTimer('arsenal',2,'ドック2');
}
