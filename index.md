---
layout: page
kancollet-code: "javascript:(function(){if(document.getElementById('kancollet_script')){Kancollet.create();}else{var e=document.createElement('script');e.setAttribute('language','javascript');e.id='kancollet_script';e.type='text/javascript';e.setAttribute('src','https://syusui-s.github.io/kancollet/kancollet-master/kancollet/kancollet.js');e.setAttribute('charset','UTF-8');document.head.appendChild(e);}}());"
---

<img id="screenshot" src="{{ '/images/screenshot.png' | prepend: site.baseurl }}" width="820" alt="Kancolletのスクリーンショットをこの文章の位置に掲載しています。">

<div class="big-centered">
<p>
Kancolletは「艦隊これくしょん -艦これ-」の
遠征・入渠・建造の終了を教えてくれるタイマーです。
</p>
<div id="add-bookmark">
<script>
window.addEventListener('load', function() {
	document.querySelector('a#bookmarklet').addEventListener('click', function(ev) {
		window.alert('ブックマークバーにドラッグするか、リンクをコピーしてブックマークに登録してください。');
		ev.preventDefault();
	});
});
</script>
<noscript>
ご利用のブラウザは、Javascriptに対応していません。Kancolletの実行には、Javascriptに対応したブラウザがが必要です。
</noscript>
<a id="bookmarklet" href="{{ page.kancollet-code }}">Kancollet</a>
</div>
<p>
ブックマークに追加するだけで、すぐに使えます。
</p>
</div>

使い方
------

ブックマークにKancolletを追加しましょう。追加するには、次のいずれか方法を試してください。

- 上のボタンをブックマークにドラック＆ドロップする。
- [リンクアドレス]({{ page.kancollet-code }})をコピーして、ブックマークを作成する。URL欄にリンクアドレスは設定します。

追加し終わったら、

1.  [艦隊これくしょん](http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/)を開きます。
2.  ブックマークに追加したKancolletをクリックします。
3.  上部にKancolletのウィンドウが開きます。
4.  設定したいタイマーの設定ボタン（![設定ボタン]({{ "/kancollet-master/kancollet/img/setting_button.png" | prepend: site.baseurl }})）を押して、右の入力欄から時間をセットします。
5.  「開始」を押し、タイマーを始動させます。
6.  時間が来たら、表示は「完了」に変わります。

