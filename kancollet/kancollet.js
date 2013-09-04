function KancolletTimer(type,num,name){
	this.type = type;
	this.num  = num;
	this.name = name;
}

KancolletTimer.prototype.addTimer = function(){
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

	var rows = document.getElementById('kancollet-timers').rows;
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
}

KancolletTable.prototype.addTable = function(){
	var table = document.createElement('table');
	table.setAttribute('id','kancollet-timers');

	types = {expedition:'遠征',dock:'入渠',arsenal:'建造'}
	for(key in types){
		var tr = table.insertRow(-1);
		var th = document.createElement('th');
		th.setAttribute('id',key);
		th.setAttribute('scope','row');
		th.innerText = types[key];
		tr.appendChild(th);
	}
	document.getElementById('kancollet-form').appendChild(table);
}

