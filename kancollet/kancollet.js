var Kancollet = (function() {
	var ns = {};
	var baseurl = 'http://syusui-s.github.io/kancollet/';
	var alarm_basename = baseurl + 'kancollet/alarm';

	//////////////////////////////////
	// Timer
	function Timer(name,type,id){
		this.name	= name;
		this.type	= type;
		this.id		= id;
		this.time	= null;
		this.element = null;
		this.endtime = null;
		this.timer   = null;
		this.timer_show = null;
		this.alarm = null;
	}

	// Instance Methods
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

		var timer_button = document.createElement('span');
		timer_button.className = 'timer-button';
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
	};

	Timer.prototype.setTime = function(time){
		this.time = time;
		this.timer_show.textContent = time;
		this.changeBGColor('default');
	};

	Timer.prototype.startTimer = function(){
		if(!this.timer && this.time){
			var time = Timer.parseTime(this.time);
			if(!time) return false;
			this.enableAlarm();
			this.changeBGColor('default');
			this.endtime = Date.now() + (time.hour*3600+time.min*60+time.sec)*1000;
			this.timer = setInterval(function(timer){
				timer.showTimer();
			},500,this);
		}else{
			return false;
		}
		return true;
	};

	Timer.prototype.stopTimer = function(){
		if(this.timer){
			if(this.endtime - Date.now() <= 0){
				this.timer_show.textContent = '　完了　';
				this.changeBGColor('complete');
				this.playAlarm();
			}
			clearInterval(this.timer);
			this.timer   = null;
			this.time = null;
			this.endtime = null;
			TimerSetting.changeButtonEnable();
		}else{
			return false;
		}
		return true;
	};

	Timer.prototype.showTimer = function(){
		var remain = this.endtime - Date.now();
		var timestr = Timer.timeToReadableStr(Timer.msToTime(remain));
		if(remain <= 0){
			this.stopTimer();
			return false;
		}
		this.setTime(timestr);
	};

	Timer.prototype.changeBGColor = function(key){
		var bgcolors = {
			default: '#ffffff',
			complete: '#a0f05a'
		};
		if(bgcolors[key]){
			this.element.style.backgroundColor = bgcolors[key];
		}else{
			return false;
		}
	};

	Timer.prototype.enableAlarm = function(){
		this.alarm = new Alarm();
	};

	Timer.prototype.playAlarm = function(){
		if(this.alarm){
			this.alarm.play();
		}else{
			this.enableAlarm();
			this.alarm.play();
		}
	};

	// Class Methods
	Timer.parseTime = function(timestr){
		if(timestr.length < 9){
			timestr+=':00';
		}
		var timearr = (/(\d{2}):(\d{2}):(\d{2})/).exec(timestr);
		if(!timearr){
			return false;
		}
		var time = {};
		time.hour = +timearr[1];
		time.min  = +timearr[2];
		time.sec  = +timearr[3];
		return time;
	};
	
	Timer.msToTime = function(microsecond){
		var rtn = {};
		var sec = microsecond/1000;
		rtn.hour = parseInt(sec/3600);sec = sec%3600;
		rtn.min  = parseInt(sec/60);sec = sec%60;
		rtn.sec  = parseInt(sec);
		return rtn;
	};

	Timer.timeToReadableStr = function(time){
		var rtn = {};
		rtn.hour = ('00'+time.hour.toString()).slice(-2);
		rtn.min  = ('00'+time.min.toString()).slice(-2);
		rtn.sec  = ('00'+time.sec.toString()).slice(-2);
		return rtn.hour+':'+rtn.min+':'+rtn.sec;
	};

	//////////////////////////////////
	// Alarm
	function Alarm(){
		this.alarm = new Audio();
		this.prepare();
	}
	
	// Class Variables
	Alarm.VOLUME = 0.3;

	// Instance Methods
	Alarm.prototype.prepare = function(){
		if(!(Alarm.playType)){
			Alarm.setPlayType();
		}
		this.alarm.src = alarm_basename + Alarm.PLAYTYPE;
		this.alarm.load();
		this.alarm.volume = Alarm.VOLUME;
	};

	Alarm.prototype.play = function(){
		this.alarm.play();
	}

	// Class Methods
	Alarm.canPlayTypes = function(){
		var audio = new Audio();
		var types = new Array();
		if(audio.canPlayType('audio/ogg') != ''){ types.push('.ogg'); }
		if(audio.canPlayType('audio/mp3') != ''){ types.push('.mp3'); }
		if(audio.canPlayType('audio/wav') != ''){ types.push('.wav'); }

		return types;
	}
	
	Alarm.setPlayType = function(){
		var types = Alarm.canPlayTypes();
		if(types[0]){
			Alarm.PLAYTYPE = types[0]
		}else{
			return false;
		}
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
		for(var i=0;i<types.length;i+=1){
			var tr = table.insertRow(-1);
			var th = document.createElement('th');
			th.setAttribute('id',types[i][0]);
			th.setAttribute('scope','row');
			th.textContent = types[i][1];
			tr.appendChild(th);
		}
		this.element = document.getElementById('kancollet-timers-form').appendChild(table);
	};

	TimersTable.prototype.addTimer = function(name,type,id){
		var key   = type+'-'+id.toString();
		if(!this.timers[key]){
			var timer = new Timer(name,type,id);
			timer.createElement();
			var rows = this.element.rows;
			var tr   = null;
			for(var i=0;i<rows.length;i+=1){
				if(rows[i].childNodes[0].id === timer.type){
					tr = rows[i];
					break;
				}
			}
			if(tr){
				tr.appendChild(timer.element);
				this.timers[key] = timer;
				return true;
			}
		}
		return false;
	};

	TimersTable.prototype.removeTimer = function(type,id){
		var key = type+'-'+id.toString();
		var timer = this.timers[key];

		if(timer){
			var parentnode = timer.element.parentNode;
			parentnode.removeChild(timer.element);
			delete this.timers[key];
			return true;
		}else{
			return false;
		}
	};

	//////////////////////////////////
	// TimerSetting
	var TimerSetting = {};
	TimerSetting.target_timer = null;
	TimerSetting.setTargetTimer = function(obj){
		var key = ((/timer-(\w+-\d)/).exec(obj.id))[1];
		this.target_timer = ns.timers_table.timers[key]
		if(this.target_timer){
			var timer_adjust = document.getElementById('kancollet-timersetting-time');
			this.target_timer.changeBGColor('default');
			timer_adjust.disabled = false;

			if(this.target_timer.time){
				timer_adjust.value = this.target_timer.time;
			}else{
				timer_adjust.value = '00:00:00';
			}

			this.changeButtonEnable();
		}
		else{
			return false;
		}
	};

	TimerSetting.settingTimer = function(){
		if(this.target_timer && !this.target_timer.timer){
			var time = document.getElementById('kancollet-timersetting-time').value;
			this.target_timer.setTime(time);
		}
	};

	TimerSetting.startTimer = function(){
		if(this.target_timer && !this.target_timer.timer){
			this.settingTimer();
			if(!this.target_timer.startTimer()){
				window.alert('書式が間違っています。正しい書式で入れなおしてください。');
			}
			this.changeButtonEnable();
		}
	};

	TimerSetting.stopTimer = function(){
		if(this.target_timer){
			this.target_timer.stopTimer();
			this.changeButtonEnable();
		}
	};

	TimerSetting.changeButtonEnable = function(){
		var start_button = document.getElementById('kancollet-timersetting-start');
		var stop_button = document.getElementById('kancollet-timersetting-stop');
		if(this.target_timer.timer){
			start_button.disabled = true;
			stop_button.disabled = false;
		}else{
			start_button.disabled = false;
			stop_button.disabled = true;
		}
	};

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
			kancollet_timersetting_time.id = 'kancollet-timersetting-time';
			kancollet_timersetting_time.type = 'time';
			kancollet_timersetting_time.step = '1';
			kancollet_timersetting_time.disabled = true;
			kancollet_timersetting_time.setAttribute('onchange','Kancollet.TimerSetting.settingTimer()');

			var kancollet_timersetting_start = document.createElement('input');
			kancollet_timersetting_start.id = 'kancollet-timersetting-start';
			kancollet_timersetting_start.type = 'button';
			kancollet_timersetting_start.value = '開始';
			kancollet_timersetting_start.disabled = true;
			kancollet_timersetting_start.setAttribute('onclick','Kancollet.TimerSetting.startTimer()');

			var kancollet_timersetting_stop = document.createElement('input');
			kancollet_timersetting_stop.id = 'kancollet-timersetting-stop';
			kancollet_timersetting_stop.type = 'button';
			kancollet_timersetting_stop.value = '停止';
			kancollet_timersetting_stop.disabled = true;
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

			var kancollet_timersetting_close = document.createElement('span');
			kancollet_timersetting_close.setAttribute('onclick','Kancollet.remove()');
			var kancollet_timersetting_closeimg = document.createElement('img');
			kancollet_timersetting_closeimg.id = 'kancollet-timersetting-closeimg';
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

			var timers_table = new TimersTable();
			timers_table.appendElement();

			timers_table.addTimer('第二艦隊','expedition',1);
			timers_table.addTimer('第三艦隊','expedition',2);
			timers_table.addTimer('第四艦隊','expedition',3);

			timers_table.addTimer('ドック1','dock',1);
			timers_table.addTimer('ドック2','dock',2);

			timers_table.addTimer('ドック1','arsenal',1);
			timers_table.addTimer('ドック2','arsenal',2);

			ns.timers_table = timers_table;

			return true;
		}else{
			return false;
		}
	}

	// namespace
	ns.Timer = Timer;
	ns.TimersTable = TimersTable;
	ns.TimerSetting = TimerSetting;
	ns.create = createKancollet;
	ns.remove = removeKancollet;
	return ns;
}());
Kancollet.create();
