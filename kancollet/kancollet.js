/* Kancollet ver 1.0.0
 * Author: syusui_s
 *
 * official page: http://syusui-s.github.io/kancollet/
 */
window.Kancollet = (() => {
  'use strict';

  const baseurl = location.href.match(/^https?:\/\/(?!localhost|127\.0\.0\.1)/)
    ? 'https://syusui-s.github.io/kancollet/kancollet-master/'
    : './';
  const alarm_basename = baseurl + 'kancollet/alarm';

  //////////////////////////////////
  // Time utils
  const parseTime = (timestr) => {
    const matchM = /^([0-9]{1,})$/.exec(timestr);
    if (matchM) {
      const m = +matchM[0];
      const hour = Math.floor(m / 60);
      const min = m % 60;
      return { hour, min, sec: 0 };
    }

    const matchHM = /^([0-9]{1,}):([0-9]{1,2})$/.exec(timestr);
    if (matchHM) return { hour: +matchHM[1], min: +matchHM[2], sec: 0 };

    const matchHMS = /^([0-9]{1,}):([0-9]{1,2}):([0-9]{1,2})$/.exec(timestr);
    if (matchHMS) return { hour: +matchHMS[1], min: +matchHMS[2], sec: +matchHMS[3] };

    return { hour: 0, min: 0, sec: 0 };
  };

  const msToTime = (microsecond) => {
    let s = microsecond / 1000;

    const hour = parseInt(s / 3600, 10);
    s = s % 3600;
    const min = parseInt(s / 60, 10);
    s = s % 60;
    const sec = parseInt(s, 10);

    return { hour, min, sec };
  };

  const padZero = (num) => num.toString().padStart(2, '0');

  const timeToReadableStr = (time) => {
    const hour = padZero(time.hour);
    const min = padZero(time.min);
    const sec = padZero(time.sec);
    return `${hour}:${min}:${sec}`;
  };

  //////////////////////////////////
  // Cookie
  const Cookie = {
    save(key, value, expire) {
      const expirestr = expire.toGMTString();
      document.cookie = key + '=' + value + '; expires=' + expirestr + ';';
    },
    restore(key) {
      const pattern = new RegExp('(?:^|.*;\\s*)' + key + '\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*');
      const value = document.cookie.replace(pattern, '$1');
      return value;
    },
    remove(key) {
      document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    },
  };

  //////////////////////////////////
  // Timer
  class Timer {
    constructor(name, type, id) {
      this.cookie_key = 'kancollet-timer-' + type + '-' + id.toString();
      this.name = name;
      this.type = type;
      this.id = id;
      this.time = null;
      this.last_time = null;
      this.element = null;
      this.endtime = null;
      this.timer = null;
      this.timer_show = null;
      this.alarm = null;
    }

    createElement() {
      const id = 'timer' + '-' + this.type + '-' + this.id.toString();

      const td = document.createElement('td');
      td.className = 'timer';
      td.id = id;
      td.role = 'button';
      td.tabIndex = '0';
      td.addEventListener('click', (ev) => {
        ev.preventDefault();
        Kancollet.TimerSetting.setTargetTimer(id);
      });
      td.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === 'Space') {
          ev.preventDefault();
          Kancollet.TimerSetting.setTargetTimer(id);
        }
      });

      const timer_name = document.createElement('span');
      timer_name.className = 'timer-name';
      timer_name.textContent = this.name;

      const timer_show = document.createElement('span');
      timer_show.className = 'timer-show';
      timer_show.textContent = '未設定';

      const timer_button = document.createElement('span');
      timer_button.className = 'timer-button';

      const timer_button_img = document.createElement('img');
      timer_button_img.src = baseurl + 'kancollet/img/setting_button.png';
      timer_button_img.alt = '設定';
      timer_button_img.width = '14';
      timer_button_img.height = '14';
      timer_button.appendChild(timer_button_img);

      td.appendChild(timer_name);
      td.appendChild(timer_show);
      td.appendChild(timer_button);

      this.element = td;
      this.timer_show = timer_show;

      this.restoreFromCookie();
      return this.element;
    }

    saveToCookie() {
      if (this.timer) {
        const expire = new Date(this.endtime);
        Cookie.save(this.cookie_key, this.endtime.toString(), expire);
      }
    }

    removeFromCookie() {
      if (this.timer) {
        return;
      }
      Cookie.remove(this.cookie_key);
    }

    restoreFromCookie() {
      if (this.timer) {
        return;
      }
      const value = Cookie.restore(this.cookie_key);

      if (value === '') {
        return;
      }
      const endtime = parseInt(value, 10);
      const remain = endtime - Date.now();
      if (remain > 0) {
        const timestr = timeToReadableStr(msToTime(remain));
        this.setTime(timestr);
        this.startTimer();
      }
    }

    setTime(time) {
      this.time = time;
      this.timer_show.textContent = time;
    }

    isElapsed() {
      return this.timer && this.endtime - Date.now() <= 0;
    }

    startTimer() {
      if (!this.timer && this.time) {
        const time = parseTime(this.time);
        if (!time) {
          return false;
        }
        this.enableAlarm();
        this.changeBGColor('default');
        this.endtime = Date.now() + (time.hour * 3600 + time.min * 60 + time.sec) * 1000;
        this.timer = setInterval(
          (timer) => {
            timer.showTimer();
          },
          500,
          this,
        );
        this.last_time = this.time;
        this.saveToCookie();
      } else {
        return false;
      }
      return true;
    }

    stopTimer() {
      if (this.timer) {
        if (this.isElapsed()) {
          this.timer_show.textContent = '完了';
          this.changeBGColor('complete');
          this.notification();
        }
        this.clearTimer();
        this.removeFromCookie();
        TimerSetting.changeButtonEnable();
      } else {
        return false;
      }
      return true;
    }

    clearTimer() {
      clearInterval(this.timer);
      this.time = this.last_time;
      this.timer = null;
      this.endtime = null;
      return true;
    }

    showTimer() {
      const remain = this.endtime - Date.now();
      if (remain <= 0) {
        this.stopTimer();
        return false;
      }
      const timestr = timeToReadableStr(msToTime(remain));
      this.setTime(timestr);
    }

    changeBGColor(key) {
      const bgcolors = {
        default: '',
        complete: '#a0f05a',
      };
      if (bgcolors[key] !== undefined) {
        this.element.style.backgroundColor = bgcolors[key];
      } else {
        return false;
      }
    }

    changeOpacity(key) {
      const opacities = {
        default: '',
        selected: 'selected-timer',
      };
      if (opacities[key] !== undefined) {
        this.element.childNodes[2].id = opacities[key];
      } else {
        return false;
      }
    }

    enableAlarm() {
      if (!this.alarm) {
        this.alarm = new Alarm();
      }
      return this;
    }

    disableAlarm() {
      this.alarm = null;
      return true;
    }

    notification() {
      this.showNotification();
      this.playAlarm();
    }

    showNotification() {
      if (!window.Notification) {
        return false;
      }
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      if (!window.document.hasFocus()) {
        const notification = new Notification('Kancollet', {
          lang: 'ja-JP',
          body: '「' + this.name + '」が完了しました',
          icon: baseurl + 'kancollet/img/kancollet_icon.png',
        });
        notification.addEventListener('click', () => {
          notification.close();
          window.focus();
        });
      }
    }

    playAlarm() {
      if (this.alarm) {
        this.alarm.play();
      } else {
        this.enableAlarm();
        this.alarm.play();
      }
    }
  }

  //////////////////////////////////
  // Alarm
  class Alarm {
    #alarm;

    constructor() {
      this.#alarm = new window.Audio();
      this.#prepare();
    }

    static VOLUME = 0.9;

    static #canPlayTypes() {
      const audio = new window.Audio();
      const types = [];
      if (audio.canPlayType('audio/ogg') !== '') {
        types.push('.ogg');
      }
      if (audio.canPlayType('audio/mp3') !== '') {
        types.push('.mp3');
      }
      if (audio.canPlayType('audio/wav') !== '') {
        types.push('.wav');
      }

      return types;
    }

    static #setPlayType() {
      const types = Alarm.#canPlayTypes();
      if (types[0]) {
        Alarm.PLAYTYPE = types[0];
      } else {
        return false;
      }
    }

    #prepare() {
      if (!Alarm.playType) {
        Alarm.#setPlayType();
      }
      this.#alarm.src = alarm_basename + Alarm.PLAYTYPE;
      this.#alarm.load();
      this.#alarm.volume = Alarm.VOLUME;
    }

    play() {
      this.#alarm.play();
    }
  }

  //////////////////////////////////
  // TimersTable
  class TimersTable {
    constructor() {
      this.element = null;
      this.timers = {};
    }

    remove() {
      const timer_keys = Object.keys(this.timers);
      for (let i = 0; i < timer_keys.length; ++i) {
        const timer = this.timers[timer_keys[i]];
        timer.clearTimer();
        timer.disableAlarm();
      }
    }

    appendElement() {
      const table = document.createElement('table');
      table.id = 'kancollet-timers-table';

      const types = [
        ['expedition', '遠征'],
        ['dock', '入渠'],
        ['arsenal', '建造'],
      ];

      for (let i = 0; i < types.length; i += 1) {
        const tr = table.insertRow(-1);
        const th = document.createElement('th');
        th.setAttribute('id', types[i][0]);
        th.setAttribute('scope', 'row');
        th.textContent = types[i][1];
        tr.appendChild(th);
      }
      this.element = document.getElementById('kancollet-timers-form').appendChild(table);
    }

    addTimer(name, type, id) {
      const key = type + '-' + id.toString();

      if (!this.timers[key]) {
        const timer = new Timer(name, type, id);
        const rows = this.element.rows;
        let tr = null;

        for (let i = 0; i < rows.length; i += 1) {
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
    }

    removeTimer(type, id) {
      const key = type + '-' + id.toString();
      const timer = this.timers[key];

      if (timer) {
        const parentnode = timer.element.parentNode;
        parentnode.removeChild(timer.element);
        delete this.timers[key];
        return true;
      }

      return false;
    }
  }

  //////////////////////////////////
  // TimerSetting
  const TimerSetting = {
    target_timer: null,

    setTargetTimer(id) {
      const key = /timer-(\w+-\d)/.exec(id)[1];
      const new_target_timer = ns.timers_table.timers[key];
      if (new_target_timer) {
        if (this.target_timer) {
          this.target_timer.changeOpacity('default');
        }
        this.target_timer = new_target_timer;
        this.target_timer.changeOpacity('selected');
        this.target_timer.changeBGColor('default');

        const time_input = document.getElementById('kancollet-timersetting-time');
        time_input.disabled = false;
        if (this.target_timer.time) {
          time_input.value = this.target_timer.time;
        } else {
          time_input.value = '00:00:00';
        }
        this.changeButtonEnable();
        time_input.focus();
        return true;
      }
      return false;
    },

    setTimer() {
      if (this.target_timer && !this.target_timer.timer) {
        const time_input = document.getElementById('kancollet-timersetting-time');
        const formatted = timeToReadableStr(parseTime(time_input.value));
        time_input.value = formatted;

        this.target_timer.changeBGColor('default');
        this.target_timer.setTime(time_input.value.length > 0 ? formatted : '未設定 ');
      }
    },

    startTimer() {
      if (this.target_timer && !this.target_timer.timer) {
        this.setTimer();
        if (!this.target_timer.startTimer()) {
          window.alert('書式が間違っています。正しい書式で入れなおしてください。');
        }
        this.changeButtonEnable();
      }
    },

    stopTimer() {
      if (this.target_timer) {
        this.target_timer.stopTimer();
        this.changeButtonEnable();
      }
    },

    changeButtonEnable() {
      const start_button = document.getElementById('kancollet-timersetting-start');
      const stop_button = document.getElementById('kancollet-timersetting-stop');
      if (this.target_timer.timer) {
        start_button.disabled = true;
        stop_button.disabled = false;
      } else {
        start_button.disabled = false;
        stop_button.disabled = true;
      }
    },
  };

  //////////////////////////////////
  // Preset
  const Preset = {
    selectedType: 'expedition',

    expedition: [
      { id: '1', time: '00:15:00', name: '練習航海' },
      { id: '2', time: '00:30:00', name: '長距離練習航海' },
      { id: '3', time: '00:20:00', name: '警備任務' },
      { id: '4', time: '00:50:00', name: '対潜警戒任務' },
      { id: '5', time: '01:30:00', name: '海上護衛任務' },
      { id: '6', time: '00:40:00', name: '防空射撃演習' },
      { id: '7', time: '01:00:00', name: '観艦式予行' },
      { id: '8', time: '03:00:00', name: '観艦式' },
      { id: '9', time: '04:00:00', name: 'タンカー護衛任務' },
      { id: '10', time: '01:30:00', name: '強行偵察任務' },
      { id: '11', time: '05:00:00', name: 'ボーキサイト輸送任務' },
      { id: '12', time: '08:00:00', name: '資源輸送任務' },
      { id: '13', time: '04:00:00', name: '鼠輸送作戦' },
      { id: '14', time: '06:00:00', name: '包囲陸戦隊撤収作戦' },
      { id: '15', time: '12:00:00', name: '囮機動部隊支援作戦' },
      { id: '16', time: '15:00:00', name: '艦隊決戦援護作戦' },
      { id: '17', time: '00:45:00', name: '敵地偵察作戦' },
      { id: '18', time: '05:00:00', name: '航空機輸送作戦' },
      { id: '19', time: '06:00:00', name: '北号作戦' },
      { id: '20', time: '02:00:00', name: '潜水艦哨戒任務' },
      { id: '21', time: '02:20:00', name: '北方鼠輸送作戦' },
      { id: '22', time: '03:00:00', name: '艦隊演習' },
      { id: '23', time: '04:00:00', name: '航空戦艦運用演習' },
      { id: '24', time: '08:20:00', name: '北方航路海上護衛' },
      { id: '25', time: '40:00:00', name: '通商破壊作戦' },
      { id: '26', time: '80:00:00', name: '敵母港空襲作戦' },
      { id: '27', time: '20:00:00', name: '潜水艦通商破壊作戦' },
      { id: '28', time: '25:00:00', name: '西方海域封鎖作戦' },
      { id: '29', time: '24:00:00', name: '潜水艦派遣演習' },
      { id: '30', time: '48:00:00', name: '潜水艦派遣作戦' },
      { id: '31', time: '02:00:00', name: '海外艦との接触' },
      { id: '32', time: '24:00:00', name: '遠洋練習航海' },
      { id: '35', time: '07:00:00', name: 'MO作戦' },
      { id: '36', time: '09:00:00', name: '水上機基地建設' },
      { id: '37', time: '02:45:00', name: '東京急行' },
      { id: '38', time: '02:55:00', name: '東京急行（弐）' },
      { id: '39', time: '30:00:00', name: '遠洋潜水艦作戦' },
      { id: '40', time: '06:50:00', name: '水上機前線輸送' },
    ].sort((a, b) => (a.time > b.time ? 1 : -1)),

    arsenal: [
      { time: '00:18:00', name: '睦月' },
      { time: '00:20:00', name: '吹雪 綾波 暁 初春' },
      { time: '00:22:00', name: '白露 朝潮 潜水艦' },
      { time: '00:24:00', name: '陽炎 雪風 Z1 Z3' },
      { time: '00:30:00', name: '島風' },
      { time: '01:00:00', name: '天龍 球磨 長良 川内 (阿賀野) 古鷹 青葉' },
      { time: '01:10:00', name: '香取 (鹿島)' },
      { time: '01:15:00', name: '鬼怒 阿武隈' },
      { time: '01:20:00', name: '妙高' },
      { time: '01:22:00', name: '夕張' },
      { time: '01:25:00', name: '高雄' },
      { time: '01:30:00', name: '利根 最上' },
      { time: '02:00:00', name: '鳳翔' },
      { time: '02:20:00', name: '千歳 (瑞穂 神威)' },
      { time: '02:30:00', name: '(あきつ丸)' },
      { time: '02:40:00', name: '祥鳳・瑞鳳' },
      { time: '02:50:00', name: '龍驤' },
      { time: '03:00:00', name: '飛鷹・隼鷹' },
      { time: '03:20:00', name: '(伊401)' },
      { time: '03:40:00', name: '(速吸)' },
      { time: '04:00:00', name: '金剛' },
      { time: '04:10:00', name: '蒼龍 飛龍 (Ark Royal)' },
      { time: '04:20:00', name: '扶桑 加賀' },
      { time: '04:30:00', name: '伊勢 赤城' },
      { time: '04:40:00', name: '(Warspite)' },
      { time: '05:00:00', name: '長門 (Bismarck)' },
      { time: '05:30:00', name: '(Saratoga)' },
      { time: '06:00:00', name: '翔鶴 瑞鶴' },
      { time: '06:40:00', name: '(大鳳)' },
      { time: '08:00:00', name: '(大和)' },
    ],

    renderElement(filterText) {
      const list = document.createElement('ul');
      list.id = 'kancollet-timer-preset';
      list.role = 'menu';
      list.tabIndex = '-1';
      list.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          ev.target.nextElementSibling?.focus();
        } else if (ev.key === 'ArrowUp') {
          ev.preventDefault();
          const prev = ev.target.previousElementSibling;
          if (prev) {
            prev?.focus();
          } else {
            const time_input = document.getElementById('kancollet-timersetting-time');
            time_input.focus();
          }
        }
      });

      const options = Preset[Preset.selectedType] ?? [];
      for (let i = 0; i < options.length; ++i) {
        const preset = options[i];

        const text = `${preset.time} ${preset.name}`;
        if (filterText != null && !text.includes(filterText)) continue;

        const setValue = () => {
          const time_input = document.getElementById('kancollet-timersetting-time');
          time_input.value = preset.time;
          Preset.hide();
          time_input.focus();
        };

        const item = document.createElement('li');
        item.className = 'kancollet-timer-preset-item';
        item.role = 'menuitem';
        item.tabIndex = '-1';
        item.textContent = text;
        item.addEventListener('click', () => {
          setValue();
        });
        item.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === 'Space') {
            ev.preventDefault();
            setValue();
          }
        });

        list.appendChild(item);
      }
      if (list.children.length === 0) {
        list.style.visibility = 'hidden';
      }

      if (Preset.element) {
        Preset.element.replaceWith(list);
      }
      Preset.element = list;
    },
    createElement() {
      Preset.renderElement();
      return Preset.element;
    },
    filterOptions(filterText) {
      Preset.renderElement(filterText);
    },
    show() {
      Preset.renderElement();
      Preset.element.style.visibility = 'visible';
    },
    hide() {
      Preset.element.style.visibility = 'hidden';
    },
  };

  const checkCSSExists = () => {
    const links = document.getElementsByTagName('link');
    for (let i = links.length - 1; i >= 0; i -= 1) {
      if (links[i].href.indexOf('kancollet.css') >= 0) {
        return true;
      }
    }
    return false;
  };

  const ns = {
    Timer,
    TimersTable,
    TimerSetting,
    create() {
      if (document.getElementById('kancollet')) return;

      const kancollet_stylesheet = document.createElement('link');
      kancollet_stylesheet.rel = 'stylesheet';
      kancollet_stylesheet.href = baseurl + 'kancollet/kancollet.css';

      const kancollet = document.createElement('div');
      kancollet.id = 'kancollet';

      const kancollet_timers_form = document.createElement('form');
      kancollet_timers_form.id = 'kancollet-timers-form';

      const kancollet_timersetting_form = document.createElement('form');
      kancollet_timersetting_form.id = 'kancollet-timersetting-form';
      kancollet_timersetting_form.addEventListener('submit', (ev) => {
        Kancollet.TimerSetting.startTimer();
        ev.preventDefault();
      });

      const kancollet_timersetting_preset = Preset.createElement();
      Preset.hide();

      const kancollet_timersetting_time = document.createElement('input');
      kancollet_timersetting_time.id = 'kancollet-timersetting-time';
      kancollet_timersetting_time.type = 'text';
      kancollet_timersetting_time.disabled = true;
      kancollet_timersetting_time.addEventListener('change', () => {
        Kancollet.TimerSetting.setTimer();
      });
      kancollet_timersetting_time.addEventListener('input', (ev) => {
        Preset.filterOptions(ev.currentTarget.value);
      });
      kancollet_timersetting_time.addEventListener('focus', () => {
        Preset.selectedType = TimerSetting.target_timer.type;
        Preset.show();
      });
      kancollet_timersetting_time.addEventListener('blur', () => {
        setTimeout(() => {
          if (Preset.element.contains(document.activeElement)) return;
          Preset.hide();
        }, 50);
      });
      kancollet_timersetting_time.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          Preset.element.firstChild.focus();
        }
      });

      const kancollet_timersetting_start = document.createElement('button');
      kancollet_timersetting_start.id = 'kancollet-timersetting-start';
      kancollet_timersetting_start.type = 'submit';
      kancollet_timersetting_start.textContent = '開始';
      kancollet_timersetting_start.disabled = true;

      const kancollet_timersetting_stop = document.createElement('button');
      kancollet_timersetting_stop.id = 'kancollet-timersetting-stop';
      kancollet_timersetting_stop.type = 'button';
      kancollet_timersetting_stop.textContent = '停止';
      kancollet_timersetting_stop.disabled = true;
      kancollet_timersetting_stop.addEventListener('click', () => {
        Kancollet.TimerSetting.stopTimer();
      });

      kancollet_timersetting_form.appendChild(kancollet_timersetting_time);
      kancollet_timersetting_form.appendChild(kancollet_timersetting_preset);
      kancollet_timersetting_form.appendChild(kancollet_timersetting_start);
      kancollet_timersetting_form.appendChild(kancollet_timersetting_stop);

      const kancollet_banner = document.createElement('div');
      kancollet_banner.id = 'kancollet-banner';

      const kancollet_banner_softwarename = document.createElement('img');
      kancollet_banner_softwarename.id = 'kancollet-banner-softwarename';
      kancollet_banner_softwarename.src = baseurl + 'kancollet/img/kancollet.svg';
      kancollet_banner_softwarename.alt = 'Kancollet';
      kancollet_banner_softwarename.width = '80';

      const kancollet_banner_close = document.createElement('button');
      kancollet_banner_close.type = 'button';
      kancollet_banner_close.id = 'kancollet-banner-close';
      kancollet_banner_close.addEventListener('click', () => {
        Kancollet.remove();
      });
      const kancollet_banner_closeimg = document.createElement('img');
      kancollet_banner_closeimg.id = 'kancollet-banner-closeimg';
      kancollet_banner_closeimg.src = baseurl + 'kancollet/img/close_button.png';
      kancollet_banner_closeimg.alt = '閉じる';
      kancollet_banner_closeimg.width = '16';
      kancollet_banner_closeimg.height = '16';
      kancollet_banner_close.appendChild(kancollet_banner_closeimg);

      const kancollet_banner_cleardiv = document.createElement('div');
      kancollet_banner_cleardiv.className = 'clear';
      kancollet_banner_cleardiv.appendChild(document.createElement('hr'));

      kancollet_banner.appendChild(kancollet_banner_softwarename);
      kancollet_banner.appendChild(kancollet_banner_close);
      kancollet_banner.appendChild(kancollet_banner_cleardiv);

      kancollet.appendChild(kancollet_timers_form);
      kancollet.appendChild(kancollet_timersetting_form);
      kancollet.appendChild(kancollet_banner);

      if (!checkCSSExists()) {
        document.head.appendChild(kancollet_stylesheet);
      }
      document.body.appendChild(kancollet);

      const timers_table = new TimersTable();
      timers_table.appendElement();

      timers_table.addTimer('第二艦隊', 'expedition', 1);
      timers_table.addTimer('第三艦隊', 'expedition', 2);
      timers_table.addTimer('第四艦隊', 'expedition', 3);

      timers_table.addTimer('ドック1', 'dock', 1);
      timers_table.addTimer('ドック2', 'dock', 2);
      timers_table.addTimer('ドック3', 'dock', 3);
      timers_table.addTimer('ドック4', 'dock', 4);

      timers_table.addTimer('ドック1', 'arsenal', 1);
      timers_table.addTimer('ドック2', 'arsenal', 2);
      timers_table.addTimer('ドック3', 'arsenal', 3);
      timers_table.addTimer('ドック4', 'arsenal', 4);

      ns.timers_table = timers_table;
    },
    remove() {
      this.timers_table.remove();
      document.body.removeChild(document.getElementById('kancollet'));
    },
  };
  return ns;
})();
window.Kancollet.create();
