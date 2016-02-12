/* Kancollet ver 0.12
 * Author: syusui_s
 *
 * official page: http://syusui-s.github.io/kancollet/
 */
/*jslint browser: true, vars: true, white: true */
var Kancollet = (function () {
	'use strict';
	var ns = {};
	var baseurl = (location.href.match(/^https?:\/\/(?!localhost|127\.0\.0\.1)/)) ? 'https://syusui-s.github.io/kancollet/' : './';
	var alarm_basename = baseurl + 'kancollet/alarm';

	//////////////////////////////////
	// Timer
	function Timer(name, type, id) {
		this.cookie_key = 'kancollet-timer-'+type+'-'+id.toString();
		this.name	= name;
		this.type	= type;
		this.id		= id;
		this.time	= null;
		this.last_time = null;
		this.element = null;
		this.endtime = null;
		this.timer   = null;
		this.timer_show = null;
		this.alarm = null;
	}

	// Instance Methods
	Timer.prototype.createElement = function () {
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
		timer_button.addEventListener('click', function(){ Kancollet.TimerSetting.setTargetTimer(this.parentNode); });

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

		this.restoreFromCookie();
		return this.element;
	};

	Timer.prototype.saveToCookie = function() {
		if (this.timer) {
			var expire = new Date(this.endtime);
			Cookie.save(this.cookie_key, this.endtime.toString(), expire);
		}
	};

	Timer.prototype.removeFromCookie = function () {
		if (this.timer) { return; }
		Cookie.remove(this.cookie_key);
	};

	Timer.prototype.restoreFromCookie = function() {
		if (this.timer) { return; }
		var value = Cookie.restore(this.cookie_key);

		if (value === '') { return; }
		var endtime = parseInt(value, 10);
		var remain = endtime - Date.now();
		if (remain > 0) {
			var timestr = Timer.timeToReadableStr(Timer.msToTime(remain));
			this.setTime(timestr);
			this.startTimer();
		}
	};

	Timer.prototype.setTime = function (time) {
		this.time = time;
		this.timer_show.textContent = time;
	};

	Timer.prototype.isElapsed = function() {
		return this.timer && (this.endtime - Date.now() <= 0);
	};

	Timer.prototype.startTimer = function () {
		if (!this.timer && this.time) {
			var time = Timer.parseTime(this.time);
			if (!time) { return false; }
			this.enableAlarm();
			this.changeBGColor('default');
			this.endtime = Date.now() + (time.hour * 3600 + time.min * 60 + time.sec)*1000;
			this.timer = setInterval(function (timer) {
				timer.showTimer();
			},500,this);
			this.last_time = this.time
			this.saveToCookie();
		}else{
			return false;
		}
		return true;
	};

	Timer.prototype.stopTimer = function () {
		if (this.timer) {
			if (this.isElapsed()) {
				this.timer_show.textContent = '　完了　';
				this.changeBGColor('complete');
				this.notification();
			}
			this.clearTimer();
			this.removeFromCookie();
			TimerSetting.changeButtonEnable();
		}else{
			return false;
		}
		return true;
	};

	Timer.prototype.clearTimer = function() {
		clearInterval(this.timer);
		this.time    = this.last_time;
		this.timer   = null;
		this.endtime = null;
		return true;
	};

	Timer.prototype.showTimer = function () {
		var remain = this.endtime - Date.now();
		if (remain <= 0) {
			this.stopTimer();
			return false;
		}
		var timestr = Timer.timeToReadableStr(Timer.msToTime(remain));
		this.setTime(timestr);
	};

	Timer.prototype.changeBGColor = function (key) {
		var bgcolors = {
			default: '',
			complete: '#a0f05a'
		};
		if (bgcolors[key] !== undefined) {
			this.element.style.backgroundColor = bgcolors[key];
		}else{
			return false;
		}
	};

	Timer.prototype.changeOpacity = function (key) {
		var opacities = {
			default: '',
			selected: 'selected-timer'
		};
		if (opacities[key] !== undefined) {
			this.element.childNodes[2].id = opacities[key];
		}else{
			return false;
		}
	};

	Timer.prototype.enableAlarm = function () {
		if (!this.alarm) {
			this.alarm = new Alarm();
		}
		return this;
	};

	Timer.prototype.disableAlarm = function () {
		this.alarm = null;
		return true;
	};

	Timer.prototype.notification = function () {
		this.showNotification();
		this.playAlarm();
	};

	Timer.prototype.showNotification = function () {
		if (! window.Notification) { return false; }
		if (Notification.permission !== 'granted') {
			Notification.requestPermission();
		}
		if (! window.document.hasFocus()) {
			var notification = new Notification('Kancollet', {
				lang: 'ja-JP',
				body: '「' + this.name + '」が完了しました',
				icon: (baseurl + 'kancollet/img/kancollet_icon.png')
			});
			notification.addEventListener('click',function() {
				notification.close();
				window.focus();
			});
		}
	};

	Timer.prototype.playAlarm = function () {
		if (this.alarm) {
			this.alarm.play();
		}else{
			this.enableAlarm();
			this.alarm.play();
		}
	};

	// Class Methods
	Timer.parseTime = function (timestr) {
		if (timestr.length < 9 ) {
			timestr+=':00';
		}
		var timearr = (/(\d{2}):(\d{2}):(\d{2})/).exec(timestr);
		if (!timearr) {
			return false;
		}
		var time = {};
		time.hour = +timearr[1];
		time.min  = +timearr[2];
		time.sec  = +timearr[3];
		return time;
	};
	
	Timer.msToTime = function (microsecond) {
		var rtn = {};
		var sec = microsecond/1000;

		rtn.hour = parseInt(sec/3600, 10);sec = sec%3600;
		rtn.min  = parseInt(sec/60, 10);sec = sec%60;
		rtn.sec  = parseInt(sec, 10);
		return rtn;
	};

	Timer.timeToReadableStr = function (time) {
		var rtn = {};
		rtn.hour = ('00'+time.hour.toString()).slice(-2);
		rtn.min  = ('00'+time.min.toString()).slice(-2);
		rtn.sec  = ('00'+time.sec.toString()).slice(-2);
		return rtn.hour+':'+rtn.min+':'+rtn.sec;
	};

	//////////////////////////////////
	// Alarm
	function Alarm() {
		this.alarm = new window.Audio();
		this.prepare();
	}
	
	// Class Variables
	Alarm.VOLUME = 0.9;

	// Instance Methods
	Alarm.prototype.prepare = function () {
		if (!(Alarm.playType)) {
			Alarm.setPlayType();
		}
		this.alarm.src = alarm_basename + Alarm.PLAYTYPE;
		this.alarm.load();
		this.alarm.volume = Alarm.VOLUME;
	};

	Alarm.prototype.play = function () {
		this.alarm.play();
	};

	// Class Methods
	Alarm.canPlayTypes = function () {
		var audio = new window.Audio();
		var types = [];
		if (audio.canPlayType('audio/ogg') !== '') { types.push('.ogg'); }
		if (audio.canPlayType('audio/mp3') !== '') { types.push('.mp3'); }
		if (audio.canPlayType('audio/wav') !== '') { types.push('.wav'); }

		return types;
	};
	
	Alarm.setPlayType = function () {
		var types = Alarm.canPlayTypes();
		if (types[0]) {
			Alarm.PLAYTYPE = types[0];
		}else{
			return false;
		}
	};

	//////////////////////////////////
	// Cookie
	var Cookie = {};
	
	Cookie.save = function (key, value, expire) {
		var expirestr = expire.toGMTString();
		document.cookie = key + '=' + value + '; expires=' + expirestr + ';';
	};

	Cookie.restore = function(key) {
		var pattern = new RegExp("(?:^|.*;\\s*)" + key + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*");
		var value = document.cookie.replace(pattern, "$1");
		return value;
	};

	Cookie.remove = function(key) {
		document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
	};

	//////////////////////////////////
	// TimersTable
	function TimersTable () {
		this.element = null;
		this.timers = {};
	}
	
	TimersTable.prototype.remove = function() {
		var timer_keys = Object.keys(this.timers);
		for (var i=0; i < timer_keys.length; ++i) {
			var timer = this.timers[timer_keys[i]];
			timer.clearTimer();
			timer.disableAlarm();
		}
	};

	TimersTable.prototype.appendElement = function () {
		var i;
		var table = document.createElement('table');
		table.id = 'kancollet-timers-table';

		var types = [ ['expedition','遠征'],['dock','入渠'],['arsenal','建造'] ];
		var tr, th;
		for (i=0; i<types.length; i+=1) {
			tr = table.insertRow(-1);
			th = document.createElement('th');
			th.setAttribute('id',types[i][0]);
			th.setAttribute('scope','row');
			th.textContent = types[i][1];
			tr.appendChild(th);
		}
		this.element = document.getElementById('kancollet-timers-form').appendChild(table);
	};

	TimersTable.prototype.addTimer = function (name, type, id) {
		var key = type+'-'+id.toString();
		if (!this.timers[key]) {
			var i;
			var timer = new Timer(name,type,id);
			var rows = this.element.rows;
			var tr   = null;

			for (i=0;i<rows.length;i+=1) {
				if (rows[i].childNodes[0].id === timer.type) {
					tr = rows[i];
					break;
				}
			}
			if (tr) {
				timer.createElement();
				tr.appendChild(timer.element);
				this.timers[key] = timer;
				return true;
			}
		}
		return false;
	};

	TimersTable.prototype.removeTimer = function (type, id) {
		var key = type+'-'+id.toString();
		var timer = this.timers[key];

		if (timer) {
			var parentnode = timer.element.parentNode;
			parentnode.removeChild(timer.element);
			delete this.timers[key];
			return true;
		}

		return false;
	};

	//////////////////////////////////
	// TimerSetting
	var TimerSetting = {};
	TimerSetting.target_timer = null;
	TimerSetting.setTargetTimer = function (obj) {
		var key = ((/timer-(\w+-\d)/).exec(obj.id))[1];
		var new_target_timer = ns.timers_table.timers[key];
		if (new_target_timer) {
			if (this.target_timer) {
				this.target_timer.changeOpacity('default');
			}
			this.target_timer = new_target_timer;
			this.target_timer.changeOpacity('selected');
			this.target_timer.changeBGColor('default');
			
			var time_input = document.getElementById('kancollet-timersetting-time');
			time_input.disabled = false;
			if (this.target_timer.time) {
				time_input.value = this.target_timer.time;
			}else{
				time_input.value = '00:00:00';
			}
			this.changeButtonEnable();
			return true;
		}
		return false;
	};

	TimerSetting.settingTimer = function () {
		if (this.target_timer && !this.target_timer.timer) {
			var time = document.getElementById('kancollet-timersetting-time').value;
			this.target_timer.changeBGColor('default');
			this.target_timer.setTime(time.length > 0 ? time : ' 未設定 ');
		}
	};

	TimerSetting.startTimer = function () {
		if (this.target_timer && !this.target_timer.timer) {
			this.settingTimer();
			if (!this.target_timer.startTimer()) {
				window.alert('書式が間違っています。正しい書式で入れなおしてください。');
			}
			this.changeButtonEnable();
		}
	};

	TimerSetting.stopTimer = function () {
		if (this.target_timer) {
			this.target_timer.stopTimer();
			this.changeButtonEnable();
		}
	};

	TimerSetting.changeButtonEnable = function () {
		var start_button = document.getElementById('kancollet-timersetting-start');
		var stop_button = document.getElementById('kancollet-timersetting-stop');
		if (this.target_timer.timer) {
			start_button.disabled = true;
			stop_button.disabled = false;
		}else{
			start_button.disabled = false;
			stop_button.disabled = true;
		}
	};

	//////////////////////////////////
	// Preset
	var Preset = [
		{ id:  1, type: 'expedition', name: '練習航海',             time: '00:15:00' },
		{ id:  2, type: 'expedition', name: '長距離練習航海',       time: '00:30:00' },
		{ id:  3, type: 'expedition', name: '警備任務',             time: '00:20:00' },
		{ id:  4, type: 'expedition', name: '対潜警戒任務',         time: '00:50:00' },
		{ id:  5, type: 'expedition', name: '海上護衛任務',         time: '01:30:00' },
		{ id:  6, type: 'expedition', name: '防空射撃演習',         time: '00:40:00' },
		{ id:  7, type: 'expedition', name: '観艦式予行',           time: '01:00:00' },
		{ id:  8, type: 'expedition', name: '観艦式',               time: '03:00:00' },
		{ id:  9, type: 'expedition', name: 'タンカー護衛任務',     time: '04:00:00' },
		{ id: 10, type: 'expedition', name: '強行偵察任務',         time: '01:30:00' },
		{ id: 11, type: 'expedition', name: 'ボーキサイト輸送任務', time: '05:00:00' },
		{ id: 12, type: 'expedition', name: '資源輸送任務',         time: '08:00:00' },
		{ id: 13, type: 'expedition', name: '鼠輸送作戦',           time: '04:00:00' },
		{ id: 14, type: 'expedition', name: '包囲陸戦隊撤収作戦',   time: '06:00:00' },
		{ id: 15, type: 'expedition', name: '囮機動部隊支援作戦',   time: '12:00:00' },
		{ id: 16, type: 'expedition', name: '艦隊決戦援護作戦',     time: '15:00:00' },
		{ id: 17, type: 'expedition', name: '敵地偵察作戦',         time: '00:45:00' },
		{ id: 18, type: 'expedition', name: '航空機輸送作戦',       time: '05:00:00' },
		{ id: 19, type: 'expedition', name: '北号作戦',             time: '06:00:00' },
		{ id: 20, type: 'expedition', name: '潜水艦哨戒任務',       time: '02:00:00' },
		{ id: 21, type: 'expedition', name: '北方鼠輸送作戦',       time: '02:20:00' },
		{ id: 22, type: 'expedition', name: '艦隊演習',             time: '03:00:00' },
		{ id: 23, type: 'expedition', name: '航空戦艦運用演習',     time: '04:00:00' },
		{ id: 24, type: 'expedition', name: '北方航路海上護衛',     time: '08:20:00' },
		// { id: 25, type: 'expedition', name: '通商破壊作戦',         time: '40:00:00' },
		// { id: 26, type: 'expedition', name: '敵母港空襲作戦',       time: '80:00:00' },
		{ id: 27, type: 'expedition', name: '潜水艦通商破壊作戦',   time: '20:00:00' },
		// { id: 28, type: 'expedition', name: '西方海域封鎖作戦',     time: '25:00:00' },
		{ id: 29, type: 'expedition', name: '潜水艦派遣演習',       time: '23:59:59' },
		// { id: 30, type: 'expedition', name: '潜水艦派遣作戦',       time: '48:00:00' },
		{ id: 31, type: 'expedition', name: '海外艦との接触',       time: '02:00:00' },
		{ id: 32, type: 'expedition', name: '遠洋練習航海',         time: '23:59:59' },
		{ id: 35, type: 'expedition', name: 'MO作戦',               time: '07:00:00' },
		{ id: 36, type: 'expedition', name: '水上機基地建設',       time: '09:00:00' },
		{ id: 37, type: 'expedition', name: '東京急行',             time: '02:45:00' },
		{ id: 38, type: 'expedition', name: '東京急行（弐）',       time: '02:55:00' },
		// { id: 39, type: 'expedition', name: '遠洋潜水艦作戦',       time: '30:00:00' },
		{ id: 40, type: 'expedition', name: '水上機前線輸送',       time: '06:50:00' }
	].sort(function(a, b){ return a.time > b.time ? 1 : -1; });

	Preset.createDatalist = function() {
		var datalist = document.createElement('datalist');
		datalist.id = 'kancollet-timer-preset';

		for (var i=0; i < this.length; ++i) {
			var option = document.createElement('option');
			var type = '遠征';
			option.value = this[i].time;
			option.textContent = '[' + type + '] ' + this[i].name;
			datalist.appendChild(option);
		}

		return datalist;
	};

	function removeKancollet() {
		this.timers_table.remove();
		document.body.removeChild(document.getElementById('kancollet'));
	}

	function createKancollet() {
		if (!document.getElementById('kancollet')) {
			var kancollet_stylesheet = document.createElement('link');
			kancollet_stylesheet.rel = 'stylesheet';
			kancollet_stylesheet.href = baseurl+'kancollet/kancollet.css';

			var kancollet = document.createElement('div');
			kancollet.id = 'kancollet';
			
			var kancollet_timers_form = document.createElement('form');
			kancollet_timers_form.id = 'kancollet-timers-form';

			var kancollet_timersetting_form = document.createElement('form');
			kancollet_timersetting_form.id = 'kancollet-timersetting-form';
			kancollet_timersetting_form.addEventListener('submit', function(ev) {
				Kancollet.TimerSetting.startTimer();
				ev.preventDefault();
			});
			
			var kancollet_timersetting_time = document.createElement('input');
			kancollet_timersetting_time.id = 'kancollet-timersetting-time';
			kancollet_timersetting_time.type = 'time';
			kancollet_timersetting_time.step = '1';
			kancollet_timersetting_time.disabled = true;
			kancollet_timersetting_time.setAttribute('autocomplete', 'on');
			kancollet_timersetting_time.setAttribute('list', 'kancollet-timer-preset');
			kancollet_timersetting_time.addEventListener('change', function() { Kancollet.TimerSetting.settingTimer() });

			var kancollet_timersetting_start = document.createElement('input');
			kancollet_timersetting_start.id = 'kancollet-timersetting-start';
			kancollet_timersetting_start.type = 'submit';
			kancollet_timersetting_start.value = '開始';
			kancollet_timersetting_start.disabled = true;

			var kancollet_timersetting_stop = document.createElement('input');
			kancollet_timersetting_stop.id = 'kancollet-timersetting-stop';
			kancollet_timersetting_stop.type = 'button';
			kancollet_timersetting_stop.value = '停止';
			kancollet_timersetting_stop.disabled = true;
			kancollet_timersetting_stop.addEventListener('click', function() { Kancollet.TimerSetting.stopTimer(); } );

			var kancollet_timersetting_softwarename = document.createElement('img');
			kancollet_timersetting_softwarename.id = 'kancollet-timersetting-softwarename';
			kancollet_timersetting_softwarename.src = baseurl + 'kancollet/img/kancollet.png';
			kancollet_timersetting_softwarename.alt = 'Kancollet';
			kancollet_timersetting_softwarename.width  = '78';
			kancollet_timersetting_softwarename.height = '15';

			/*
			var kancollet_timersetting_setting = document.createElement('a');
			kancollet_timersetting_setting.setAttribute('href','#');
			kancollet_timersetting_setting.textContent = '設定';
			*/

			var kancollet_timersetting_close = document.createElement('span');
			kancollet_timersetting_close.addEventListener('click', function() { Kancollet.remove(); } );
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
			kancollet_timersetting_form.appendChild(Preset.createDatalist());
			kancollet_timersetting_form.appendChild(kancollet_timersetting_start);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_stop);
			kancollet_timersetting_form.appendChild(document.createElement('br'));
			kancollet_timersetting_form.appendChild(kancollet_timersetting_softwarename);
			// kancollet_timersetting_form.appendChild(kancollet_timersetting_setting);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_close);
			kancollet_timersetting_form.appendChild(kancollet_timersetting_cleardiv);

			kancollet.appendChild(kancollet_timers_form);
			kancollet.appendChild(kancollet_timersetting_form);

			var links = document.getElementsByTagName('link');
			var check_css_exist = false;
			var i;
			for (i=links.length-1; i >= 0; i-=1) {
				if (links[i].href.indexOf('kancollet.css') >= 0) {
					check_css_exist = true;
					break;
				}
			}
			if (!check_css_exist) { document.head.appendChild(kancollet_stylesheet); }
			document.body.appendChild(kancollet);

			var timers_table = new TimersTable();
			timers_table.appendElement();

			timers_table.addTimer('第二艦隊','expedition',1);
			timers_table.addTimer('第三艦隊','expedition',2);
			timers_table.addTimer('第四艦隊','expedition',3);

			timers_table.addTimer('ドック1','dock',1);
			timers_table.addTimer('ドック2','dock',2);
			timers_table.addTimer('ドック3','dock',3);
			timers_table.addTimer('ドック4','dock',4);

			timers_table.addTimer('ドック1','arsenal',1);
			timers_table.addTimer('ドック2','arsenal',2);
			timers_table.addTimer('ドック3','arsenal',3);
			timers_table.addTimer('ドック4','arsenal',4);

			ns.timers_table = timers_table;

			return true;
		}

		return false;
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
