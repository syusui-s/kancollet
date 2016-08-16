(function() {
	window.alert("KancolletのURLが変更されました。お手数ながら、ブックマークの変更をお願いします。");
	var res = window.confirm("OKを押すと、公式ページに遷移します。よろしいですか？");
	if (res) {
		location.href = "http://syusui-s.github.io/kancollet/";
	}
})();
