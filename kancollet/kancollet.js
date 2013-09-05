var Kancollet = (function(){
	var ns = {};
	var baseurl = 'http://syusui-s.github.io/kancollet/';
	//////////////////////////////////
	// Timer
	function Timer(name,type,id){
		this.name    = name;
		this.type    = type;
		this.id      = id;
		this.time    = null;
		this.element = null;
		this.endtime = null;
		this.timer   = null;
		this.timer_show = null;
	}

	Timer.prototype.createElement = function(){
		var td = document.createElement('td');
		td.className = 'timer';
		td.id = 'timer'+'-'+this.type+'-'+this.id.toString();

		var timer_name = document.createElement('span');
		timer_name.className = 'timer-name';
		timer_name.textContent = this.name;

		var timer_show = document.createElement('span');
		timer_show.className = 'timer-show';
		timer_show.textContent = '　未設定 ';

		var timer_button = document.createElement('a');
		timer_button.type = 'button';
		timer_button.className = 'timer-button';
		timer_button.href = '#'
		timer_button.setAttribute('onclick','Kancollet.TimerSetting.setTargetTimer(this.parentNode)');
		var timer_button_img = document.createElement('img');
		timer_button_img.src = baseurl+'kancollet/img/setting_button.png';
		timer_button_img.alt = '設定';
		timer_button_img.width  = '14';
		timer_button_img.height = '14';
		timer_button.appendChild(timer_button_img);

		td.appendChild(timer_name);
		td.appendChild(timer_show);
		td.appendChild(timer_button);

		this.element = td;
		this.timer_show = timer_show;
		return this.element;
	}

	Timer.prototype.setTime = function(time){
		this.time = time;
		this.timer_show.textContent = time;
	}

	Timer.prototype.startTimer = function(){
		if(!this.timer && this.time){
			var time = Timer.parseTime(this.time);
			this.endtime = Date.now() + (time.hour*3600+time.min*60+time.sec)*1000;
			// this.timer   = setInterval(this.showTimer,1000);
			this.timer = setInterval(function(timer){
				timer.showTimer();
			},500,this)
		}else return false;
	}

	Timer.prototype.stopTimer = function(){
		if(this.timer){
			clearInterval(this.timer);
			this.timer   = null;
			this.endtime = null;
			if(this.time === '00:00:00'){
				this.timer_show.textContent = '　完了　';
				this.time = null;
			}
		}else return false;
	}

	Timer.prototype.showTimer = function(){
		var remain = this.endtime - Date.now();
		var timestr = Timer.timeToReadableStr(Timer.msToTime(remain));
		if(remain <= 0){
			this.stopTimer();
			return false;
		}
		this.setTime(timestr);
	}
	
	Timer.parseTime = function(timestr){
		if(timestr.length < 9) timestr+=':00';
		var timearr = (/(\d{2}):(\d{2}):(\d{2})/).exec(timestr);
		var time = {};
		time.hour = +timearr[1];
		time.min  = +timearr[2];
		time.sec  = +timearr[3];
		return time;
	}
	
	Timer.msToTime = function(microsecond){
		var rtn = {};
		var sec = microsecond/1000;
		rtn.hour = parseInt(sec/3600);sec = sec%3600;
		rtn.min  = parseInt(sec/60);sec = sec%60;
		rtn.sec  = parseInt(sec);
		return rtn;
	}

	Timer.timeToReadableStr = function(time){
		var rtn = {};
		rtn.hour = ('00'+time.hour.toString()).slice(-2);
		rtn.min  = ('00'+time.min.toString()).slice(-2);
		rtn.sec  = ('00'+time.sec.toString()).slice(-2);
		return rtn.hour+':'+rtn.min+':'+rtn.sec;
	}

	//////////////////////////////////
	// TimersTable
	function TimersTable(){
		this.element = null;
		this.timers = {};
	}

	TimersTable.prototype.appendElement = function(){
		var table = document.createElement('table');
		table.id = 'kancollet-timers-table';

		var types = [ ['expedition','遠征'],['dock','入渠'],['arsenal','建造'] ];
		for(var i=0;i<types.length;i++){
			var tr = table.insertRow(-1);
			var th = document.createElement('th');
			th.setAttribute('id',types[i][0]);
			th.setAttribute('scope','row');
			th.textContent = types[i][1];
			tr.appendChild(th);
		}
		this.element = document.getElementById('kancollet-timers-form').appendChild(table);
	}

	TimersTable.prototype.addTimer = function(name,type,id){
		if(!this.timers[type+'-'+id.toString()]){
			var key   = type+'-'+id.toString();
			var timer = new Timer(name,type,id);
			timer.createElement();

			var rows = this.element.rows;
			var tr   = null;
			for(var i=0;i<rows.length;i++){
				if(rows[i].childNodes[0].id === timer.type){
					tr = rows[i];
					break;
				}
			}
			if(tr !== null){
				tr.appendChild(timer.element)
				this.timers[key] = timer;
				return true;
			}
		}
		return false;
	}

	TimersTable.prototype.removeTimer = function(type,id){
		var key = type+'-'+id.toString();
		console.log(key)
		var timer = this.timers[key];

		if(timer){
			var parentnode = timer.element.parentNode;
			parentnode.removeChild(timer.element);
			delete this.timers[key];
			return true;
		}else{
			return false;
		}
	}

	var TimerSetting = {};
	TimerSetting.target_timer = null;
	TimerSetting.setTargetTimer = function(obj){
		var key = ((/timer-(\w+-\d)/).exec(obj.id))[1];
		if(ns.timers_table.timers[key]){
			this.target_timer = ns.timers_table.timers[key];
			var timer_adjust = document.getElementById('kancollet-setting-time');
			timer_adjust.disabled = false;
			if(this.target_timer.time !== null) timer_adjust.value = this.target_timer.time;
			else timer_adjust.value = '00:00:00';
		}
		else false;
	}
	TimerSetting.settingTimer = function(){
		if(this.target_timer){
			var time = document.getElementById('kancollet-setting-time').value;
			this.target_timer.setTime(time);
		}
	}

	TimerSetting.startTimer = function(){
		this.settingTimer();
		if(this.target_timer) this.target_timer.startTimer();
	}

	TimerSetting.stopTimer = function(){
		if(this.target_timer) this.target_timer.stopTimer();
	}

	function removeKancollet(){
		document.body.removeChild(document.getElementById('kancollet'));
	}

	function createKancollet(){
		if(!document.getElementById('kancollet')){
			var kancollet_stylesheet = document.createElement('link');
			kancollet_stylesheet.rel = 'stylesheet';
			kancollet_stylesheet.href = baseurl+'kancollet/kancollet.css';

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
			kancollet_timersetting_time.disabled = true;
			kancollet_timersetting_time.setAttribute('onchange','Kancollet.TimerSetting.settingTimer()');

			var kancollet_timersetting_start = document.createElement('input');
			kancollet_timersetting_start.type = 'button';
			kancollet_timersetting_start.value = '開始';
			kancollet_timersetting_start.setAttribute('onclick','Kancollet.TimerSetting.startTimer()');

			var kancollet_timersetting_stop = document.createElement('input');
			kancollet_timersetting_stop.type = 'button';
			kancollet_timersetting_stop.value = '停止';
			kancollet_timersetting_stop.setAttribute('onclick','Kancollet.TimerSetting.stopTimer()');

			var kancollet_timersetting_softwarename = document.createElement('img');
			kancollet_timersetting_softwarename.id = 'kancollet-timersetting-softwarename';
			kancollet_timersetting_softwarename.src = baseurl + 'kancollet/img/kancollet.png';
			kancollet_timersetting_softwarename.alt = 'Kancollet';
			kancollet_timersetting_softwarename.width  = '62';
			kancollet_timersetting_softwarename.height = '11';

			/*
			var kancollet_timersetting_setting = document.createElement('a');
			kancollet_timersetting_setting.setAttribute('href','#');
			kancollet_timersetting_setting.textContent = '設定';
			*/

			var kancollet_timersetting_close = document.createElement('a');
			kancollet_timersetting_close.href = 'javascript:Kancollet.remove();';
			var kancollet_timersetting_closeimg = document.createElement('img');
			kancollet_timersetting_closeimg.id = 'kancollet-timersetting-closeimg'
			kancollet_timersetting_closeimg.src = baseurl+'kancollet/img/close_button.png';
			kancollet_timersetting_closeimg.alt = '閉じる';
			kancollet_timersetting_closeimg.width  = '16';
			kancollet_timersetting_closeimg.height = '16';
			kancollet_timersetting_close.appendChild(kancollet_timersetting_closeimg);

			var kancollet_timersetting_cleardiv = document.createElement('div');
			kancollet_timersetting_cleardiv.className = 'clear';
			kancollet_timersetting_cleardiv.appendChild(document.createElement('hr'));

			kancollet_timersetting_form.appendChild(kancollet_timersetting_time);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_start);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_stop);
			kancollet_timersetting_form.appendChild(document.createElement('br'));
			kancollet_timersetting_form.appendChild(kancollet_timersetting_softwarename);
			// kancollet_timersetting_form.appendChild(kancollet_timersetting_setting);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_close);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_cleardiv);

			kancollet.appendChild(kancollet_timers_form);
			kancollet.appendChild(kancollet_timersetting_form);

			document.head.appendChild(kancollet_stylesheet);
			document.body.appendChild(kancollet);
			var timers_table = new TimersTable(); // keep this global to debug
			timers_table.appendElement();

			timers_table.addTimer('第二艦隊','expedition',1);
			timers_table.addTimer('第三艦隊','expedition',2);
			timers_table.addTimer('第四艦隊','expedition',3);
			
			timers_table.addTimer('ドック1','dock',1);
			timers_table.addTimer('ドック2','dock',2);

			timers_table.addTimer('ドック1','arsenal',1);
			timers_table.addTimer('ドック2','arsenal',2);

			ns.timers_table = timers_table;
		}else return false;
	}

	// namespace
	ns.Timer = Timer;
	ns.TimersTable = TimersTable;
	ns.TimerSetting = TimerSetting;
	ns.create = createKancollet;
	ns.remove = removeKancollet;
	return ns;
}());
