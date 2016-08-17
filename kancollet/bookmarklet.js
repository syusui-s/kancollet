// Kancolletをあなたのブックマークに加えたいのであれば、
// このスクリプトの5行目をコピーして、『新しいブックマーク』のURL欄にペーストしてください。
// ブックマーク名は、自由につけてください。
javascript:(function(){if(document.getElementById('kancollet_script')){Kancollet.create();}else{var e=document.createElement('script');e.setAttribute('language','javascript');e.id='kancollet_script';e.setAttribute('src','http://syusui-s.github.io/kancollet/kancollet-master/kancollet/kancollet.js');e.setAttribute('charset', 'UTF-8');document.head.appendChild(e);}}());

// 最新の開発版を利用したい場合は、8行目をコピーして、通常の方法と同様にブックマークに追加してください。
// Github非公式のRawgitを使用していますので、もしかするとサービス終了に伴って開発版のブックマークレットを変更するかもしれません。
javascript:(function(){if(document.getElementById('kancollet_script')){Kancollet.create();}else{var e=document.createElement('script');e.setAttribute('language','javascript');e.id='kancollet_script';e.setAttribute('src','https://raw.githubusercontent.com/syusui-s/kancollet/develop/kancollet/kancollet.js');e.setAttribute('charset', 'UTF-8');document.head.appendChild(e);}}());
