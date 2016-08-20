---
layout: page
title: About
permalink: /about/
weight: "01"
---

## 概要
Kancolletは、「艦隊これくしょん -艦これ-」専用のタイマーアプリケーションです。遠征・入渠・建造の完了を通知します。
[ブックマークレット](https://support.mozilla.org/ja/kb/bookmarklets-perform-common-web-page-tasks)として実装されており、ブラウザで動作します。

## 特徴
インストールが簡単
:	お気に入り・ブックマークに追加するだけで使えます。なお、[ブラウザ拡張機能版](#extension)もあります。

マルチプラットフォーム
:	ブラウザがKancolletに対応していれば、あらゆるOS上で動作します。

常に最新版を利用可能
:	常に最新版のKancolletが起動します。アップデート作業は必要ありません。

## 機能
* 遠征3つ・入渠4つ・建造4つのタイマー
* 通知機能（アラーム音とブラウザ通知）
* 遠征時間のプリセット（現在、24時間までの遠征に対応）
* ブラウザ再開時のタイマ値の復元

## インストール・アンインストール
ブックマークに追加すると、Kancolletを使えるようになります。
ブックマークから削除することで、アンインストールできます。
アップデートは自動的に行われますので、
アップデートの際に毎回ブックマークしなおす必要はありません。

## 対応ブラウザ
[Wikiの必要要件ページ](https://github.com/syusui-s/kancollet/wiki/SystemRequirement)に対応しているブラウザが載っています。
今のところ、WebkitとGeckoで動いてくれています。Trident？いえ、知らない子ですね。

確認環境はArch Linux(x86\_64)で、
ブラウザはいずれも標準のリポジトリから入手できるパッケージのものを使用しています。

## ブラウザ拡張機能版 {#extension}
ブックマークレットを普段使用されない方や毎回の起動が面倒な人のために、
Google ChromeやFirefox、Operaなどで利用できるブラウザ拡張版を用意しました。
普段から艦これをプレイされる方におすすめです。
入手方法や説明は、Wikiの[ブラウザ拡張版のページ](https://github.com/syusui-s/kancollet/wiki/BrowserExtension)をご覧ください。

## 詳細情報
詳細な使用方法や改造したい人向けの設計資料は、
[Wiki](https://github.com/syusui-s/kancollet/wiki)に載っています。

## 開発への貢献・改造
Kancolletの開発を手伝っていただけると幸いです。バグ報告や機能要望でも励みになります。

コードを実装される方は、GithubアカウントとGitの知識が必要です。
まず[課題一覧](https://github.com/syusui-s/kancollet/issues)に課題を登録してください。
登録したら、リポジトリをフォークしてください。課題に関連した名前のブランチを作成して、そこで作業を行います。
作業を終えたら、作業を一つのコミットにまとめた上で、developブランチへのプルリクエストを作成してください。
[マージされたら課題をクローズする](https://github.com/blog/1506-closing-issues-via-pull-requests)ようにプルリクエストの本文を書いてください。

寄稿されたコードは、MIT Licenseの下で公開されます。
寄稿者として記録するために、AUTHORSファイルに`名前 <メールアドレス>`のフォーマットで記入してください。記入済みの場合は不要です。

## ライセンス
本ソフトウェアに、MIT Licenseを適用します。
ライセンスは、[LICENSEファイル](https://github.com/syusui-s/kancollet/blob/master/LICENSE)に記述されています。
非英語話者の方は、[MIT Licenseの和訳](https://osdn.jp/projects/opensource/wiki/licenses/MIT_license)を参考にしてください。
ただし、これは単に和訳であって、適用されるライセンス自体ではないことに注意してください。

## お問い合わせ
本ソフトウェアは、Shusui Moyataniが作成しました。
syusui.s(a)gmail.comか、[@syusui\_s](https://twitter.com/syusui_s)までご連絡ください。
不具合の報告や機能要望は、[Kancolletの課題ページ](https://github.com/syusui-s/kancollet/issues)で受け付けております。
Githubアカウントをお持ちでない方は、上記の連絡手段でご報告ください。
