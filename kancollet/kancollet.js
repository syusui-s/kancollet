function KancolletTimer(type,num,name){
	this.type    = type;
	this.num     = num;
	this.name    = name;
	this.element = null;
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
	th.appendChild(td);
}

KancolletTimer.prototype.settingTimer = function(elem){
	id = elem.getAttribute('id');
}

function KancolletTable(){
	this.element = null;
	this.timers = {};
}

KancolletTable.prototype.appendElement = function(){
	var table = document.createElement('table');
	table.setAttribute('id','kancollet-timers-table');

	types = {expedition:'遠征',dock:'入渠',arsenal:'建造'}
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

function KancolletPreset(){

}

function removeKancollet(){
	document.body.removeChild(document.getElementById('kancollet'));
}

function createKancollet(){
	var kancollet = document.createElement('div');
	kancollet.setAttribute('id','kancollet');
	
	var kancollet_timers = document.createElement('form');
	kancollet_timers.setAttribute('id','kancollet-timers-form');

	var kancollet_setting_form = document.createElement('form');
	kancollet_timers.setAttribute('id','kancollet-timers-form');

}
